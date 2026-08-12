"use client";

import { useEffect, useRef, useState } from "react";
import { FabricRenderer } from "@/lib/visualizer";
import type { VisFabric, VisFurniture } from "./types";

const renderer = new FabricRenderer();

function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load image`));
    img.src = url;
  });
}

export function VisualizerCanvas({
  fabric, furniture,
}: { fabric: VisFabric | null; furniture: VisFurniture | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!furniture) return;
    let cancelled = false;
    setLoading(true); setNote("");

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

        // Sem tecido, ou móvel sem máscara: mostra o móvel e avisa.
        if (!swatchImg) { ctx.drawImage(baseImg, 0, 0); setLoading(false); return; }
        if (!maskImg) {
          ctx.drawImage(baseImg, 0, 0);
          setNote("This piece has no upholstery mask yet, so the fabric can't be applied. Add a mask in the visualizer admin.");
          setLoading(false); return;
        }

        const result = renderer.render(
          { swatch: swatchImg, category: (fabric?.category as any) ?? "plain" },
          { base: baseImg, mask: maskImg, shading: shadeImg ?? undefined },
          {},
        );
        if (cancelled) return;
        ctx.drawImage(result.canvas, 0, 0, cnv.width, cnv.height);
        setLoading(false);
      } catch {
        if (!cancelled) { setNote("Could not render this combination."); setLoading(false); }
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
      {note && <p className="text-xs text-stone mt-2">{note}</p>}
    </div>
  );
}
