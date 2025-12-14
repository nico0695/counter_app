"use client";
import { useEffect, useState, useMemo } from "react";
import { counterMap } from "@/components/counters";
import { defaultCounterId } from "@/lib/counterOptions";
import StyledText from "@/components/StyledText";
import { fontOptions } from "@/lib/textStyles";
import SocialLinks from "@/components/social/SocialLinks";
import styles from "./CounterPreview.module.scss";

type PreviewMode = "pc" | "mobile";

export type PreviewData = {
  title: string;
  description: string;
  bgUrl: string;
  posterUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  counter: string;
  targetDate: string;
  titleFont?: string;
  titleColor?: string;
  titleSize?: string;
  descriptionFont?: string;
  descriptionColor?: string;
  descriptionSize?: string;
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  externalLink1?: string;
  externalLink2?: string;
};

export default function CounterPreview({ data }: { data: PreviewData }) {
  const [videoError, setVideoError] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("pc");

  const counterId = data.counter || defaultCounterId;
  const effectiveId = counterId && counterMap[counterId] ? counterId : defaultCounterId;
  const ActiveCounter = counterMap[effectiveId];

  const isVideo = data.mediaType === "VIDEO";
  const rawBg = (data.bgUrl || "").trim();
  const effectiveBg = rawBg.length > 0 ? rawBg : "/bg/default_bg.jpeg";
  const effectivePoster =
    data.posterUrl && data.posterUrl.length > 0 ? data.posterUrl : "/bg/default_p.jpeg";
  const canUseVideo = isVideo && rawBg.length > 0 && !videoError;

  const targetDateISO = useMemo(() => {
    if (!data.targetDate) {
      // Default to 24 hours from now
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      return tomorrow.toISOString();
    }
    try {
      return new Date(data.targetDate).toISOString();
    } catch {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      return tomorrow.toISOString();
    }
  }, [data.targetDate]);

  useEffect(() => {
    const fontsToLoad: string[] = [];

    if (data.titleFont) {
      const font = fontOptions.find((f) => f.id === data.titleFont);
      if (font) fontsToLoad.push(font.family);
    }

    if (data.descriptionFont && data.descriptionFont !== data.titleFont) {
      const font = fontOptions.find((f) => f.id === data.descriptionFont);
      if (font) fontsToLoad.push(font.family);
    }

    if (fontsToLoad.length === 0) return;

    const linkId = "google-fonts-preview";
    let linkElement = document.getElementById(linkId) as HTMLLinkElement | null;

    if (!linkElement) {
      linkElement = document.createElement("link");
      linkElement.id = linkId;
      linkElement.rel = "stylesheet";
      document.head.appendChild(linkElement);
    }

    const fontFamilies = fontsToLoad.map((f) => `family=${f}`).join("&");
    linkElement.href = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;

    return () => {
      const link = document.getElementById(linkId);
      if (link) link.remove();
    };
  }, [data.titleFont, data.descriptionFont]);

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <div className={styles.previewLabel}>Preview</div>
        <div className={styles.previewToggle}>
          <button
            type="button"
            className={previewMode === "pc" ? styles.toggleActive : styles.toggleBtn}
            onClick={() => setPreviewMode("pc")}
          >
            PC
          </button>
          <button
            type="button"
            className={previewMode === "mobile" ? styles.toggleActive : styles.toggleBtn}
            onClick={() => setPreviewMode("mobile")}
          >
            Mobile
          </button>
        </div>
      </div>
      <div className={previewMode === "mobile" ? styles.previewFrameMobile : styles.previewFrame}>
        <div className={styles.countdown}>
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
                text={data.title || "Your Event Title"}
                fontId={data.titleFont}
                color={data.titleColor}
                sizeId={data.titleSize}
                className={styles.title}
              />
              {data.description && (
                <StyledText
                  text={data.description}
                  fontId={data.descriptionFont}
                  color={data.descriptionColor}
                  sizeId={data.descriptionSize}
                  className={styles.desc}
                />
              )}
              <div className={styles.timer}>
                <ActiveCounter targetDateISO={targetDateISO} />
              </div>
              <SocialLinks
                twitter={data.twitter}
                instagram={data.instagram}
                tiktok={data.tiktok}
                facebook={data.facebook}
                externalLink1={data.externalLink1}
                externalLink2={data.externalLink2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
