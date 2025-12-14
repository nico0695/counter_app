"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }): JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
