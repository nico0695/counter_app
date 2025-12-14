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
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.logo}>CountDown</h1>
          <h2 className={styles.title}>{t("title")}</h2>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              {t("email")}
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              {t("password")}
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit">
            {t("submit")}
          </button>

          <p className={styles.hint}>{t("hint")}</p>
        </form>
      </div>
    </main>
  );
}
