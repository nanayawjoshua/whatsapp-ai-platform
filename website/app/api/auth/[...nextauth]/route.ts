import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * NextAuth Configuration (BUZZ)
 *
 * NOTE: In BUZZ, primary authentication is via WhatsApp/Supabase
 * NextAuth is kept for dashboard admin access only
 *
 * For vendor authentication, use Supabase Auth directly
 */

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        vendorId: { label: 'Vendor ID', type: 'text' },
      },
      async authorize(credentials) {
        if (credentials?.vendorId) {
          // Return user object with vendorId as id
          return {
            id: credentials.vendorId,
            vendorId: credentials.vendorId,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.vendorId = user.vendorId || user.id;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session.user as any).vendorId = token.vendorId;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
