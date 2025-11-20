import type { Metadata } from "next";
import { IBM_Plex_Sans_JP, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/HeaderWrapper";

const fontSetting = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
});

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
      <body className={`h-full flex flex-col ${fontSetting.className}`}>
        <HeaderWrapper />
        <main className="container mx-auto px-4 py-8 pt-28 flex-1 flex flex-col min-h-0">
          {children}
        </main>
      </body>
    </html>
  );
}
