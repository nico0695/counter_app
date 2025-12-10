"use client";
import QRCode from "react-qr-code";
import styles from "./QRCodeDisplay.module.scss";

interface QRCodeDisplayProps {
  url: string;
}

export default function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  return (
    <div className={styles.qrContainer}>
      <QRCode value={url} size={80} />
    </div>
  );
}
