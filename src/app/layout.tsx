import type { Metadata } from "next";
import { Chakra_Petch, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Analytics } from "@vercel/analytics/next";

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
// Falls back to a sensible default so builds never fail without env vars.
const siteUrl = process.env.AUTH_URL || "https://necroforja.vercel.app";

export const metadata: Metadata = {
	// ---- Base URL (makes all relative URLs canonical) ----
	metadataBase: new URL(siteUrl),

	// ---- Titles ----
	title: {
		default: "NecroForja — Necromunda Campaign Manager",
		template: "%s · NecroForja",
	},

	// ---- Description ----
	description:
		"NecroForja: Necromunda campaign manager. Track gangs, Sympathisers and the campaign ranking in real time.",

	// ---- Canonical ----
	alternates: { canonical: "/" },

	// ---- Author ----
	authors: [{ name: "Gabriel Stedile", url: siteUrl }],
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
			"Track gangs, Sympathisers and the campaign ranking in real time.",
		locale: "en_US",
		// The /opengraph-image.tsx route is picked up automatically by Next.js
		// as the default OG image for all pages in this layout.
	},

	// ---- Twitter / X card ----
	twitter: {
		card: "summary_large_image",
		title: "NecroForja — Necromunda Campaign Manager",
		description:
			"Track gangs, Sympathisers and the campaign ranking in real time.",
		creator: "@gabrielstedile",
	},

	// ---- Robots ----
	// Default: allow indexing on the landing. Pages that should be private
	// override this with { robots: { index: false, follow: false } } in their
	// own metadata export.
	robots: { index: true, follow: true },

	// ---- PWA — theme-color (duplicates manifest.ts for iOS Safari) ----
	themeColor: "#ff2d6f",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "NecroForja",
	},

	// ---- Icons ----
	icons: {
		// Apple-touch-icon for iOS home-screen add (manifest icons are ignored there)
		apple: [
			{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
		],
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
			<body className={`${chakra.variable} ${shareMono.variable} antialiased`}>
				{/* PWA: offline banner renders at top of viewport when network is lost */}
				<OfflineBanner />
				{children}
				{/* PWA: registers /sw.js; renders nothing */}
				<PwaRegister />
				<Analytics />
			</body>
		</html>
	);
}
