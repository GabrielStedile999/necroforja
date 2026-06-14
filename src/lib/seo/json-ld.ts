/**
 * JSON-LD structured data builders.
 *
 * Pure functions — no side effects, fully testable with Vitest.
 * Consumed by app/page.tsx via a <script type="application/ld+json"> tag.
 */

export interface WebsiteJsonLd {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  author: {
    "@type": "Person";
    name: string;
    url: string;
  };
  potentialAction: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}

export interface SoftwareApplicationJsonLd {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  url: string;
  description: string;
  applicationCategory: "GameApplication";
  operatingSystem: "Any";
  author: {
    "@type": "Person";
    name: string;
  };
  offers: {
    "@type": "Offer";
    price: "0";
    priceCurrency: "USD";
  };
}

/**
 * WebSite schema — helps search engines understand the site identity and
 * enables a potential SearchBox in Google results.
 */
export function buildWebsiteJsonLd(siteUrl: string): WebsiteJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NecroForja",
    url: siteUrl,
    description:
      "Necromunda campaign manager — track gangs, Sympathisers and the campaign ranking in real time.",
    author: {
      "@type": "Person",
      name: "Gabriel Stedile",
      url: siteUrl,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * SoftwareApplication schema — signals that this is a web app, which can
 * improve appearance in search results for branded queries.
 */
export function buildAppJsonLd(siteUrl: string): SoftwareApplicationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NecroForja — Necromunda Campaign Manager",
    url: siteUrl,
    description:
      "Real-time campaign dashboard for Necromunda: The Aranthian Succession – Cinderak Burning.",
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    author: {
      "@type": "Person",
      name: "Gabriel Stedile",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
