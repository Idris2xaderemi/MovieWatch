import { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { clientPromise } from './mongodb';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // ✅ Allows linking accounts with the same email (safe, prevents OAuthAccountNotLinked)
      allowDangerousEmailAccountLinking: true,
    }) as any, // Type assertion needed because the type definition is outdated
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    /**
     * JWT callback – handles token updates when the session is refreshed.
     * This enables the navbar to show the updated name after profile changes.
     * The `session` parameter is available when `trigger === 'update'`.
     */
    async jwt({ token, trigger, session }: any) {
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }
      return token;
    },

    /**
     * Session callback – adds user ID and name to the session object.
     * Uses `token.name` if updated, otherwise falls back to `session.user.name`.
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub!;
        // Use token.name if available (from JWT update)
        session.user.name = token.name || session.user.name;
      }
      // Top‑level userId for convenience
      session.userId = token.sub!;
      return session;
    },
  },
  events: {
    /**
     * signIn event – sends a welcome email to new users.
     * Only triggers when `isNewUser` is true (database adapter required).
     */
    async signIn({ user, isNewUser }: { user: any; isNewUser?: boolean }) {
      if (isNewUser && user.email) {
        try {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          await fetch(`${baseUrl}/api/send-welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name || 'User',
            }),
          });
        } catch (error) {
          console.error('Failed to send welcome email:', error);
        }
      }
    },
  },
};