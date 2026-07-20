import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	buildGalleryObjectPath,
	pickGalleryText,
	randomSuffix,
} from "@/lib/gallery";
import {
	GALLERY_CATEGORIES,
	GALLERY_IMAGE_MAX_BYTES,
	galleryConfirmSchema,
	galleryUploadRequestSchema,
	parseTagList,
} from "@/lib/validation";

/* ------------------------- object path building ------------------------- */

describe("buildGalleryObjectPath", () => {
	const rng = () => 0; // deterministic suffix "aaaaaa"

	it("prefixes the path with the category (bucket organisation)", () => {
		expect(buildGalleryObjectPath("battle", "My Photo.JPG", "image/jpeg", rng)).toBe(
			"battle/my-photo-aaaaaa.jpg",
		);
	});

	it("derives the extension from the MIME type, not from the filename", () => {
		expect(buildGalleryObjectPath("painting", "shot.png", "image/webp", rng)).toBe(
			"painting/shot-aaaaaa.webp",
		);
	});

	it("sanitises hostile filenames (traversal, unicode, spaces)", () => {
		const path = buildGalleryObjectPath(
			"misc",
			"../../etc/passwd çã õ!!.png",
			"image/png",
			rng,
		);
		expect(path).toBe("misc/etc-passwd-ca-o-aaaaaa.png");
		expect(path).not.toContain("..");
	});

	it("falls back to 'image' when nothing slug-worthy remains", () => {
		expect(buildGalleryObjectPath("gang", "!!!.gif", "image/gif", rng)).toBe(
			"gang/image-aaaaaa.gif",
		);
	});

	it("rejects MIME types outside the allow-list", () => {
		expect(() => buildGalleryObjectPath("battle", "x.svg", "image/svg+xml")).toThrow(
			/Unsupported MIME/,
		);
	});

	it("produced paths satisfy the confirm-schema regex", () => {
		for (const category of GALLERY_CATEGORIES) {
			const path = buildGalleryObjectPath(category, "Foo Bar.jpeg", "image/jpeg");
			expect(
				galleryConfirmSchema.safeParse({
					path,
					category,
					altEn: "Some alt text",
					width: 800,
					height: 600,
				}).success,
			).toBe(true);
		}
	});
});

describe("randomSuffix", () => {
	it("has the requested length and stays in [a-z0-9]", () => {
		for (let i = 0; i < 50; i++) {
			expect(randomSuffix()).toMatch(/^[a-z0-9]{6}$/);
		}
	});
});

/* ----------------------------- validation ------------------------------- */

describe("galleryUploadRequestSchema", () => {
	const base = { filename: "photo.jpg", mime: "image/jpeg", bytes: 1024, category: "battle" };

	it("accepts a valid request", () => {
		expect(galleryUploadRequestSchema.safeParse(base).success).toBe(true);
	});

	it("rejects files above the size limit", () => {
		expect(
			galleryUploadRequestSchema.safeParse({ ...base, bytes: GALLERY_IMAGE_MAX_BYTES + 1 })
				.success,
		).toBe(false);
	});

	it("rejects MIME types outside the allow-list (e.g. svg)", () => {
		expect(
			galleryUploadRequestSchema.safeParse({ ...base, mime: "image/svg+xml" }).success,
		).toBe(false);
	});

	it("rejects unknown categories", () => {
		expect(
			galleryUploadRequestSchema.safeParse({ ...base, category: "selfies" }).success,
		).toBe(false);
	});
});

describe("galleryConfirmSchema", () => {
	const base = {
		path: "battle/foo-a1b2c3.webp",
		category: "battle",
		altEn: "A valid alt",
		width: 1200,
		height: 800,
	};

	it("accepts a valid confirmation and applies defaults", () => {
		const parsed = galleryConfirmSchema.parse(base);
		expect(parsed.tags).toEqual([]);
		expect(parsed.altPt).toBe("");
	});

	it("rejects paths that don't match the category/slug.ext shape", () => {
		for (const bad of ["../x.png", "battle/../../x.png", "no-prefix.png", "battle/UPPER.png"]) {
			expect(galleryConfirmSchema.safeParse({ ...base, path: bad }).success).toBe(false);
		}
	});

	it("requires a minimal English alt text (accessibility)", () => {
		expect(galleryConfirmSchema.safeParse({ ...base, altEn: "no" }).success).toBe(false);
	});
});

describe("parseTagList", () => {
	it("splits, trims, lowercases and dedupes", () => {
		expect(parseTagList(" Goliath, escher ,GOLIATH,, week-3 ")).toEqual([
			"goliath",
			"escher",
			"week-3",
		]);
	});

	it("caps the list at 12 tags", () => {
		const raw = Array.from({ length: 20 }, (_, i) => `t${i}`).join(",");
		expect(parseTagList(raw)).toHaveLength(12);
	});
});

/* ------------------------------- i18n ----------------------------------- */

describe("gallery locale content", () => {
	it("pickGalleryText falls back to English when PT is empty", () => {
		const row = { altEn: "en alt", altPt: "", captionEn: "en cap", captionPt: "" };
		expect(pickGalleryText(row, "pt-BR")).toEqual({ alt: "en alt", caption: "en cap" });
		expect(pickGalleryText({ ...row, altPt: "pt alt" }, "pt-BR").alt).toBe("pt alt");
	});

	it("both message files expose the gallery nav/footer keys", () => {
		for (const file of ["en.json", "pt-BR.json"]) {
			const messages = JSON.parse(
				readFileSync(join(process.cwd(), "messages", file), "utf8"),
			);
			expect(messages.Nav.gallery, `${file}: Nav.gallery`).toBeTruthy();
			expect(
				messages.Nav.gameMenu.overview.gallery,
				`${file}: Nav.gameMenu.overview.gallery`,
			).toBeTruthy();
			expect(messages.Footer.links.gallery, `${file}: Footer.links.gallery`).toBeTruthy();
		}
	});
});
