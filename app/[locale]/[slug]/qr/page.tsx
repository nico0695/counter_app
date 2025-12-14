import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QRCodeLarge from "@/components/QRCodeLarge";
import styles from "./page.module.scss";

interface Props {
  params: { locale: string; slug: string };
}

export default async function QRPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);

  const counter = await prisma.counter.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      bgUrl: true,
      posterUrl: true,
      mediaType: true,
      enabled: true,
    },
  });

  if (!counter || !counter.enabled) return notFound();

  const isVideo =
    (counter.mediaType ?? "IMAGE") === "VIDEO" || (counter.mediaType ?? "image") === "video";
  const rawBg = (counter.bgUrl ?? "").trim();
  const effectiveBg = rawBg.length > 0 ? rawBg : "/bg/default_bg.jpeg";
  const effectivePoster =
    counter.posterUrl && counter.posterUrl.length > 0 ? counter.posterUrl : "/bg/default_p.jpeg";

  // Build the QR URL (will be completed on client side)
  const qrUrl = `/${counter.slug}`;

  return (
    <div className={styles.container}>
      {isVideo && rawBg.length > 0 ? (
        <video
          className={styles.bgVideo}
          src={effectiveBg}
          poster={effectivePoster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      ) : (
        <div className={styles.bg} style={{ backgroundImage: `url(${effectiveBg})` }} />
      )}
      <div className={styles.content}>
        <QRCodeLarge url={qrUrl} slug={counter.slug} />
      </div>
    </div>
  );
}
