'use client';

import { useSession } from 'next-auth/react';
import { usePathname as useNextPathname } from 'next/navigation';
import LogoutButton from './LogoutButton';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './TopNavButtons.module.scss';

export default function TopNavButtons(): JSX.Element | null {
  const { data: session } = useSession();
  const pathname = useNextPathname();

  const isSlugPage = /^\/(en|es)\/[^\/]+$/.test(pathname);
  const isKnownRoute = /^\/(en|es)\/(login|admin)/.test(pathname);
  if (isSlugPage && !isKnownRoute) return null;

  return (
    <div className={styles.container}>
      {session?.user && <LogoutButton />}
      <LanguageSwitcher />
    </div>
  );
}
