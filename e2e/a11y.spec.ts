import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Checagem automática de acessibilidade com axe-core (issue #42).
 *
 * Primeira versão, calibrada pra não travar o CI antes de existir um
 * baseline real (mesma filosofia dos thresholds "warn" do Lighthouse CI):
 *
 * - Violações de impacto **critical** FALHAM o teste — são os casos graves
 *   (ex. conteúdo interativo sem nome acessível) que não queremos regredir.
 * - Violações **serious/moderate/minor** são só logadas no output do CI,
 *   formando o baseline. Quando as rotas estiverem limpas, promover
 *   `serious` para bloqueante também (trocar o filtro abaixo).
 *
 * Rotas: home + 3 rotas públicas principais (critério de aceite da issue).
 * Nenhuma depende de seed além do que o CI já roda (db:seed).
 */
const ROUTES = ["/", "/gallery", "/reports", "/skirmish"];

for (const path of ROUTES) {
	test(`${path} has no critical accessibility violations (axe)`, async ({
		page,
	}) => {
		await page.goto(path);

		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa"])
			.analyze();

		const critical = results.violations.filter(
			(v) => v.impact === "critical",
		);
		const nonBlocking = results.violations.filter(
			(v) => v.impact !== "critical",
		);

		// Baseline visível no log do CI, sem falhar o job (por enquanto).
		for (const v of nonBlocking) {
			console.warn(
				`[axe:${path}] (${v.impact}) ${v.id}: ${v.help} — ${v.nodes.length} node(s)`,
			);
		}

		expect(
			critical.map((v) => ({
				id: v.id,
				help: v.help,
				nodes: v.nodes.map((n) => n.target),
			})),
		).toEqual([]);
	});
}
