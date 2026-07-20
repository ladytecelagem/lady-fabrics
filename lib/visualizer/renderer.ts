// apps/web/lib/visualizer/renderer.ts
// FabricRenderer — API pública. Orquestra: seamless → stochastic tile →
// shading extract → composite. Usa cache p/ seamless e shading.
//
// Qualidade: renderiza internamente em SSAA 2× (supersampling) e dá downscale
// final com filtragem 'high' — elimina serrilhado/aliasing do tiling.
// Quando o tile fica muito pequeno, usa um mip do seamless (já reduzido por
// área) como fonte, evitando o moiré de minificação do createPattern.

import { FabricInput, FurnitureInput, RenderOptions, RenderResult, ImgSrc } from './types';
import { makeSeamless } from './seamless';
import { stochasticTile } from './procedural';
import { extractShading } from './shading';
import { composite } from './blend';
import { seamlessCache, shadingCache } from './cache';

const DEFAULTS: Required<Omit<RenderOptions, 'seed'>> & { seed: number } = {
  tileCm: 30, jitter: 0.35, rotationDeg: 6,
  mirrorChance: 0.5, microDetail: 0.6,
  shadingStrength: 1.0, seed: 1, swatchScale: 1.0,
};

// presets por categoria de tecido
const CATEGORY_PRESETS: Record<string, Partial<RenderOptions>> = {
  plain:    { jitter: 0.25, rotationDeg: 3, microDetail: 0.35 },
  linen:    { jitter: 0.35, rotationDeg: 5, microDetail: 0.55 },
  boucle:   { jitter: 0.55, rotationDeg: 10, microDetail: 0.85 },
  tweed:    { jitter: 0.45, rotationDeg: 8, microDetail: 0.75 },
  chenille: { jitter: 0.40, rotationDeg: 7, microDetail: 0.70 },
  jacquard: { jitter: 0.30, rotationDeg: 4, microDetail: 0.50 },
  organic:  { jitter: 0.60, rotationDeg: 12, microDetail: 0.80 },
};

// Fator de supersampling. 2 = render interno em 4× a área, downscale no final.
const SSAA = 2;

export class FabricRenderer {
  render(fab: FabricInput, fur: FurnitureInput, opt: RenderOptions = {}): RenderResult {
    const t0 = performance.now();
    const W = (fur.base as any).width, H = (fur.base as any).height;

    const preset = CATEGORY_PRESETS[fab.category ?? 'plain'] ?? {};
    const o = { ...DEFAULTS, ...preset, ...opt };

    // resolução interna de trabalho (supersampled)
    const SW = W * SSAA, SH = H * SSAA;

    // 1) seamless (cache key: swatch ref)
    const swatchKey = (fab.swatch as any).src ?? fab.swatch;
    let seamless = seamlessCache.get(swatchKey);
    if (!seamless) {
      seamless = makeSeamless(fab.swatch, { size: 1024, feather: 144 });
      seamlessCache.set(swatchKey, seamless);
    }

    // 2) shading: respeita pré-processado do admin se vier; senão extrai
    let shading: HTMLCanvasElement;
    if (fur.shading) {
      shading = toCanvas(fur.shading, SW, SH);
    } else {
      const shKey = `${(fur.base as any).src ?? ''}::${(fur.mask as any).src ?? ''}::${SW}x${SH}`;
      let cached = shadingCache.get(shKey);
      if (!cached) {
        cached = extractShading(fur.base, fur.mask, SW, SH).shading;
        shadingCache.set(shKey, cached);
      }
      shading = cached;
    }

    // 3) stochastic tile — em resolução supersampled
    const ss = o.swatchScale ?? 1.0;
    // tilePx na escala interna (SSAA): multiplica pelo fator de supersampling
    const tilePx = Math.max(2, Math.round(Math.min(SW, SH) / 23 * ss * (o.tileCm / 30)));

    // fonte do tile: se o tile for pequeno em relação ao seamless, usa um mip
    // (seamless reduzido por área) — drawImage então amostra de uma fonte já
    // suavizada, sem o aliasing de minificação agressiva.
    const tileSrc = mipForTile(seamless, tilePx);

    const target = document.createElement('canvas');
    target.width = SW; target.height = SH;
    const tiled = stochasticTile(target, tileSrc, {
      jitter: o.jitter,
      rotationDeg: o.rotationDeg,
      mirrorChance: o.mirrorChance,
      seed: o.seed,
      tilePx,
    });

    // 4) composite final — em resolução supersampled
    const baseC = toCanvas(fur.base, SW, SH);
    const hi = composite({
      base: baseC,
      fabric: tiled,
      shading,
      mask: fur.mask,
      shadingStrength: o.shadingStrength,
      microDetail: o.microDetail,
      swatchForDetail: fab.swatch,
    });

    // 5) downscale SSAA → resolução real, com filtragem de alta qualidade
    const canvas = downscale(hi, W, H);

    return { canvas, ms: performance.now() - t0 };
  }
}

/**
 * Devolve a fonte de tile mais adequada para `tilePx`. Se o tile alvo for
 * bem menor que o seamless, gera (e cacheia) um mip reduzido por área via
 * downscale em passos de 2× — fonte limpa, sem moiré.
 */
const _mipCache = new WeakMap<HTMLCanvasElement, Map<number, HTMLCanvasElement>>();
function mipForTile(seamless: HTMLCanvasElement, tilePx: number): HTMLCanvasElement {
  const src = seamless.width;
  // alvo: o mip não precisa ser menor que ~2× o tile renderizado
  let targetSize = src;
  while (targetSize > tilePx * 2 && targetSize > 32) targetSize = Math.round(targetSize / 2);
  if (targetSize >= src) return seamless;

  let perTile = _mipCache.get(seamless);
  if (!perTile) { perTile = new Map(); _mipCache.set(seamless, perTile); }
  const hit = perTile.get(targetSize);
  if (hit) return hit;

  // downscale em passos de 2× preserva o conteúdo melhor que um salto único
  let cur = seamless;
  let size = src;
  while (size > targetSize) {
    const next = Math.max(targetSize, Math.round(size / 2));
    const c = document.createElement('canvas');
    c.width = next; c.height = next;
    const cx = c.getContext('2d')!;
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(cur, 0, 0, next, next);
    cur = c;
    size = next;
  }
  perTile.set(targetSize, cur);
  return cur;
}

/** Downscale com filtragem de alta qualidade (passos de 2× até a resolução real). */
function downscale(src: HTMLCanvasElement, W: number, H: number): HTMLCanvasElement {
  let cur = src;
  // reduz pela metade enquanto estiver acima do alvo (média de área = anti-alias)
  while (cur.width > W * 2) {
    const c = document.createElement('canvas');
    c.width = Math.round(cur.width / 2);
    c.height = Math.round(cur.height / 2);
    const cx = c.getContext('2d')!;
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(cur, 0, 0, c.width, c.height);
    cur = c;
  }
  if (cur.width === W && cur.height === H) return cur;
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const ctx = out.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cur, 0, 0, W, H);
  return out;
}

function toCanvas(src: ImgSrc, W: number, H: number) {
  if (src instanceof HTMLCanvasElement && src.width === W && src.height === H) return src;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const cx = c.getContext('2d')!;
  cx.imageSmoothingEnabled = true;
  cx.imageSmoothingQuality = 'high';
  cx.drawImage(src as any, 0, 0, W, H);
  return c;
}
