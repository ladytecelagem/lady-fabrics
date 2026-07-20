// apps/web/lib/visualizer/cache.ts
class LRU<V> {
  private map = new Map<any, V>();
  constructor(private max = 24) {}
  get(k: any) {
    const v = this.map.get(k);
    if (v) { this.map.delete(k); this.map.set(k, v); }
    return v;
  }
  set(k: any, v: V) {
    if (this.map.has(k)) this.map.delete(k);
    this.map.set(k, v);
    if (this.map.size > this.max) {
      const first = this.map.keys().next().value;
      this.map.delete(first);
    }
  }
  clear() { this.map.clear(); }
}
export const seamlessCache = new LRU<HTMLCanvasElement>(32);
export const shadingCache = new LRU<HTMLCanvasElement>(16);
