"use client";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import styles from "./QRCodeLarge.module.scss";

interface QRCodeLargeProps {
  url: string;
  slug: string;
}

export default function QRCodeLarge({ url, slug }: QRCodeLargeProps) {
  const router = useRouter();
  const t = useTranslations("qrPage");
  const [fullUrl, setFullUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const baseUrl = window.location.origin;
    setFullUrl(`${baseUrl}${url}`);
  }, [url]);

  const handleBack = () => {
    router.push(`/${slug}`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!fullUrl) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.qrWrapper}>
          <QRCode value={fullUrl} size={256} className={styles.qr} />
        </div>
        <div className={styles.urlContainer}>
          <a href={fullUrl} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
            {fullUrl}
          </a>
          <button
            onClick={handleCopy}
            className={styles.copyButton}
            title={copied ? t("copied") : t("copyLink")}
          >
            {copied ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
        <button onClick={handleBack} className={styles.backButton}>
          {t("backButton")}
        </button>
      </div>
    </div>
  );
}
