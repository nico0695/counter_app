"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, minWidth: 320 }}>
        <h2>Ingresar / Registrarse</h2>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit">Continuar</button>
      </form>
    </main>
  );
}

