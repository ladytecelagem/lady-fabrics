// apps/web/lib/visualizer/seamless.ts
// Gera textura seamless a partir do swatch:
// 1) recorta área central (evita bordas com fios soltos)
// 2) faz mirror em 4 cantos + offset half-shift
// 3) feather/cross-blend nas costuras (FFT-like só com gradient blend)
// Resultado: tile que se repete sem mostrar costura.

import { ImgSrc } from './types';

export interface SeamlessOptions {
  size?: number;      // lado do tile final (default 512)
  cropPct?: number;   // recorte central do swatch (default 0.85)
  feather?: number;   // largura do feather em px (default 64)
}

export function makeSeamless(src: ImgSrc, opt: SeamlessOptions = {}): HTMLCanvasElement {
  const size = opt.size ?? 512;
  const cropPct = opt.cropPct ?? 0.85;
  const feather = opt.feather ?? 64;

  // 1) crop central do swatch
  const sw = (src as any).width, sh = (src as any).height;
  const cw = Math.floor(sw * cropPct), ch = Math.floor(sh * cropPct);
  const cx = Math.floor((sw - cw) / 2), cy = Math.floor((sh - ch) / 2);

  const crop = document.createElement('canvas');
  crop.width = size; crop.height = size;
  const cctx = crop.getContext('2d')!;
  cctx.drawImage(src as any, cx, cy, cw, ch, 0, 0, size, size);

  // 2) half-shift wrap: pega tile e desloca size/2 — costuras vão pro meio
  const shift = document.createElement('canvas');
  shift.width = size; shift.height = size;
  const sctx = shift.getContext('2d')!;
  const half = size / 2;
  // quadrantes trocados
  sctx.drawImage(crop, half, half, half, half, 0, 0, half, half);
  sctx.drawImage(crop, 0, half, half, half, half, 0, half, half);
  sctx.drawImage(crop, half, 0, half, half, 0, half, half, half);
  sctx.drawImage(crop, 0, 0, half, half, half, half, half, half);

  // 3) blend nas costuras centrais (cruz +) usando faixas do crop original
  const out = document.createElement('canvas');
  out.width = size; out.height = size;
  const octx = out.getContext('2d')!;
  octx.drawImage(shift, 0, 0);

  // faixa horizontal: pega centro do crop ORIGINAL e pinta com gradient mask
  drawFeatherBand(octx, crop, 'h', half, feather, size);
  drawFeatherBand(octx, crop, 'v', half, feather, size);

  return out;
}

function drawFeatherBand(
  ctx: CanvasRenderingContext2D,
  patch: HTMLCanvasElement,
  axis: 'h' | 'v',
  center: number,
  feather: number,
  size: number,
) {
  const band = document.createElement('canvas');
  band.width = size; band.height = size;
  const bctx = band.getContext('2d')!;
  // amostra do patch original na região "limpa" (centro)
  bctx.drawImage(patch, 0, 0);

  // máscara gradient
  const mask = document.createElement('canvas');
  mask.width = size; mask.height = size;
  const mctx = mask.getContext('2d')!;
  let grad;
  if (axis === 'h') {
    grad = mctx.createLinearGradient(0, center - feather, 0, center + feather);
  } else {
    grad = mctx.createLinearGradient(center - feather, 0, center + feather, 0);
  }
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.5, 'rgba(0,0,0,1)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  mctx.fillStyle = grad;
  mctx.fillRect(0, 0, size, size);

  bctx.globalCompositeOperation = 'destination-in';
  bctx.drawImage(mask, 0, 0);
  bctx.globalCompositeOperation = 'source-over';

  ctx.drawImage(band, 0, 0);
}
