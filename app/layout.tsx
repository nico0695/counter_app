import "@/styles/globals.scss";
import { ReactNode } from "react";

export const metadata = {
  title: "Countdown Generator",
  description: "Create and share countdowns",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

