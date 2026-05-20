"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

type Page = { pageNumber: number; imageUrl: string; patterns?: string[]; notes?: string };

export function SampleBookViewer({ pages }: { pages: Page[] }) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const next = () => setIdx(i => Math.min(pages.length - 1, i + 1));
  const prev = () => setIdx(i => Math.max(0, i - 1));

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [pages.length]);

  if (!pages.length) {
    return <div className="container-x py-32 text-center text-bone/60">This sample book is still being processed.</div>;
  }

  const page = pages[idx];

  return (
    <div ref={containerRef} className={fullscreen ? "fixed inset-0 z-50 bg-ink flex flex-col" : "flex flex-col"}>
      {/* Toolbar */}
      <div className="border-y border-bone/10 px-6 py-3 flex justify-between items-center text-xs uppercase tracking-widest">
        <span>{idx + 1} / {pages.length}</span>
        <div className="flex gap-4">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} aria-label="Zoom in"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={() => setFullscreen(f => !f)} aria-label="Fullscreen"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Viewer */}
      <div className="relative flex-1 overflow-auto bg-graphite">
        <div className="min-h-[70vh] flex items-center justify-center p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={page.pageNumber}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
              className="relative shadow-2xl"
            >
              <Image
                src={page.imageUrl}
                alt={`Page ${page.pageNumber}`}
                width={1200}
                height={1600}
                className="w-auto h-auto max-h-[80vh] object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <button onClick={prev} disabled={idx === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-bone/10 hover:bg-bone/20 backdrop-blur disabled:opacity-30 transition-all"
          aria-label="Previous">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={next} disabled={idx === pages.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-bone/10 hover:bg-bone/20 backdrop-blur disabled:opacity-30 transition-all"
          aria-label="Next">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="border-t border-bone/10 px-6 py-4 overflow-x-auto">
        <div className="flex gap-2 min-w-min">
          {pages.map((p, i) => (
            <button key={p.pageNumber} onClick={() => setIdx(i)}
              className={`relative w-16 h-20 shrink-0 transition-all ${i === idx ? "ring-2 ring-bone" : "opacity-50 hover:opacity-100"}`}>
              <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      </div>

      {/* Metadata */}
      {(page.patterns?.length || page.notes) && (
        <div className="px-6 py-4 border-t border-bone/10 text-xs">
          {page.patterns?.length ? <p className="mb-1"><span className="text-bone/60 uppercase tracking-widest mr-2">Patterns:</span>{page.patterns.join(", ")}</p> : null}
          {page.notes && <p className="text-bone/70">{page.notes}</p>}
        </div>
      )}
    </div>
  );
}
