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
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!NEXTAUTH_SECRET) {
  console.warn("⚠️  Warning: NEXTAUTH_SECRET is not set in environment variables!");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing email or password");
            throw new Error("Invalid credentials");
          }

          console.log("Attempting login with email:", credentials.email);

          // Check if it's the admin account
          if (credentials.email !== ADMIN_EMAIL) {
            console.error("Email does not match admin email");
            throw new Error("Invalid email or password");
          }

          if (!ADMIN_PASSWORD_HASH) {
            console.error("ADMIN_PASSWORD_HASH not configured");
            throw new Error("Server configuration error: password not set");
          }

          const passwordMatch = await compare(
            credentials.password as string,
            ADMIN_PASSWORD_HASH
          );

          if (!passwordMatch) {
            console.error("Password does not match");
            throw new Error("Invalid email or password");
          }

          console.log("Login successful for:", credentials.email);
          return {
            id: "admin",
            email: ADMIN_EMAIL,
            name: "Admin",
            role: "admin"
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }: any) {
      try {
        if (user) {
          token.role = (user as any).role || "admin";
          token.id = (user as any).id;
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        throw error;
      }
    },
    async session({ session, token }: any) {
      try {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        throw error;
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
});
