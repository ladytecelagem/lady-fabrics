// apps/web/lib/visualizer/shading.ts
// Extrai shading factor do furniture base.
// shadingFactor = luminance(base) / mean(luminance(base|mask))
// Preserva sombras, ambient occlusion, costuras e highlights do móvel.

import { ImgSrc } from './types';

export interface ShadingMaps {
  shading: HTMLCanvasElement;   // greyscale factor (0..2, centrado em 1)
  meanL: number;                // luminance média dentro da máscara
}

export function extractShading(base: ImgSrc, mask: ImgSrc, W: number, H: number): ShadingMaps {
  const b = drawTo(base, W, H);
  const m = drawTo(mask, W, H);
  const bctx = b.getContext('2d')!;
  const mctx = m.getContext('2d')!;
  const bi = bctx.getImageData(0, 0, W, H).data;
  const mi = mctx.getImageData(0, 0, W, H).data;

  // luminance + média na máscara
  const lum = new Float32Array(W * H);
  let sum = 0, n = 0;
  for (let p = 0, i = 0; p < lum.length; p++, i += 4) {
    const L = 0.2126 * bi[i] + 0.7152 * bi[i + 1] + 0.0722 * bi[i + 2];
    lum[p] = L;
    if (mi[i + 3] > 16) { sum += L; n++; }
  }
  const meanL = n ? sum / n : 128;

  // shading factor canvas (greyscale, alpha = mask alpha)
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const octx = out.getContext('2d')!;
  const oi = octx.createImageData(W, H);
  const od = oi.data;
  for (let p = 0, i = 0; p < lum.length; p++, i += 4) {
    const factor = lum[p] / meanL;            // 1 = sem mudança
    const v = clamp255(factor * 128);          // armazena 128=1.0
    od[i] = od[i + 1] = od[i + 2] = v;
    od[i + 3] = mi[i + 3];
  }
  octx.putImageData(oi, 0, 0);
  return { shading: out, meanL };
}

function drawTo(src: ImgSrc, W: number, H: number) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  c.getContext('2d')!.drawImage(src as any, 0, 0, W, H);
  return c;
}
const clamp255 = (v: number) => v < 0 ? 0 : v > 255 ? 255 : v;
