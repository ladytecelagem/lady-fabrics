// apps/web/lib/visualizer/types.ts
export type ImgSrc = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

export interface FabricInput {
  swatch: ImgSrc;          // tecido cru
  pxPerCm?: number;        // escala física opcional (default 40)
  category?: 'plain' | 'boucle' | 'tweed' | 'jacquard' | 'linen' | 'organic';
}

export interface FurnitureInput {
  base: ImgSrc;            // foto do móvel
  mask: ImgSrc;            // máscara SAM-2 (alpha do que recebe tecido)
  shading?: ImgSrc;        // opcional: shading pré-extraído (admin)
}

export interface RenderOptions {
  tileCm?: number;         // tamanho lógico do tile (default 30)
  jitter?: number;         // 0..1 (default 0.35)
  rotationDeg?: number;    // jitter de rotação max (default 6)
  mirrorChance?: number;   // 0..1 (default 0.5)
  microDetail?: number;    // 0..1 high-pass do tecido (default 0.6)
  shadingStrength?: number;// 0..1 (default 1.0)
  seed?: number;           // determinismo
  swatchScale?: number;     // multiplicador físico por móvel (default 1.0)
}

export interface RenderResult {
  canvas: HTMLCanvasElement;
  ms: number;
}
