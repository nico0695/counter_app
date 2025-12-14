import NextAuth, { NextAuthOptions, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { ExtendedUser, ExtendedJWT, ExtendedSession } from "@/interfaces/auth.interfaces";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parse = credentialsSchema.safeParse(raw ?? {});
        if (!parse.success) return null;
        const { email, password } = parse.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          if (existing.blocked) return null;
          const ok = await compare(password, existing.password);
          if (!ok) return null;
          return { id: existing.id, email: existing.email, role: existing.role } as ExtendedUser;
        }

        const hashed = await hash(password, 10);
        const created = await prisma.user.create({
          data: { email, password: hashed },
        });
        return { id: created.id, email: created.email, role: created.role } as ExtendedUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extUser = user as ExtendedUser;
        const extToken = token as ExtendedJWT;
        extToken.id = extUser.id;
        extToken.role = extUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const extSession = session as ExtendedSession;
        const extToken = token as ExtendedJWT;
        extSession.user.id = extToken.id;
        extSession.user.role = extToken.role;
      }
      return session;
    },
  },
};

export const authHandler = NextAuth(authOptions);
export const getSession = () => getServerSession(authOptions);
