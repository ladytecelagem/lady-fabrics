import { defaultLocale, type Locale } from "./config";

/** Resolve a localeString / localeText / localeBlock field with fallback to EN. */
export function lf<T = any>(field: any, locale: string): T | undefined {
  if (!field) return undefined;
  return field[locale as Locale] ?? field[defaultLocale] ?? undefined;
}
