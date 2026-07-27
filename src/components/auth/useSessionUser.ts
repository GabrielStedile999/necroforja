"use client";

import { useEffect, useState } from "react";

export type SessionUser = {
  name?: string | null;
  email?: string | null;
  role?: "admin" | "player";
};

/**
 * Sessão opcional para páginas ESTÁTICAS (issue #40).
 *
 * O SiteNav roda nas páginas públicas de marketing, que são estáticas — um
 * `auth()` server-side ali forçaria render dinâmico de todas elas, e um
 * `SessionProvider` global colocaria o next-auth/react no bundle inicial.
 * Em vez disso, o próprio client busca `/api/auth/session`, num idle
 * callback (mesmo padrão do SiteSearch, issue #42), pra não competir com o
 * first paint. Visitante deslogado (a maioria) vê o botão SIGN IN
 * imediatamente; usuário logado vê o UserMenu assim que a resposta chega.
 *
 * Estratégia stale-while-revalidate: o snapshot fica em cache de módulo
 * (render instantâneo em navegações client-side e no menu mobile), mas
 * TODO mount revalida em idle — o App Router navega sem recarregar a
 * página, então login/logout no meio da sessão SPA invalidam o snapshot
 * (bug pego pelo Gabriel: logar e voltar pra landing pela logo mostrava
 * deslogado, porque o cache guardava o "null" de antes do login).
 * `inflight` deduplica fetches concorrentes (nav desktop + menu mobile).
 */

let cached: SessionUser | null | undefined;
let inflight: Promise<SessionUser | null> | null = null;

function revalidateSessionUser(): Promise<SessionUser | null> {
  inflight ??= fetch("/api/auth/session", {
    headers: { accept: "application/json" },
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { user?: SessionUser } | null) => {
      cached = data?.user ?? null;
      return cached;
    })
    .catch(() => {
      // Falha de rede ⇒ mantém o último snapshot (o header nunca pode
      // quebrar a página); sem snapshot, trata como deslogado.
      return cached ?? null;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** `undefined` = ainda carregando; `null` = deslogado. */
export function useSessionUser(): SessionUser | null | undefined {
  // Snapshot instantâneo pra quem monta depois do primeiro fetch (menu
  // mobile, navegações client-side) — a revalidação abaixo corrige se o
  // estado mudou desde então.
  const [user, setUser] = useState<SessionUser | null | undefined>(() => cached);

  useEffect(() => {
    let alive = true;
    const load = () => {
      void revalidateSessionUser().then((u) => {
        if (alive) setUser(u);
      });
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load);
      return () => {
        alive = false;
        window.cancelIdleCallback(id);
      };
    }
    const id = window.setTimeout(load, 1);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, []);

  return user;
}
