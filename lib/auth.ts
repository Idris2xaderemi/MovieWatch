import { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { clientPromise } from './mongodb';

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true
    }),
  ],
  session: { strategy: 'jwt' },
  // ✅ Enable email-based account linking (valid runtime option)
  
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      session.userId = token.sub!;
      return session;
    },
  },
  events: {
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
} as any; // ✅ Type assertion silences the TS error