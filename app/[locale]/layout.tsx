import '@/styles/globals.scss';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import TopNavButtons from '@/components/ui/TopNavButtons';
import ClientProviders from '@/components/providers/ClientProviders';
import Script from 'next/script';

interface Messages {
  metadata?: {
    title?: string;
    description?: string;
  };
  [key: string]: unknown;
}

export function generateStaticParams(): { locale: string }[] {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;

  const messages = (await getMessages({ locale })) as Messages;

  return {
    title: messages.metadata?.title || 'Countdown Generator',
    description:
      messages.metadata?.description || 'Create and share countdowns',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}): Promise<JSX.Element> {
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
          <ClientProviders>
            <ToastProvider>
              <TopNavButtons />

              {children}
            </ToastProvider>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
