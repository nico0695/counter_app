"use client";
import QRCode from "react-qr-code";
import styles from "./QRCodeDisplay.module.scss";

interface QRCodeDisplayProps {
  url: string;
  onClick?: () => void;
}

export default function QRCodeDisplay({ url, onClick }: QRCodeDisplayProps) {
  return (
    <div
      className={`${styles.qrContainer} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <QRCode value={url} size={80} />
    </div>
  );
}
