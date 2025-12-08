import "@/styles/globals.scss";
import { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata = {
  title: "Countdown Generator",
  description: "Create and share countdowns",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
