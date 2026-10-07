/* eslint-disable */
// ETW â€” Auth.js v5 configuration
// Credentials-based login with bcrypt. Roles: ADMIN, EDITOR, USER.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        // Block disabled users, users without passwords (Google only)
        if (!user || !user.passwordHash || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        
        const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());
        const role = adminEmails.includes(user.email) ? "ADMIN" : "USER";
        
        if (!existingUser) {
           await prisma.user.create({
             data: {
               email: user.email,
               name: user.name,
               role,
               emailVerified: new Date(),
             }
           });
        } else {
           if (!existingUser.isActive) return false; // Block disabled users
           // Assign admin role if needed and not already admin
           if (role === "ADMIN" && existingUser.role !== "ADMIN") {
             await prisma.user.update({ where: { id: existingUser.id }, data: { role: "ADMIN" } });
           }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      } else if (token.id) {
        // Refresh token role from DB to pick up mid-session role changes
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
           token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});

// â”€â”€â”€ Role helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type Role = "ADMIN" | "EDITOR" | "USER";

export function hasRole(userRole: string | undefined, required: Role): boolean {
  const hierarchy: Role[] = ["USER", "EDITOR", "ADMIN"];
  const userIndex = hierarchy.indexOf((userRole ?? "USER") as Role);
  const requiredIndex = hierarchy.indexOf(required);
  return userIndex >= requiredIndex;
}

