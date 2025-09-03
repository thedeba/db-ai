import NextAuth from "next-auth";
import { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from 'bcryptjs';

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
