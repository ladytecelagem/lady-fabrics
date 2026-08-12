import Link from "next/link";

export const metadata = { title: "Pages — Admin" };

const PAGES = [
  { key: "home", label: "Home", path: "/" },
  { key: "about", label: "About", path: "/about" },
  { key: "sustainability", label: "Sustainability", path: "/sustainability" },
  { key: "heritage", label: "Heritage", path: "/heritage" },
  { key: "intelligence", label: "Intelligence (intro)", path: "/intelligence" },
  { key: "contact", label: "Contact (intro)", path: "/contact" },
];

export default function AdminPages() {
  return (
    <div className="p-10">
      <h1 className="text-display text-4xl mb-2">Pages</h1>
      <p className="text-stone text-sm mb-10">Edit editorial text for each page. Changes go live within a minute.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {PAGES.map(p => (
          <Link key={p.key} href={`/admin/pages/${p.key}`}
            className="border border-ink/10 p-6 hover:bg-bone transition-colors">
            <p className="text-display text-2xl">{p.label}</p>
            <p className="text-xs text-stone mt-1">{p.path}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
