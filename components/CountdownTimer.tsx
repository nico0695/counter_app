"use client";
import styles from "@/components/CountdownTimer.module.scss";
import { useEffect, useState } from "react";
import { counterMap } from "@/components/counters";
import { defaultCounterId } from "@/lib/counterOptions";
import StyledText from "@/components/StyledText";
import { fontOptions } from "@/lib/textStyles";
import TimezoneFooter from "@/components/countdown/TimezoneFooter";
import type { ICounter } from "@/interfaces/counter.interfaces";
import SocialLinks from "@/components/social/SocialLinks";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";

export default function CountdownTimer({ counter }: { counter: ICounter }) {
  const t = useTranslations("home");
  const router = useRouter();
  const counterId = counter.counter ?? undefined;
  const effectiveId = counterId && counterMap[counterId] ? counterId : defaultCounterId;
  const ActiveCounter = counterMap[effectiveId];

  const isVideo = (counter.mediaType ?? "IMAGE") === "VIDEO";
  const rawBg = (counter.bgUrl ?? "").trim();
  const effectiveBg = rawBg.length > 0 ? rawBg : "/bg/default_bg.jpeg";
  const effectivePoster =
    counter.posterUrl && counter.posterUrl.length > 0 ? counter.posterUrl : "/bg/default_p.jpeg";
  const [videoError, setVideoError] = useState(false);
  const canUseVideo = isVideo && rawBg.length > 0 && !videoError;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const qrUrl = `${baseUrl}/${counter.slug}`;

  const handleQRClick = () => {
    router.push(`/${counter.slug}/qr`);
  };

  useEffect(() => {
    const fontsToLoad: string[] = [];

    if (counter.titleFont) {
      const font = fontOptions.find((f) => f.id === counter.titleFont);
      if (font) fontsToLoad.push(font.family);
    }

    if (counter.descriptionFont && counter.descriptionFont !== counter.titleFont) {
      const font = fontOptions.find((f) => f.id === counter.descriptionFont);
      if (font) fontsToLoad.push(font.family);
    }

    if (fontsToLoad.length === 0) return;

    const linkId = "google-fonts-countdown";
    let linkElement = document.getElementById(linkId) as HTMLLinkElement | null;

    if (!linkElement) {
      linkElement = document.createElement("link");
      linkElement.id = linkId;
      linkElement.rel = "stylesheet";
      document.head.appendChild(linkElement);
    }

    // Build Google Fonts URL
    const fontFamilies = fontsToLoad.map((f) => `family=${f}`).join("&");
    linkElement.href = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;

    return () => {
      const link = document.getElementById(linkId);
      if (link) link.remove();
    };
  }, [counter.titleFont, counter.descriptionFont]);

  return (
    <div className={styles.container}>
      <div className={styles.logo}>{t("logo")}</div>
      {canUseVideo ? (
        <video
          className={styles.bgVideo}
          src={effectiveBg}
          poster={effectivePoster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setVideoError(true)}
        />
      ) : (
        <div className={styles.bg} style={{ backgroundImage: `url(${effectiveBg})` }} />
      )}
      <div className={styles.content}>
        <div>
          <StyledText
            text={counter.title}
            fontId={counter.titleFont ?? undefined}
            color={counter.titleColor ?? undefined}
            sizeId={counter.titleSize ?? undefined}
            className={styles.title}
          />
          {counter.description ? (
            <StyledText
              text={counter.description}
              fontId={counter.descriptionFont ?? undefined}
              color={counter.descriptionColor ?? undefined}
              sizeId={counter.descriptionSize ?? undefined}
              className={styles.desc}
            />
          ) : null}
          <div className={styles.timer}>
            <ActiveCounter targetDateISO={counter.targetDate.toISOString()} />
          </div>
          <SocialLinks
            twitter={counter.twitter}
            instagram={counter.instagram}
            tiktok={counter.tiktok}
            facebook={counter.facebook}
            externalLink1={counter.externalLink1}
            externalLink2={counter.externalLink2}
          />
        </div>
      </div>
      <TimezoneFooter targetDate={counter.targetDate} />
      <div className={styles.qrWrapper}>
        <QRCodeDisplay url={qrUrl} onClick={handleQRClick} />
      </div>
    </div>
  );
}
