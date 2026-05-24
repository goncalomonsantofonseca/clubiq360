import type { Metadata } from "next";
import { Archivo_Black, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans-ui",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-display-ui",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClubIQ 360",
  description:
    "Apresentacao comercial ClubIQ 360 para clubes de futebol, com percursos adaptaveis por cliente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-PT"
      className={`${plusJakartaSans.variable} ${archivoBlack.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
