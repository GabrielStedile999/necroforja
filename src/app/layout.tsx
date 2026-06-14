import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";
import { OfflineBanner } from "@/components/OfflineBanner";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: "NecroForja — Necromunda Campaign Manager",
    template: "%s · NecroForja",
  },
  description:
    "NecroForja: Necromunda campaign manager. Track gangs, Sympathisers and the campaign ranking in real time.",
  openGraph: {
    title: "NecroForja — Necromunda Campaign Manager",
    description:
      "Track gangs, Sympathisers and the campaign ranking in real time.",
    type: "website",
  },
  robots: { index: true, follow: true },
  // PWA — theme-color for mobile browsers (duplicates manifest.ts for iOS Safari)
  themeColor: "#f2a900",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NecroForja",
  },
  icons: {
    // Apple-touch-icon for iOS home-screen add (manifest icons are ignored there)
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${inter.variable} ${jetbrains.variable} antialiased`}
      >
        {/* PWA: offline banner renders at top of viewport when network is lost */}
        <OfflineBanner />
        {children}
        {/* PWA: registers /sw.js; renders nothing */}
        <PwaRegister />
      </body>
    </html>
  );
}
