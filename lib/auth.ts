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
      allowDangerousEmailAccountLinking: true,
    }) as any,
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, trigger, session }: any) {
      console.log('🔑 JWT callback triggered:', { trigger, session });
      if (trigger === 'update' && session) {
        if (session.name) {
          token.name = session.name;
          console.log('✅ Updated token.name:', token.name);
        }
        if (session.image) {
          token.picture = session.image;
          console.log('✅ Updated token.picture:', token.picture);
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log('🔄 Session callback:', { token });
      if (session.user) {
        session.user.id = token.sub!;
        session.user.name = token.name || session.user.name;
        session.user.image = token.picture || session.user.image;
        console.log('✅ Session user image:', session.user.image);
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
            body: JSON.stringify({ email: user.email, name: user.name || 'User' }),
          });
        } catch (error) {
          console.error('Failed to send welcome email:', error);
        }
      }
    },
  },
};  