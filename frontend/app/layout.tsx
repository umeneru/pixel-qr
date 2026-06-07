import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixel QR",
  description: "ドット絵を中央に埋め込んだ QR コードを生成できます",
  icons: {
    icon: [
      {
        url: "/favicon.ico?v=20260607",
        type: "image/x-icon",
        sizes: "32x32",
      },
    ],
    shortcut: "/favicon.ico?v=20260607",
    apple: "/images/logo.png?v=20260607",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
