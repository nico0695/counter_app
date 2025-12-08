import NextAuth, { NextAuthOptions, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { z } from "zod";

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
          return { id: existing.id, email: existing.email, role: existing.role } as any;
        }

        const hashed = await hash(password, 10);
        const created = await prisma.user.create({
          data: { email, password: hashed },
        });
        return { id: created.id, email: created.email, role: created.role } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = (token as any).id;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
};

export const authHandler = NextAuth(authOptions);
export const getSession = () => getServerSession(authOptions);
