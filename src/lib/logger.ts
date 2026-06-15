/**
 * Structured logger — thin wrapper around console.
 *
 * Each entry is emitted as a single JSON line with:
 *   { ts, level, msg, ...context }
 *
 * On Vercel, function logs capture stdout/stderr, so these JSON lines appear
 * directly in the dashboard and can be queried/alerted on. No external
 * package needed.
 */

type LogLevel = "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

function emit(level: LogLevel, msg: string, ctx?: LogContext): void {
  const entry: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...ctx,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  /**
   * Informational event (e.g. service started, request completed).
   */
  info(msg: string, ctx?: LogContext): void {
    emit("info", msg, ctx);
  },

  /**
   * Non-fatal issue that may require attention (e.g. rate limit hit,
   * unauthenticated request, degraded fallback).
   */
  warn(msg: string, ctx?: LogContext): void {
    emit("warn", msg, ctx);
  },

  /**
   * Unrecoverable error — always investigate (e.g. stream failure,
   * unexpected exception).
   */
  error(msg: string, ctx?: LogContext): void {
    emit("error", msg, ctx);
  },
};
