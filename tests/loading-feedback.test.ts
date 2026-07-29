import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Issue #60 — loading estilizado (cyberpunk) para interações do usuário:
 * - Spinner compartilhado em ui/ com o contrato de a11y da issue
 *   (role="status" + sr-only quando rotulado; decorativo quando o texto
 *   visível ao lado já anuncia o estado);
 * - CSS do spinner e da barra de navegação com anti-flicker (~180ms) e
 *   fallback de prefers-reduced-motion (sem giro infinito);
 * - barra de progresso global (nextjs-toploader) renderizada uma vez no
 *   layout raiz, restilizada com o gradiente magenta→cyan do tema;
 * - todos os forms/interações mapeados na issue conectados ao feedback
 *   visual (prop `pending` do Button ou Spinner direto).
 *
 * Mesmo estilo dos testes de convenção do repo (login-ux, user-menu):
 * leitura de fonte + asserções de contrato, sem renderizar React.
 */

const read = (path: string) => readFileSync(path, "utf-8");

describe("Spinner primitive (issue #60)", () => {
	const spinner = read("src/components/ui/spinner.tsx");

	it("announces via role=status when labelled, decorative otherwise", () => {
		expect(spinner).toContain('role: "status"');
		expect(spinner).toContain('"aria-hidden": true');
	});

	it("hides the label visually but keeps it for screen readers", () => {
		expect(spinner).toContain("sr-only");
	});

	it("uses the delayed-appearance wrapper (anti-flicker)", () => {
		expect(spinner).toContain("ncf-spinner-delay");
	});

	it("the SVG itself is always decorative", () => {
		expect(spinner).toContain('aria-hidden="true"');
	});
});

describe("loading CSS (globals.css)", () => {
	const css = read("src/app/globals.css");

	it("defines the spinner animation reusing the ncf-sweep keyframe", () => {
		expect(css).toMatch(/\.ncf-spinner\s*\{\s*animation:\s*ncf-sweep/);
	});

	it("only shows indicators after ~180ms (anti-flicker delay)", () => {
		expect(css).toContain(".ncf-spinner-delay");
		expect(css).toMatch(/ncf-appear[^;]*\.18s/);
	});

	it("disables the infinite spin under prefers-reduced-motion", () => {
		expect(css).toMatch(
			/@media \(prefers-reduced-motion: reduce\)[^}]*\{[^}]*\.ncf-spinner\s*\{\s*animation:\s*none/,
		);
	});

	it("restyles the navigation bar with the theme gradient + glow", () => {
		expect(css).toContain("#nprogress .bar");
		expect(css).toMatch(/#nprogress \.bar[\s\S]*linear-gradient\(90deg, #ff2d6f/);
		// mesma aparição atrasada do spinner (barra não pisca em navegação rápida)
		expect(css).toMatch(/#nprogress\s*\{[^}]*ncf-appear/);
	});
});

describe("Button pending state (issue #60)", () => {
	const button = read("src/components/ui/button.tsx");

	it("exposes a pending prop that disables + marks aria-busy", () => {
		expect(button).toContain("pending?: boolean");
		expect(button).toContain("disabled={disabled || pending}");
		expect(button).toContain("aria-busy={pending || undefined}");
	});

	it("renders the shared Spinner while pending", () => {
		expect(button).toContain('from "@/components/ui/spinner"');
		expect(button).toMatch(/\{pending && <Spinner/);
	});
});

describe("global navigation progress bar (issue #60)", () => {
	it("root layout renders NextTopLoader exactly once", () => {
		const layout = read("src/app/layout.tsx");
		expect(layout).toContain('from "nextjs-toploader"');
		expect(layout.match(/<NextTopLoader/g)?.length).toBe(1);
		// spinner nativo da lib desligado — o spinner do site é o ui/Spinner
		expect(layout).toContain("showSpinner={false}");
	});

	it("dependency is declared in package.json", () => {
		const pkg = JSON.parse(read("package.json")) as {
			dependencies: Record<string, string>;
		};
		expect(pkg.dependencies["nextjs-toploader"]).toBeTruthy();
	});
});

describe("interactions wired to visual pending feedback (issue #60)", () => {
	// Todos os call-sites de Button mapeados na issue: a flag pending/sending
	// já existia — a mudança é `pending={pending}` no lugar de só disabled.
	const BUTTON_WIRED = [
		"src/components/contact/ContactForm.tsx",
		"src/components/auth/LoginForm.tsx",
		"src/components/admin/ResolveChallengeForm.tsx",
		"src/components/admin/UploadImageForm.tsx",
		"src/components/admin/EditPlayerForm.tsx",
		"src/components/admin/SympathiserAssignForm.tsx",
		"src/components/admin/CreateChallengeForm.tsx",
		"src/components/admin/CreatePlayerForm.tsx",
		"src/components/admin/PostForm.tsx",
		"src/components/admin/AwardTriumphForm.tsx",
		"src/components/admin/GalleryAdminList.tsx",
		"src/components/admin/GalleryUploadForm.tsx",
		"src/components/player/AddFighterForm.tsx",
		"src/components/player/EquipFromStashForm.tsx",
		"src/components/player/UpdateFighterStatusForm.tsx",
		"src/components/player/FighterXpForm.tsx",
		"src/components/player/StashCreditsForm.tsx",
		"src/components/player/AddStashItemForm.tsx",
		"src/components/player/AddEquipmentForm.tsx",
	];

	for (const path of BUTTON_WIRED) {
		it(`${path.split("/").pop()} passes pending to Button`, () => {
			expect(read(path)).toContain("pending={pending}");
		});
	}

	// Interações sem Button (ou com estado próprio) usam o Spinner direto.
	const SPINNER_WIRED = [
		"src/components/gallery/GalleryRating.tsx",
		"src/components/gallery/GalleryComments.tsx",
		"src/components/search/SiteSearch.tsx",
		"src/components/assistant/RulesChat.tsx",
		"src/components/admin/GalleryUploadForm.tsx",
		"src/components/admin/GalleryCommentModeration.tsx",
	];

	for (const path of SPINNER_WIRED) {
		it(`${path.split("/").pop()} imports the shared Spinner`, () => {
			expect(read(path)).toContain('@/components/ui/spinner');
		});
	}

	it("GalleryRating announces the in-flight vote (no visible text nearby)", () => {
		const rating = read("src/components/gallery/GalleryRating.tsx");
		expect(rating).toContain("sendingVote");
		expect(rating).toMatch(/\{pending && <Spinner[^>]*label=/);
	});

	it("double-submit protection is preserved (disabled still applied)", () => {
		// O pending do Button implica disabled — nenhum form perdeu a proteção.
		const button = read("src/components/ui/button.tsx");
		expect(button).toContain("disabled={disabled || pending}");
		// GalleryComments mantém o disabled explícito no <button> cru.
		expect(read("src/components/gallery/GalleryComments.tsx")).toContain(
			"disabled={sending}",
		);
	});
});
