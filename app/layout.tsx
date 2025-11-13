import type { Metadata } from "next";
// Temporarily commented out due to network restrictions in build environment
// import { M_PLUS_1p } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

// const mPlus1p = M_PLUS_1p({
//   subsets: ["latin"],
//   weight: ["400", "500", "700", "800"],
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "MCSRer Hotkeys",
  description: "Minecraft操作設定共有サイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
