import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

export interface ExtendedUser extends DefaultUser {
  id: string;
  email: string;
  role: string;
}

export interface ExtendedSession extends DefaultSession {
  user: ExtendedUser;
}

export interface ExtendedJWT extends DefaultJWT {
  id: string;
  role: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export interface ActionState {
  ok: boolean;
  error?: string;
}

export type UserRole = "USER" | "ADMIN";
