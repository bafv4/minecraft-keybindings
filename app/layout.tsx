import type { Metadata } from "next";
import "./globals.css";
import { HeaderWrapper } from "@/components/HeaderWrapper";

export const metadata: Metadata = {
  title: "MCSRer Hotkeys",
  description: "RTA勢の設定はこうなっている！",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'MCSRer Hotkeys',
    title: 'MCSRer Hotkeys',
    description: 'RTA勢の設定はこうなっている！',
  },
  twitter: {
    card: 'summary',
    title: 'MCSRer Hotkeys',
    description: 'RTA勢の設定はこうなっている！',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full flex flex-col font-sans">
        <HeaderWrapper />
        <main className="container mx-auto px-4 py-8 pt-28 flex-1 flex flex-col min-h-0">
          {children}
        </main>
      </body>
    </html>
  );
}
