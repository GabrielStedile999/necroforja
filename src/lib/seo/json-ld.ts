/**
 * JSON-LD structured data builders.
 *
 * Pure functions — no side effects, fully testable with Vitest.
 * Consumed by app/page.tsx (WebSite + SoftwareApplication) and app/faq/page.tsx
 * (FAQPage) via <script type="application/ld+json"> tags.
 *
 * Issue #47: the Google AI Overview conflated NecroForja with the German
 * miniature brand "NecroForge" (necroforge.de). The builders below anchor the
 * entity explicitly — alternateName spellings, sameAs pointing at the public
 * GitHub repository, inLanguage for both locales and a consistent Person
 * author — so crawlers have an unambiguous identity to cite.
 */

/** Public GitHub repository — the site's only other official presence. */
export const SITE_REPO_URL = "https://github.com/GabrielStedile999/necroforja";

/** Author profile — same reference used by the footer credit (issue #49). */
export const AUTHOR_LINKEDIN_URL = "https://www.linkedin.com/in/gabriel-stedile/";

/** Alternate spellings/names the brand is known by. */
export const SITE_ALTERNATE_NAMES = [
  "Necroforja",
  "NecroForja Campaign Manager",
] as const;

/** Locales served by the site (cookie-based — no locale routes). */
export const SITE_LANGUAGES = ["en", "pt-BR"] as const;

interface PersonJsonLd {
  "@type": "Person";
  name: string;
  url: string;
}

export interface WebsiteJsonLd {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  alternateName: string[];
  url: string;
  description: string;
  inLanguage: string[];
  sameAs: string[];
  author: PersonJsonLd;
  publisher: PersonJsonLd;
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
  alternateName: string[];
  url: string;
  description: string;
  inLanguage: string[];
  sameAs: string[];
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

export interface FaqPageJsonLd {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  url: string;
  inLanguage: string;
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }[];
}

/** A single question/answer pair for the FAQPage schema. */
export type FaqJsonLdItem = {
  question: string;
  answer: string;
};

function buildAuthor(): PersonJsonLd {
  return {
    "@type": "Person",
    name: "Gabriel Stedile",
    url: AUTHOR_LINKEDIN_URL,
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
    alternateName: [...SITE_ALTERNATE_NAMES],
    url: siteUrl,
    description:
      "NecroForja is a free web app — a digital campaign manager and dashboard for the tabletop game Necromunda. Track gangs, Sympathisers and the campaign ranking in real time.",
    inLanguage: [...SITE_LANGUAGES],
    sameAs: [SITE_REPO_URL],
    author: buildAuthor(),
    publisher: buildAuthor(),
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
    alternateName: [...SITE_ALTERNATE_NAMES],
    url: siteUrl,
    description:
      "Free web application for managing a Necromunda tabletop campaign: live gang rankings, Sympathisers, battle reports and gallery for The Aranthian Succession – Cinderak Burning.",
    inLanguage: [...SITE_LANGUAGES],
    sameAs: [SITE_REPO_URL],
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

/**
 * FAQPage schema (issue #41 + #47) — marks the /faq questions up for rich
 * results. Only the EN strings are passed in: Google crawls the site in
 * English (locale lives in a cookie, default "en").
 */
export function buildFaqJsonLd(siteUrl: string, items: FaqJsonLdItem[]): FaqPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${siteUrl}/faq`,
    inLanguage: "en",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
