"use client";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const change = (next: Locale) => {
    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) segments[1] = next;
    else segments.splice(1, 0, next);
    router.push(segments.join("/") || "/");
  };

  return (
    <div className="flex gap-2 text-[10px] uppercase tracking-widest">
      {locales.map(l => (
        <button key={l} onClick={() => change(l)}
          className={`transition-colors ${l === locale ? "text-ink" : "text-stone hover:text-ink"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}
