'use client';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import styles from './not-found.module.scss';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className={styles.container}>
      <LanguageSwitcher />
      <div className={styles.content}>
        <div className={styles.number404}>404</div>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.description}>{t('description')}</p>
        <Link href="/" className={styles.homeButton}>
          {t('backHome')}
        </Link>
      </div>
    </main>
  );
}
