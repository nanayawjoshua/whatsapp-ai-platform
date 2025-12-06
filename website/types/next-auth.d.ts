import 'next-auth';

declare module 'next-auth' {
  interface User {
    vendorId?: string;
    phone?: string;
    businessType?: string;
    subscriptionStatus?: string;
  }

  interface Session {
    user: {
      vendorId: string;
      phone: string;
      businessType: string;
      subscriptionStatus: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    vendorId?: string;
    phone?: string;
    businessType?: string;
    subscriptionStatus?: string;
  }
}
