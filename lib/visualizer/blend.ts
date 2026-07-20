// apps/web/lib/visualizer/blend.ts
// Composite final:
//   final.rgb = fabric.rgb modulado pelo shading do móvel (volume),
//   + oclusão de contato nas reentrâncias, + resposta de cor nas sombras,
//   + microDetail. Tudo dentro da máscara SAM-2.

import { ImgSrc } from './types';

export interface BlendInput {
  base: HTMLCanvasElement;       // foto do móvel
  fabric: HTMLCanvasElement;     // resultado do stochastic tile (já cobre frame)
  shading: HTMLCanvasElement;    // factor 128=neutro (de shading.ts)
  mask: ImgSrc;                  // máscara SAM-2
  shadingStrength: number;       // 0..1
  microDetail: number;           // 0..1
  swatchForDetail: ImgSrc;       // pra extrair micro detail
}

export function composite(input: BlendInput): HTMLCanvasElement {
  const W = input.base.width, H = input.base.height;
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const ctx = out.getContext('2d')!;

  const baseData = input.base.getContext('2d')!.getImageData(0, 0, W, H).data;
  const fabData = input.fabric.getContext('2d')!.getImageData(0, 0, W, H).data;
  const shData = input.shading.getContext('2d')!.getImageData(0, 0, W, H).data;

  // máscara em alpha — PNGs B/W vêm com alpha=255 em todo frame;
  // derivamos alpha do canal luminance pra distinguir dentro/fora.
  const mc = document.createElement('canvas');
  mc.width = W; mc.height = H;
  const mctx = mc.getContext('2d')!;
  mctx.drawImage(input.mask as any, 0, 0, W, H);
  const mImg = mctx.getImageData(0, 0, W, H);
  const mData = mImg.data;
  for (let i = 0; i < mData.length; i += 4) {
    const lum = 0.299 * mData[i] + 0.587 * mData[i + 1] + 0.114 * mData[i + 2];
    mData[i + 3] = lum;
  }
  mctx.putImageData(mImg, 0, 0);

  const img = ctx.createImageData(W, H);
  const d = img.data;
  const s = input.shadingStrength;

  for (let i = 0; i < d.length; i += 4) {
    const ma = mData[i + 3] / 255;
    if (ma < 0.01) {
      d[i] = baseData[i]; d[i + 1] = baseData[i + 1]; d[i + 2] = baseData[i + 2]; d[i + 3] = 255;
      continue;
    }

    // --- #1 shading com curva de contraste (mais volume) ---
    // raw: 1.0 neutro, <1 sombra, >1 luz. A curva expande o desvio do
    // neutro, deixando sombras mais fundas e luzes mais vivas.
    const raw = shData[i] / 128;
    const dev = raw - 1;
    const curved = 1 + dev * (1 + 0.6 * Math.abs(dev)); // expansão suave
    const factor = (1 - s) + s * curved;

    // --- #4 oclusão de contato ---
    // onde o shading é bem escuro (reentrâncias, vãos entre almofadas),
    // adiciona um escurecimento extra não-linear → profundidade.
    let occ = 1;
    if (raw < 0.92) {
      const depth = (0.92 - raw) / 0.92;          // 0..1
      occ = 1 - 0.45 * depth * depth * s;          // quadrático: só vãos fundos
    }

    let fr = fabData[i]     * factor * occ;
    let fg = fabData[i + 1] * factor * occ;
    let fb = fabData[i + 2] * factor * occ;

    // --- #5 resposta de cor nas sombras ---
    // sombras reais perdem um pouco de azul e ganham leve calor; áreas
    // claras ficam levemente mais frias. shift sutil, proporcional à luz.
    const lit = factor * occ;            // ~<1 sombra, ~>1 luz
    if (lit < 1) {
      const t = (1 - lit) * s;           // intensidade do efeito
      fr *= 1 + 0.04 * t;                // +vermelho na sombra
      fb *= 1 - 0.06 * t;                // -azul na sombra
    } else {
      const t = (lit - 1) * s;
      fb *= 1 + 0.03 * t;                // +azul na luz
    }

    d[i]     = lerp(baseData[i],     fr, ma);
    d[i + 1] = lerp(baseData[i + 1], fg, ma);
    d[i + 2] = lerp(baseData[i + 2], fb, ma);
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  if (input.microDetail > 0) {
    overlayMicroDetail(out, input.swatchForDetail, mc, input.microDetail);
  }
  return out;
}

const lerp = (a: number, b: number, t: number) => {
  const v = a + (b - a) * t;
  return v < 0 ? 0 : v > 255 ? 255 : v;
};

function overlayMicroDetail(
  target: HTMLCanvasElement,
  swatch: ImgSrc,
  maskCanvas: HTMLCanvasElement,
  strength: number,
) {
  const W = target.width, H = target.height;
  const tile = document.createElement('canvas');
  tile.width = W; tile.height = H;
  const tctx = tile.getContext('2d')!;
  const pat = tctx.createPattern(swatch as any, 'repeat')!;
  tctx.fillStyle = pat;
  tctx.fillRect(0, 0, W, H);

  const blur = document.createElement('canvas');
  blur.width = W; blur.height = H;
  const bctx = blur.getContext('2d')!;
  bctx.filter = `blur(${Math.max(2, Math.round(Math.min(W, H) / 360))}px)`;
  bctx.drawImage(tile, 0, 0);

  const td = tctx.getImageData(0, 0, W, H);
  const bd = bctx.getImageData(0, 0, W, H);
  for (let i = 0; i < td.data.length; i += 4) {
    td.data[i]     = clamp255(td.data[i]     - bd.data[i]     + 128);
    td.data[i + 1] = clamp255(td.data[i + 1] - bd.data[i + 1] + 128);
    td.data[i + 2] = clamp255(td.data[i + 2] - bd.data[i + 2] + 128);
  }
  tctx.putImageData(td, 0, 0);

  tctx.globalCompositeOperation = 'destination-in';
  tctx.drawImage(maskCanvas, 0, 0);

  const ctx = target.getContext('2d')!;
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = strength * 0.35;
  ctx.drawImage(tile, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}
const clamp255 = (v: number) => v < 0 ? 0 : v > 255 ? 255 : v;
