import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
    default: "NecroForja — Gestor de Campanhas de Necromunda",
    template: "%s · NecroForja",
  },
  description:
    "NecroForja: gestor de campanhas de Necromunda. Acompanhe gangues, Sympathisers e o ranking da campanha em tempo real.",
  openGraph: {
    title: "NecroForja — Gestor de Campanhas de Necromunda",
    description:
      "Acompanhe gangues, Sympathisers e o ranking da campanha em tempo real.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${oswald.variable} ${inter.variable} ${jetbrains.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
