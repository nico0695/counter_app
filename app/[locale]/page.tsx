import { Link } from '@/lib/navigation';
import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/auth';
import styles from './page.module.scss';

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const session = await getSession();

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>{t('logo')}</div>
      </header>

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t('title')}</h1>

          <ul className={styles.features}>
            <li className={styles.feature}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('features.customize')}</span>
            </li>
            <li className={styles.feature}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span>{t('features.personalize')}</span>
            </li>
            <li className={styles.feature}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{t('features.share')}</span>
            </li>
          </ul>


          <Link className={styles.ctaButton} href={session?.user ? "/admin/dashboard" : "/login"}>
            {session?.user ? t('dashboardButton') : t('loginButton')}
          </Link>
          <div className={styles.badge}>{t('freeBadge')}</div>
        </div>
      </div>
    </main>
  );
}
