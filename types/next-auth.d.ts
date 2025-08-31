import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string; // admin or undefined
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string; // admin or undefined
  }
}
