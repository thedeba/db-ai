/*import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
*/

import NextAuth from "next-auth";
import { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions = {
  providers: [
    // Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Admin login via username/password
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminUser = {
          id: "1",
          name: "Admin",
          email: "admin@example.com",
          role: "admin",
        };

        // Replace with a secure password check in production
        if (
          credentials?.username === "admin" &&
          credentials?.password === "admin123"
        ) {
          return adminUser;
        }
        return null;
      },
    }),
  ],

  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/signin",
  },

callbacks: {
  async session({
    session,
    user,
  }: {
    session: Session;
    user: User;
    token?: JWT;
  }): Promise<Session> {
    if (user?.role) session.user.role = user.role;
    return session;
  },
},
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
