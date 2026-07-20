// apps/web/lib/visualizer/procedural.ts
// Stochastic tiling: cobre o canvas-alvo com patches do seamless,
// cada um com offset/rotation/mirror/scale aleatórios.
// Quebra o "carimbo" mesmo se o seamless já estiver bom.

import { RenderOptions } from './types';

// PRNG determinístico (mulberry32)
export function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fator de cobertura: um quadrado rotacionado precisa de lado * sqrt(2)
// para, em QUALQUER ângulo, cobrir totalmente a célula da grade. Sem isso,
// as quinas giram para dentro e deixam frestas — que aparecem como riscos
// escuros (o fundo vazio do canvas) na imagem final.
const COVER = 1.55; // sqrt(2) ≈ 1.41 + folga para jitter/scale

export function stochasticTile(
  target: HTMLCanvasElement,
  seamless: HTMLCanvasElement,
  opt: Required<Pick<RenderOptions, 'jitter' | 'rotationDeg' | 'mirrorChance' | 'seed'>> & { tilePx: number },
): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = target.width; out.height = target.height;
  const ctx = out.getContext('2d')!;
  const rand = rng(opt.seed);

  const tp = opt.tilePx;
  // patch desenhado maior que a célula para garantir sobreposição total
  const draw = tp * COVER;
  const overlap = tp * 0.15;       // overlap da GRADE (espaçamento das células)
  const step = tp - overlap;

  // 1) preenche o fundo com a cor média do seamless — garante que, mesmo
  //    que sobrasse alguma fresta, ela teria a cor do tecido e não preto.
  ctx.fillStyle = meanColor(seamless);
  ctx.fillRect(0, 0, out.width, out.height);

  // grid hexagonal (linhas alternadas deslocadas → menos alinhamento óbvio)
  const cols = Math.ceil(out.width / step) + 3;
  const rows = Math.ceil(out.height / step) + 3;

  for (let r = -1; r < rows; r++) {
    for (let c = -1; c < cols; c++) {
      const offX = (r % 2) * (step / 2);
      const px = c * step + offX + (rand() - 0.5) * opt.jitter * tp;
      const py = r * step + (rand() - 0.5) * opt.jitter * tp;

      const rot = ((rand() - 0.5) * 2 * opt.rotationDeg) * Math.PI / 180;
      const flipX = rand() < opt.mirrorChance ? -1 : 1;
      const flipY = rand() < opt.mirrorChance * 0.5 ? -1 : 1;
      const scale = 1 + (rand() - 0.5) * 0.08;

      // sample offset dentro do seamless (varia o conteúdo do mesmo tile)
      const sx = rand() * seamless.width;
      const sy = rand() * seamless.height;

      ctx.save();
      ctx.translate(px + tp / 2, py + tp / 2);
      ctx.rotate(rot);
      ctx.scale(flipX * scale, flipY * scale);
      // desenha um patch `draw`×`draw` (> célula) centrado → cobre vizinhos
      drawSeamlessSampled(ctx, seamless, sx, sy, draw);
      ctx.restore();
    }
  }

  // cross-fade leve com noise alpha pra esconder bordas residuais
  applyNoiseMask(out, opt.seed);

  return out;
}

function drawSeamlessSampled(
  ctx: CanvasRenderingContext2D,
  seamless: HTMLCanvasElement,
  sx: number, sy: number,
  size: number,
) {
  // pinta size×size começando em (sx,sy) no espaço do seamless (com wrap)
  // estratégia: pattern repeat shiftado
  const pat = ctx.createPattern(seamless, 'repeat')!;
  const m = new DOMMatrix().translate(-sx, -sy);
  (pat as any).setTransform?.(m);
  ctx.fillStyle = pat;
  ctx.fillRect(-size / 2, -size / 2, size, size);
}

/** Cor média do seamless — usada como fundo de segurança. */
function meanColor(canvas: HTMLCanvasElement): string {
  const c = document.createElement('canvas');
  c.width = 1; c.height = 1;
  const cx = c.getContext('2d')!;
  cx.imageSmoothingEnabled = true;
  cx.drawImage(canvas, 0, 0, 1, 1);
  const [r, g, b] = cx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

function applyNoiseMask(canvas: HTMLCanvasElement, seed: number) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width, h = canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const rand = rng(seed ^ 0x9e3779b9);
  for (let i = 0; i < d.length; i += 4) {
    // perturbação leve em luminance (preserva cor)
    const n = (rand() - 0.5) * 2.5;
    d[i] = clamp(d[i] + n);
    d[i + 1] = clamp(d[i + 1] + n);
    d[i + 2] = clamp(d[i + 2] + n);
  }
  ctx.putImageData(img, 0, 0);
}
const clamp = (v: number) => v < 0 ? 0 : v > 255 ? 255 : v;
