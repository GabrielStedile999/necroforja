"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { sendContactMessage, type ContactState } from "@/app/contact/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { getContactContent } from "./content.i18n";

/**
 * Formulário de contato (issue #39 follow-up).
 *
 * - Validação nativa (required/min/max) espelhando o schema zod do servidor —
 *   feedback imediato sem JS extra, e o servidor revalida tudo;
 * - honeypot "website" invisível (posição off-screen + tabIndex -1 +
 *   aria-hidden): humanos nunca o veem, bots o preenchem;
 * - useActionState: pending desabilita o submit, erro vem como código estável
 *   traduzido aqui (mesmo padrão do LoginForm).
 */
export function ContactForm() {
	const locale = useLocale() as Locale;
	const { CONTACT_FORM, CONTACT_INTRO } = getContactContent(locale);
	const [state, formAction, pending] = useActionState<ContactState, FormData>(
		sendContactMessage,
		{},
	);

	if (state.ok) {
		return (
			<div
				role="status"
				className="clip-chamfer-sm border border-cyan/40 bg-[rgba(0,229,255,.06)] p-6"
			>
				<div className="mb-2 font-mono text-[13px] tracking-[3px] text-cyan">
					{CONTACT_FORM.success.title}
				</div>
				<p className="m-0 mb-4 text-[15px] leading-[1.7] text-[rgba(245,245,250,.75)]">
					{CONTACT_FORM.success.body}
				</p>
				<Button type="button" variant="cyan" onClick={() => window.location.reload()}>
					{CONTACT_FORM.success.again}
				</Button>
			</div>
		);
	}

	return (
		<form action={formAction} className="flex flex-col gap-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="contact-name">{CONTACT_FORM.name}</Label>
					<Input
						id="contact-name"
						name="name"
						type="text"
						autoComplete="name"
						required
						minLength={2}
						maxLength={80}
					/>
				</div>
				<div>
					<Label htmlFor="contact-email">{CONTACT_FORM.email}</Label>
					<Input
						id="contact-email"
						name="email"
						type="email"
						autoComplete="email"
						required
						maxLength={200}
					/>
				</div>
			</div>

			<div>
				<Label htmlFor="contact-subject">{CONTACT_FORM.subject}</Label>
				<Input
					id="contact-subject"
					name="subject"
					type="text"
					required
					minLength={3}
					maxLength={120}
				/>
			</div>

			<div>
				<Label htmlFor="contact-message">{CONTACT_FORM.message}</Label>
				<Textarea
					id="contact-message"
					name="message"
					required
					minLength={10}
					maxLength={4000}
				/>
			</div>

			{/* Honeypot — invisível para humanos, irresistível para bots (que
			    preenchem qualquer input). O name é deliberadamente não-padrão:
			    com name="website" o autofill do Chrome preenchia o campo junto
			    com nome/email e o envio era descartado como bot (visto no
			    teste local da issue #39). */}
			<div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
				<label htmlFor="contact-ncf-extra">Leave this field empty</label>
				<input
					id="contact-ncf-extra"
					name="ncf_extra"
					type="text"
					tabIndex={-1}
					autoComplete="off"
				/>
			</div>

			{state.error && (
				<p
					role="alert"
					className="clip-chamfer-sm m-0 border border-blood/40 bg-blood/15 px-3 py-2 text-sm text-blood"
				>
					{CONTACT_FORM.errors[state.error]}
				</p>
			)}

			<div className="flex flex-wrap items-center gap-4">
				<Button type="submit" disabled={pending} className="px-8">
					{pending ? CONTACT_FORM.submitting : CONTACT_FORM.submit}
				</Button>
				<p className="m-0 max-w-[420px] text-[12px] leading-[1.6] text-[rgba(245,245,250,.45)]">
					{CONTACT_INTRO.privacyNote}{" "}
					<Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
						{CONTACT_INTRO.privacyLink}
					</Link>
				</p>
			</div>
		</form>
	);
}
