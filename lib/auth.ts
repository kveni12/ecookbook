import "server-only";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { MembershipRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { db } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in"
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          })
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (rawCredentials) => {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() }
        });
        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        (token as { userId?: string }).userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const userId = (token as { userId?: string }).userId;
      if (session.user && userId) {
        session.user.id = userId;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      if (!user.id) {
        return;
      }

      const spaceCount = await db.cookbookSpace.count({
        where: { ownerId: user.id }
      });

      if (spaceCount === 0) {
        const slugBase = `${(user.name ?? user.email?.split("@")[0] ?? "family").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-kitchen`;
        const slug = `${slugBase}-${user.id.slice(0, 6)}`;

        await db.cookbookSpace.create({
          data: {
            name: `${user.name ?? "My"} Family Kitchen`,
            slug,
            ownerId: user.id,
            memberships: {
              create: {
                userId: user.id,
                role: MembershipRole.OWNER
              }
            }
          }
        });
      }
    }
  }
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
