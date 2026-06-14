/**
 * Rate limiting simples em memória (janela deslizante por chave).
 * Suficiente para o baixo volume desta campanha em uma única instância.
 * Para produção multi-instância (serverless), troque por Upstash Ratelimit.
 */
const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
