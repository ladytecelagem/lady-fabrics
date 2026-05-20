export const metadata = { title: "Media — Admin" };
export default function Page() {
  return (
    <div className="p-10">
      <h1 className="text-display text-4xl mb-6">Media</h1>
      <p className="text-stone text-sm mb-6">Managed via Sanity Studio.</p>
      <a href="/studio" target="_blank" className="text-xs uppercase tracking-widest underline">Open Studio ↗</a>
    </div>
  );
}
