import { describe, expect, it } from "vitest";
import {
  buildWebsiteJsonLd,
  buildAppJsonLd,
  buildFaqJsonLd,
  buildCreatorJsonLd,
  SITE_REPO_URL,
  AUTHOR_LINKEDIN_URL,
} from "@/lib/seo/json-ld";

const SITE = "https://necroforja.vercel.app";

describe("buildWebsiteJsonLd", () => {
  const ld = buildWebsiteJsonLd(SITE);

  it("has the correct @type and @context", () => {
    expect(ld["@type"]).toBe("WebSite");
    expect(ld["@context"]).toBe("https://schema.org");
  });

  it("embeds the siteUrl as url", () => {
    expect(ld.url).toBe(SITE);
  });

  it("sets name to NecroForja", () => {
    expect(ld.name).toBe("NecroForja");
  });

  it("includes a description anchored on 'campaign manager' (issue #47)", () => {
    expect(ld.description.length).toBeGreaterThan(10);
    expect(ld.description.toLowerCase()).toContain("campaign manager");
  });

  it("lists alternate names for the brand (issue #47)", () => {
    expect(ld.alternateName).toContain("Necroforja");
    expect(ld.alternateName.length).toBeGreaterThan(0);
  });

  it("declares both site languages (issue #47)", () => {
    expect(ld.inLanguage).toEqual(["en", "pt-BR"]);
  });

  it("links the public GitHub repo via sameAs (issue #47)", () => {
    expect(ld.sameAs).toContain(SITE_REPO_URL);
  });

  it("author is a Person pointing at the LinkedIn profile (issues #47/#49)", () => {
    expect(ld.author["@type"]).toBe("Person");
    expect(ld.author.url).toBe(AUTHOR_LINKEDIN_URL);
  });

  it("publisher mirrors the author entity", () => {
    expect(ld.publisher).toEqual(ld.author);
  });

  it("potentialAction target contains the siteUrl", () => {
    expect(ld.potentialAction.target).toContain(SITE);
  });

  it("uses different siteUrl correctly when called with another URL", () => {
    const other = buildWebsiteJsonLd("http://localhost:3000");
    expect(other.url).toBe("http://localhost:3000");
    expect(other.potentialAction.target).toContain("http://localhost:3000");
  });
});

describe("buildAppJsonLd", () => {
  const ld = buildAppJsonLd(SITE);

  it("has the correct @type", () => {
    expect(ld["@type"]).toBe("SoftwareApplication");
  });

  it("applicationCategory is GameApplication", () => {
    expect(ld.applicationCategory).toBe("GameApplication");
  });

  it("operatingSystem is Any", () => {
    expect(ld.operatingSystem).toBe("Any");
  });

  it("offers price is 0 (free)", () => {
    expect(ld.offers.price).toBe("0");
  });

  it("url matches the siteUrl argument", () => {
    expect(ld.url).toBe(SITE);
  });

  it("declares languages and sameAs like the WebSite node (issue #47)", () => {
    expect(ld.inLanguage).toEqual(["en", "pt-BR"]);
    expect(ld.sameAs).toContain(SITE_REPO_URL);
  });
});

describe("buildFaqJsonLd", () => {
  const items = [
    { question: "What is NecroForja?", answer: "A digital campaign manager." },
    { question: "Does it sell miniatures?", answer: "No — it is not a store." },
  ];
  const ld = buildFaqJsonLd(SITE, items);

  it("has the correct @type and url", () => {
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.url).toBe(`${SITE}/faq`);
  });

  it("is declared in English (the locale crawlers see)", () => {
    expect(ld.inLanguage).toBe("en");
  });

  it("maps every item to a Question with an acceptedAnswer", () => {
    expect(ld.mainEntity).toHaveLength(items.length);
    for (const [index, entity] of ld.mainEntity.entries()) {
      const source = items[index];
      expect(source).toBeDefined();
      if (!source) continue;
      expect(entity["@type"]).toBe("Question");
      expect(entity.name).toBe(source.question);
      expect(entity.acceptedAnswer["@type"]).toBe("Answer");
      expect(entity.acceptedAnswer.text).toBe(source.answer);
    }
  });

  it("returns an empty mainEntity for an empty list", () => {
    expect(buildFaqJsonLd(SITE, []).mainEntity).toEqual([]);
  });
});

describe("buildCreatorJsonLd", () => {
  const ld = buildCreatorJsonLd(SITE);

  it("has the correct @type and url", () => {
    expect(ld["@type"]).toBe("ProfilePage");
    expect(ld.url).toBe(`${SITE}/creator`);
  });

  it("declares both site languages", () => {
    expect(ld.inLanguage).toEqual(["en", "pt-BR"]);
  });

  it("mainEntity is the Gabriel Stedile Person anchored at /creator", () => {
    expect(ld.mainEntity["@type"]).toBe("Person");
    expect(ld.mainEntity.name).toBe("Gabriel Stedile");
    expect(ld.mainEntity.url).toBe(`${SITE}/creator`);
  });

  it("sameAs links LinkedIn and the public repo (entity anchoring, issue #47)", () => {
    expect(ld.mainEntity.sameAs).toContain(AUTHOR_LINKEDIN_URL);
    expect(ld.mainEntity.sameAs).toContain(SITE_REPO_URL);
  });

  it("knowsAbout includes Necromunda", () => {
    expect(ld.mainEntity.knowsAbout).toContain("Necromunda");
  });
});
