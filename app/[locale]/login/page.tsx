"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import styles from "./login.module.scss";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("login");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      setError(t("invalidCredentials"));
      return;
    }
    router.push("/admin/dashboard");
  };

  return (
    <main className={styles.wrapper}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h2 className={styles.title}>{t("title")}</h2>

        <label className={styles.field}>
          <span>{t("email")}</span>
          <input
            className={styles.input}
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            inputMode="email"
          />
        </label>

        <label className={styles.field}>
          <span>{t("password")}</span>
          <input
            className={styles.input}
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.submit} type="submit">{t("submit")}</button>
        <p className={styles.hint}>{t("hint")}</p>
      </form>
    </main>
  );
}
