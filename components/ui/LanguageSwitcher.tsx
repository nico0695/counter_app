'use client';

import { useLocale } from 'next-intl';
import { usePathname as useNextPathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import styles from './LanguageSwitcher.module.scss';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = useNextPathname();

  const isSlugPage = /^\/(en|es)\/[^\/]+$/.test(pathname);
  const isKnownRoute = /^\/(en|es)\/(login|admin)/.test(pathname);
  if (isSlugPage && !isKnownRoute) return null;

  const switchLocale = () => {
    const nextLocale = locale === 'en' ? 'es' : 'en';
    const pathnameWithoutLocale = pathname.replace(/^\/(en|es)(\/|$)/, '/');
    const newPath = `/${nextLocale}${
      pathnameWithoutLocale === '/' ? '' : pathnameWithoutLocale
    }`;
    router.push(newPath);
  };

  const displayText = locale === 'es' ? 'EN' : 'ES';

  return (
    <button
      onClick={switchLocale}
      className={styles.languageSwitcher}
      aria-label={`Switch to ${displayText}`}
      title={`Switch to ${displayText}`}
    >
      {displayText}
    </button>
  );
}
