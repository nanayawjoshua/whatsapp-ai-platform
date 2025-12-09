import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from '@/lib/db';
import { verifyPassword, generateSessionId } from '@/lib/auth';

const authOptions: NextAuthOptions = {
  // Configure NEXTAUTH_URL to match production domain
  // Must match one of the Google OAuth redirect URIs
  // If NEXTAUTH_URL not set, NextAuth attempts to auto-detect from host header
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      // Explicitly set the callback URL to handle redirect_uri_mismatch
      // NextAuth will append /api/auth/callback/google to this base
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        try {
          // Check if identifier is email or phone
          const isEmail = credentials.identifier.includes('@');
          const searchField = isEmail ? 'email' : 'phone';

          // Find vendor
          const result = await query(
            `SELECT vendor_id, name, email, phone, business_type,
                    password_hash, subscription_status
             FROM vendors
             WHERE ${searchField} = $1
             LIMIT 1`,
            [credentials.identifier]
          );

          if (result.rows.length === 0) {
            return null;
          }

          const vendor = result.rows[0];

          // Verify password
          if (!vendor.password_hash || !verifyPassword(credentials.password, vendor.password_hash)) {
            return null;
          }

          // Return user object
          return {
            id: vendor.vendor_id,
            name: vendor.name,
            email: vendor.email,
            image: null,
            vendorId: vendor.vendor_id,
            phone: vendor.phone,
            businessType: vendor.business_type,
            subscriptionStatus: vendor.subscription_status,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback:', { url, baseUrl });
      // Allow absolute URLs, otherwise use relative to baseUrl
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === new URL(baseUrl).origin) return url;
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google' && profile?.email) {
        try {
          // Check if vendor exists with this email
          const result = await query(
            `SELECT vendor_id, name, email, phone, business_type, subscription_status
             FROM vendors
             WHERE email = $1
             LIMIT 1`,
            [profile.email]
          );

          if (result.rows.length > 0) {
            // Vendor exists, update user object
            const vendor = result.rows[0];
            user.id = vendor.vendor_id;
            user.vendorId = vendor.vendor_id;
            user.phone = vendor.phone;
            user.businessType = vendor.business_type;
            user.subscriptionStatus = vendor.subscription_status;
            return true;
          } else {
            // Vendor doesn't exist - need to complete signup first
            // For now, we'll reject. In future, create vendor record here
            console.log('Google user not found in vendors table:', profile.email);
            return '/signup?error=account_not_found';
          }
        } catch (error) {
          console.error('Sign in error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Add custom fields to JWT
      if (user) {
        token.vendorId = user.vendorId;
        token.phone = user.phone;
        token.businessType = user.businessType;
        token.subscriptionStatus = user.subscriptionStatus;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session
      if (session.user) {
        session.user.vendorId = token.vendorId as string;
        session.user.phone = token.phone as string;
        session.user.businessType = token.businessType as string;
        session.user.subscriptionStatus = token.subscriptionStatus as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
