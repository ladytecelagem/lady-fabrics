export const metadata = { title: "Settings — Admin" };
export default function Page() {
  return (
    <div className="p-10">
      <h1 className="text-display text-4xl mb-6">Settings</h1>
      <p className="text-stone text-sm mb-6">Managed via Sanity Studio.</p>
      <a href="/studio" target="_blank" className="text-xs uppercase tracking-widest underline">Open Studio ↗</a>
    </div>
  );
}
