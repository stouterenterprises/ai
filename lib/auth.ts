import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { query } from "@/lib/db";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
  }
  interface Session {
    user?: {
      id?: string;
      role?: string;
      email?: string;
      name?: string;
      image?: string;
    };
  }
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Check if it's the admin account
        if (
          credentials.email === ADMIN_EMAIL &&
          ADMIN_PASSWORD_HASH &&
          (await compare(credentials.password as string, ADMIN_PASSWORD_HASH))
        ) {
          return {
            id: "admin",
            email: ADMIN_EMAIL,
            name: "Admin",
            role: "admin"
          };
        }

        throw new Error("Invalid email or password");
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role || "admin";
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  }
});
