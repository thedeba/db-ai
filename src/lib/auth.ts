
import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const client = await clientPromise;
        const db = client.db();
        const adminCollection = db.collection('admin');

        const adminUser = await adminCollection.findOne({ username: credentials.username });

        if (adminUser && await bcrypt.compare(credentials.password, adminUser.password)) {
          return {
            id: adminUser._id.toString(),
            name: adminUser.username,
            email: adminUser.email || '',
            role: "admin",
          };
        }
        return null;
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (user?.role) {
        session.user.role = user.role;
      }
      return session;
    },
  },
};

export const { handlers: { GET, POST }, auth } = NextAuth(authOptions);
