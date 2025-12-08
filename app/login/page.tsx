"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./login.module.scss";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      setError("Credenciales inválidas");
      return;
    }
    router.push("/admin/dashboard");
  };

  return (
    <main className={styles.wrapper}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h2 className={styles.title}>Ingresar / Registrarse</h2>

        <label className={styles.field}>
          <span>Email</span>
          <input
            className={styles.input}
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            inputMode="email"
          />
        </label>

        <label className={styles.field}>
          <span>Contraseña</span>
          <input
            className={styles.input}
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.submit} type="submit">Continuar</button>
        <p className={styles.hint}>Si el email no existe, se creará una cuenta automáticamente.</p>
      </form>
    </main>
  );
}
