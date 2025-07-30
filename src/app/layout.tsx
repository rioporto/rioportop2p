import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "../styles/variables.css";
import "../styles/themes/light.css";
import "../styles/themes/dark.css";
import "../styles/animations.css";
import "../styles/accessibility.css";
import { ThemeProvider, ThemeScript } from "@/contexts/ThemeContext";
import { ClientStackProvider } from "@/components/providers/ClientStackProvider";
import { 
  defaultMetadata, 
  organizationSchema, 
  websiteSchema, 
  resourceHints,
  generateJsonLd 
} from "@/lib/seo-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = defaultMetadata;

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
        
        {/* Resource hints for performance */}
        {resourceHints.map((hint) => (
          <link
            key={hint.href}
            rel={hint.rel}
            href={hint.href}
            crossOrigin={hint.crossOrigin}
          />
        ))}
        
        {/* Structured Data */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateJsonLd(organizationSchema),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateJsonLd(websiteSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClientStackProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ClientStackProvider>
      </body>
    </html>
  );
}
