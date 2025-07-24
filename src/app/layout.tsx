import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/variables.css";
import "../styles/themes/light.css";
import "../styles/themes/dark.css";
import "../styles/animations.css";
import { ThemeProvider, ThemeScript } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rio Porto P2P",
  description: "Plataforma P2P de criptomoedas com sistema de KYC em níveis",
  keywords: "p2p, crypto, bitcoin, criptomoedas, brasil, kyc",
  authors: [{ name: "Rio Porto Team" }],
  creator: "Rio Porto",
  publisher: "Rio Porto",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Rio Porto P2P",
    description: "Plataforma P2P de criptomoedas com sistema de KYC em níveis",
    url: "https://rioporto.com.br",
    siteName: "Rio Porto P2P",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rio Porto P2P",
    description: "Plataforma P2P de criptomoedas com sistema de KYC em níveis",
    creator: "@rioportop2p",
  },
  alternates: {
    canonical: "https://rioporto.com.br",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
