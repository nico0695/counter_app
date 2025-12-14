"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import styles from "./TopNavButtons.module.scss";

export default function LogoutButton(): JSX.Element {
  const router = useRouter();
  const t = useTranslations("nav");

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className={styles.button}
      aria-label={t("logout")}
      title={t("logout")}
    >
      {t("logout")}
    </button>
  );
}
