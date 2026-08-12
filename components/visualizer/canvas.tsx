"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FabricRenderer } from "@/lib/visualizer";
import type { VisFabric, VisFurniture } from "./types";

const renderer = new FabricRenderer();

function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("failed to load image"));
    img.src = url;
  });
}

export type CanvasHandle = { toDataURL: () => string | null };

export const VisualizerCanvas = forwardRef<CanvasHandle, {
  fabric: VisFabric | null; furniture: VisFurniture | null;
}>(function VisualizerCanvas({ fabric, furniture }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [zoom, setZoom] = useState(1);

  useImperativeHandle(ref, () => ({
    toDataURL: () => {
      try { return canvasRef.current?.toDataURL("image/jpeg", 0.9) ?? null; }
      catch { return null; }
    },
  }));

  useEffect(() => {
    if (!furniture) return;
    let cancelled = false;
    setLoading(true); setNote(""); setZoom(1);

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
        // fundo branco (em vez de transparente/wool)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, cnv.width, cnv.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        if (!swatchImg) { ctx.drawImage(baseImg, 0, 0); setLoading(false); return; }
        if (!maskImg) {
          ctx.drawImage(baseImg, 0, 0);
          setNote("This piece has no upholstery mask yet, so the fabric can't be applied.");
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
      <div className="relative w-full bg-white overflow-hidden border border-ink/5" style={{ aspectRatio: "4 / 3" }}>
        <div className="w-full h-full transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>

        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-white/60">
            <p className="text-xs uppercase tracking-[0.3em] text-stone animate-pulse">Rendering…</p>
          </div>
        )}
        {!furniture && (
          <div className="absolute inset-0 grid place-items-center">
            <p className="text-sm text-stone">Select a piece to begin.</p>
          </div>
        )}

        {/* zoom controls */}
        {furniture && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 border border-ink/10 rounded-full px-1">
            <button onClick={() => setZoom(z => Math.max(1, +(z - 0.25).toFixed(2)))}
              className="w-8 h-8 grid place-items-center text-lg hover:bg-ink/5 rounded-full" aria-label="Zoom out">−</button>
            <span className="text-[11px] tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))}
              className="w-8 h-8 grid place-items-center text-lg hover:bg-ink/5 rounded-full" aria-label="Zoom in">+</button>
          </div>
        )}
      </div>
      {note && <p className="text-xs text-stone mt-2">{note}</p>}
    </div>
  );
});
