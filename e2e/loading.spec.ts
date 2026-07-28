import { test, expect } from "@playwright/test";

/**
 * Issue #60 — feedback visual de loading.
 *
 * Dois cenários de ponta a ponta:
 * - form: o submit do formulário de contato mostra o spinner (aria-busy no
 *   botão) enquanto a Server Action está em trânsito, e o feedback some
 *   quando ela resolve;
 * - navegação: a barra de progresso global (#nprogress) aparece durante a
 *   troca de rota client-side.
 *
 * Nos dois casos a resposta é atrasada artificialmente via page.route —
 * sem isso a ação resolve mais rápido que o delay anti-flicker de ~180ms
 * (comportamento desejado em produção, mas impossível de assertar).
 */

const HOLD_MS = 800;

test("contact form shows the spinner while the action is pending", async ({
	page,
}) => {
	await page.goto("/contact");

	// Segura o POST da Server Action para abrir a janela de asserção.
	await page.route("**/contact", async (route) => {
		if (route.request().method() === "POST") {
			await new Promise((r) => setTimeout(r, HOLD_MS));
		}
		await route.fallback();
	});

	await page.getByLabel(/name|nome/i).first().fill("Playwright Bot");
	await page.getByLabel(/e-?mail/i).first().fill("e2e@necroforja.test");
	await page.getByLabel(/subject|assunto/i).first().fill("issue #60 e2e");
	await page
		.getByLabel(/message|mensagem/i)
		.first()
		.fill("Loading feedback end-to-end check — long enough body.");

	const submit = page.locator('button[type="submit"]');
	await submit.click();

	// Enquanto pende: aria-busy + spinner visível dentro do botão.
	const busy = page.locator('button[aria-busy="true"]');
	await expect(busy).toBeVisible();
	await expect(busy.locator("svg")).toBeVisible();

	// Ao resolver, o estado ocupado desaparece (sucesso ou erro — o que
	// importa aqui é o ciclo do feedback, não o resultado do envio).
	await expect(page.locator('button[aria-busy="true"]')).toHaveCount(0, {
		timeout: 15_000,
	});
});

test("route navigation shows the global progress bar", async ({ page }) => {
	await page.goto("/");

	// Atrasa o fetch RSC da navegação client-side para a barra ficar visível
	// por tempo suficiente (navegações rápidas escondem a barra de propósito).
	await page.route("**/*_rsc*", async (route) => {
		await new Promise((r) => setTimeout(r, HOLD_MS));
		await route.fallback();
	});

	await page.getByRole("link", { name: /lore/i }).first().click();

	await expect(page.locator("#nprogress")).toBeVisible();

	// A navegação conclui e a barra é removida do DOM.
	await expect(page.locator("#nprogress")).toHaveCount(0, { timeout: 15_000 });
});
