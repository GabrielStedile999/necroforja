import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Share_Tech_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site-url";

const chakra = Chakra_Petch({
	subsets: ["latin"],
	variable: "--font-chakra",
	weight: ["400", "600", "700"],
});
const shareMono = Share_Tech_Mono({
	subsets: ["latin"],
	variable: "--font-share-mono",
	weight: "400",
});

// Canonical base URL — used by Next.js to prefix relative metadata URLs.
const siteUrl = SITE_URL;

export const metadata: Metadata = {
	// ---- Base URL (makes all relative URLs canonical) ----
	metadataBase: new URL(siteUrl),

	// ---- Titles ----
	title: {
		default: "NecroForja — Necromunda Campaign Manager",
		template: "%s · NecroForja",
	},

	// ---- Description ----
	// "digital campaign manager / web app" ancora a entidade (issue #47) —
	// a NecroForja é um app, não uma loja de miniaturas (≠ NecroForge).
	description:
		"NecroForja is a digital campaign manager for Necromunda — a free web app to track gangs, Sympathisers and the campaign ranking in real time.",

	// ---- Canonical ----
	alternates: { canonical: "/" },

	// ---- Author ----
	// LinkedIn como URL do autor (issue #49) — mesma referência do crédito no footer.
	authors: [
		{
			name: "Gabriel Stedile",
			url: "https://www.linkedin.com/in/gabriel-stedile/",
		},
	],
	creator: "Gabriel Stedile",

	// ---- Keywords (secondary signal; not critical for modern SEO) ----
	keywords: [
		"Necromunda",
		"campaign manager",
		"gang tracker",
		"Cinderak Burning",
		"Aranthian Succession",
		"Warhammer",
		"tabletop",
	],

	// ---- Open Graph ----
	openGraph: {
		type: "website",
		url: siteUrl,
		siteName: "NecroForja",
		title: "NecroForja — Necromunda Campaign Manager",
		description:
			"A digital campaign manager for Necromunda — track gangs, Sympathisers and the campaign ranking in real time.",
		locale: "en_US",
		// The /opengraph-image.tsx route is picked up automatically by Next.js
		// as the default OG image for all pages in this layout.
	},

	// ---- Twitter / X card ----
	twitter: {
		card: "summary_large_image",
		title: "NecroForja — Necromunda Campaign Manager",
		description:
			"A digital campaign manager for Necromunda — track gangs, Sympathisers and the campaign ranking in real time.",
		creator: "@gabrielstedile",
	},

	// ---- Robots ----
	// Default: allow indexing on the landing. Pages that should be private
	// override this with { robots: { index: false, follow: false } } in their
	// own metadata export.
	robots: { index: true, follow: true },

	// ---- PWA ----
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "NecroForja",
	},

	// ---- Icons ----
	// `?v=2` força o refresh do cache de favicon do Google/navegadores após a
	// troca para o crest oficial (issue #28) — sem isso o ícone antigo pode
	// ficar em cache por dias/semanas mesmo com o arquivo já atualizado.
	icons: {
		// Apple-touch-icon for iOS home-screen add (manifest icons are ignored there)
		apple: [
			{ url: "/icons/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
		],
		icon: [
			// `src/app/favicon.ico` (16/32/48px) é servido automaticamente pelo
			// Next.js em "/favicon.ico" — elimina o 404 que impedia o crawler
			// de favicon do Google de pegar o ícone novo.
			{ url: "/icon.svg?v=2", type: "image/svg+xml" },
			{ url: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
		],
	},
};

/**
 * Viewport export — desde o Next 14, themeColor/viewport/colorScheme saem do
 * `metadata` e vêm para cá (o themeColor duplica o manifest.ts p/ iOS Safari).
 */
export const viewport: Viewport = {
	themeColor: "#ff2d6f",
};

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	// Locale comes from the NEXT_LOCALE cookie (default "en" — no detection).
	const locale = await getLocale();
	const messages = await getMessages();

	return (
		<html lang={locale}>
			<body className={`${chakra.variable} ${shareMono.variable} antialiased`}>
				<NextIntlClientProvider locale={locale} messages={messages}>
					{/* PWA: offline banner renders at top of viewport when network is lost */}
					<OfflineBanner />
					{children}
					{/* PWA: registers /sw.js; renders nothing */}
					<PwaRegister />
				</NextIntlClientProvider>
				<Analytics />
			</body>
		</html>
	);
}
