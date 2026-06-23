import type { Metadata } from "next";
import Ticker from "@/components/landing/Ticker";
import SiteNav from "@/components/landing/SiteNav";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Houses from "@/components/landing/Houses";
import News from "@/components/landing/News";
import BigCTA from "@/components/landing/BigCTA";
import SiteFooter from "@/components/landing/SiteFooter";
import { buildWebsiteJsonLd, buildAppJsonLd } from "@/lib/seo/json-ld";

/**
 * Hi-Fi marketing landing page — pixel-faithful React implementation
 * of the NecroForja Claude Design Hi-Fi mockup.
 *
 * ISR: revalidate every 60 s.
 */
export const revalidate = 60;

const siteUrl = process.env.AUTH_URL || "https://necroforja.vercel.app";

export const metadata: Metadata = {
  title: "NecroForja — Necromunda Campaign Manager",
  description:
    "The ultimate Necromunda campaign manager. Track gangs, Sympathisers, and the ranking of The Aranthian Succession: Cinderak Burning.",
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  const websiteJsonLd = buildWebsiteJsonLd(siteUrl);
  const appJsonLd = buildAppJsonLd(siteUrl);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflowX: "hidden",
        background: "#0b0a0d",
        backgroundImage:
          "radial-gradient(1400px 700px at 25% -10%,rgba(255,45,111,.07),transparent),radial-gradient(1200px 700px at 95% 6%,rgba(0,229,255,.05),transparent)",
        fontFamily: "'Chakra Petch', sans-serif",
        color: "#f5f5fa",
      }}
    >
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      <Ticker />
      <SiteNav />

      <main>
        <Hero />
        <Features />
        <Houses />
        <News />
        <BigCTA />
      </main>

      <SiteFooter />
    </div>
  );
}
