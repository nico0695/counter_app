import '@/styles/globals.scss';
import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import Script from 'next/script';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;

  const messages = await getMessages({ locale });

  return {
    title: (messages as any).metadata?.title || 'Countdown Generator',
    description:
      (messages as any).metadata?.description || 'Create and share countdowns',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        <Script
          defer
          src="https://stats.asd0.site/script.js"
          data-website-id="91d05970-5a57-4825-8bce-d009c9ed308e"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>
            <LanguageSwitcher />

            {children}
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
