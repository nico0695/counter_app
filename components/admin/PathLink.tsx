"use client";
import { useMemo } from "react";
import styles from "./PathLink.module.scss";
import { useToast } from "@/components/ui/ToastProvider";
import { useLocale } from "next-intl";

export default function PathLink({ slug }: { slug: string }) {
  const locale = useLocale();
  const href = useMemo(() => `/${locale}/${slug}`, [locale, slug]);
  const fullUrl = useMemo(() => {
    if (typeof window === "undefined") return href;
    return `${window.location.origin}${href}`;
  }, [href]);
  const { show } = useToast();

  async function onCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(fullUrl);
      show("Copiado al portapapeles");
    } catch {
      // Silently fail if clipboard API is not available
    }
  }

  return (
    <a className={styles.pathLink} href={href} target="_blank" rel="noopener noreferrer">
      <span className={styles.urlText}>{href}</span>
      <button className={styles.copyBtn} onClick={onCopy} aria-label="Copiar enlace">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path d="M8 8H16V16H8V8Z" stroke="#e5e7eb" strokeWidth="1.5" />
          <path
            d="M6 12H5C3.89543 12 3 11.1046 3 10V5C3 3.89543 3.89543 3 5 3H10C11.1046 3 12 3.89543 12 5V6"
            stroke="#9ca3af"
            strokeWidth="1.5"
          />
        </svg>
      </button>
    </a>
  );
}
