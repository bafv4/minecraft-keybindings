import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Providers } from "@/components/Providers";

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-zen-kaku-gothic-new',
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
    <html lang="ja" className={`h-full ${zenKakuGothicNew.variable}`}>
      <body className="h-full flex flex-col font-sans">
        <Providers>
          <HeaderWrapper />
          <main className="container mx-auto px-4 py-6 md:py-8 pt-20 md:pt-28 flex-1 flex flex-col min-h-0">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
