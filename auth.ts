import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/src/db";
import { customersTable } from "@/src/db/schema";
import { eq, sql } from "drizzle-orm";

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: getRequiredEnvVar("GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnvVar("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          if (!user.email) throw new Error("No email from Google");

          const existingUser = await db
            .select()
            .from(customersTable)
            .where(eq(customersTable.email, user.email))
            .get();

          if (!existingUser && user.id && user.name) {
            await db.insert(customersTable).values({
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image || null,
              createdAt: sql`CURRENT_TIMESTAMP`,
              updatedAt: sql`CURRENT_TIMESTAMP`
            });
          }
          return true;
        } catch (err) {
          console.error("Database error during sign-in:", err);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const dbUser = await db
          .select()
          .from(customersTable)
          .where(eq(customersTable.email, session.user.email))
          .get();

        if (dbUser?.id) {
          session.user.id = dbUser.id;
        } else if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
  },
  pages: {
    signIn: "/customer/auth/login",
  },
  secret: getRequiredEnvVar("NEXTAUTH_SECRET"),
};
