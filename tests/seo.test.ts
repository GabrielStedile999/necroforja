import { describe, expect, it } from "vitest";
import { buildWebsiteJsonLd, buildAppJsonLd } from "@/lib/seo/json-ld";

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

  it("includes a description", () => {
    expect(ld.description.length).toBeGreaterThan(10);
  });

  it("author is a Person with a url", () => {
    expect(ld.author["@type"]).toBe("Person");
    expect(ld.author.url).toBe(SITE);
  });

  it("potentialAction target contains the siteUrl", () => {
    expect(ld.potentialAction.target).toContain(SITE);
  });

  it("uses different siteUrl correctly when called with another URL", () => {
    const other = buildWebsiteJsonLd("http://localhost:3000");
    expect(other.url).toBe("http://localhost:3000");
    expect(other.potentialAction.target).toContain("http://localhost:3000");
    expect(other.author.url).toBe("http://localhost:3000");
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
});
