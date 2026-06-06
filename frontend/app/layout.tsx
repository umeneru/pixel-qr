import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixel QR",
  description: "ドット絵を中央に埋め込んだ QR コードを生成できます",
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
