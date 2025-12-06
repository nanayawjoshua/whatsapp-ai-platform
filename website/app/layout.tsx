import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beeline - Your AI Employee Lives in Your Phone Number",
  description: "Turn your WhatsApp into a 24/7 AI employee for just $9/month. Never miss a sale again.",
  keywords: "AI employee, WhatsApp business, Ghana, automated sales, chatbot",
  openGraph: {
    title: "Beeline - Your AI Employee Lives in Your Phone Number",
    description: "Turn your WhatsApp into a 24/7 AI employee for just $9/month",
    type: "website",
    url: "https://beeline.works",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
