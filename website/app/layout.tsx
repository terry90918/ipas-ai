import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iPAS 自習室｜AI 應用規劃師",
  description: "iPAS AI 應用規劃師個人練習：五題一輪、逐題詳解與錯題複習。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">{children}</body>
    </html>
  );
}
