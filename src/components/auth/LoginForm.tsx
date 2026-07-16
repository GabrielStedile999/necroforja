"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { authenticate, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm() {
  const t = useTranslations("Login");
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    authenticate,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error && (
        <p className="rounded-sm border border-blood/40 bg-blood/15 px-3 py-2 text-sm text-blood">
          {t(`errors.${state.error}`)}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? t("signingIn") : t("signIn")}
      </Button>
    </form>
  );
}
