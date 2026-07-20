/**
 * Fail-open do rate limit (regressão de prod): quando o Upstash está
 * indisponível (DNS ENOTFOUND, banco deletado, credenciais velhas), o
 * `rateLimit()` não pode rejeitar — ele loga e cai no limitador em memória.
 * Antes deste fix, o erro subia e derrubava o upload da galeria com 500.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

// Upstash sempre indisponível neste arquivo (simula getaddrinfo ENOTFOUND).
vi.mock("@upstash/ratelimit", () => ({
	Ratelimit: class {
		static slidingWindow() {
			return null;
		}
		limit() {
			return Promise.reject(
				Object.assign(new TypeError("fetch failed"), {
					cause: { code: "ENOTFOUND", hostname: "cunning-loon-150771.upstash.io" },
				}),
			);
		}
	},
}));
vi.mock("@upstash/redis", () => ({ Redis: class {} }));

import { rateLimit } from "@/lib/ai/rate-limit";

describe("rateLimit fail-open (Upstash unavailable)", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	it("does not throw and falls back to the in-memory limiter", async () => {
		vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://nonexistent.upstash.io");
		vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "stale-token");

		// Primeira chamada dentro do limite → permitida via fallback em memória.
		await expect(rateLimit("failopen:user", 2, 60)).resolves.toBe(true);

		// O fallback continua aplicando o limite (não vira bypass total).
		await rateLimit("failopen:user", 2, 60);
		await expect(rateLimit("failopen:user", 2, 60)).resolves.toBe(false);
	});
});
