import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export default getRequestConfig(async ({ locale }) => {
  const validatedLocale = locale || defaultLocale;

  if (!locales.includes(validatedLocale as Locale)) {
    notFound();
  }

  return {
    locale: validatedLocale,
    messages: (await import(`./messages/${validatedLocale}.json`)).default,
  };
});
