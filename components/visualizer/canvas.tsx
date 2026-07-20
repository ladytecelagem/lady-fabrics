"use client";

import { useEffect, useRef, useState } from "react";
import { FabricRenderer } from "@/lib/visualizer";
import type { FabricVis, FurnitureVis } from "./types";

const renderer = new FabricRenderer();

function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${url}`));
    img.src = url;
  });
}

export function VisualizerCanvas({
  fabric,
  furniture,
}: {
  fabric: FabricVis | null;
  furniture: FurnitureVis | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!furniture) return;
    let cancelled = false;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const [baseImg, maskImg, shadeImg, swatchImg] = await Promise.all([
          loadImg(furniture.base),
          furniture.mask ? loadImg(furniture.mask) : Promise.resolve<HTMLImageElement | null>(null),
          furniture.shading ? loadImg(furniture.shading) : Promise.resolve<HTMLImageElement | null>(null),
          fabric?.swatch ? loadImg(fabric.swatch) : Promise.resolve<HTMLImageElement | null>(null),
        ]);
        if (cancelled) return;

        const cnv = canvasRef.current!;
        cnv.width = baseImg.naturalWidth;
        cnv.height = baseImg.naturalHeight;
        const ctx = cnv.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Sem tecido escolhido: mostra só o móvel.
        if (!swatchImg || !maskImg) {
          ctx.drawImage(baseImg, 0, 0, cnv.width, cnv.height);
          setLoading(false);
          return;
        }

        const result = renderer.render(
          {
            swatch: swatchImg,
            category: (fabric?.category as any) ?? "plain",
            pxPerCm: fabric?.pxPerCm ?? 40,
          },
          {
            base: baseImg,
            mask: maskImg,
            shading: shadeImg ?? undefined,
          },
          { swatchScale: furniture.swatchScale ?? 1 },
        );

        if (cancelled) return;
        ctx.drawImage(result.canvas, 0, 0, cnv.width, cnv.height);
        setLoading(false);
      } catch (e: any) {
        if (!cancelled) { setErr(e.message); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [fabric, furniture]);

  return (
    <div className="relative w-full">
      <div className="relative w-full bg-wool overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-bone/60">
            <p className="text-xs uppercase tracking-[0.3em] text-stone animate-pulse">Rendering…</p>
          </div>
        )}
        {!furniture && (
          <div className="absolute inset-0 grid place-items-center">
            <p className="text-sm text-stone">Select a piece to begin.</p>
          </div>
        )}
      </div>
      {err && <p className="text-xs text-red-600 mt-2">{err}</p>}
    </div>
  );
}
