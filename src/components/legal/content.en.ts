// Legal pages (issue #39 follow-up) — English mirror of ./content.ts.
// Logic keys (ids) are identical between the two modules; only the
// human-readable text differs.

import type { LegalDoc, LegalSection } from "./content";

export type { LegalDoc, LegalSection };

export const PRIVACY: LegalDoc = {
	kicker: "// SUPPORT · PRIVACY",
	title: "Privacy Policy",
	lastUpdated: "Last updated: July 27, 2026",
	intro:
		"NecroForja is an independent, non-commercial fan project. We collect as little data as possible — and what we do collect exists only to make the site work. This page explains, without legalese, what is collected, why, and where it lives.",
	sections: [
		{
			id: "quem-opera",
			title: "Who runs the site",
			paragraphs: [
				"NecroForja is maintained by a single person — the project's creator (see the Creator page) — as a hobby and portfolio project. It is not a company, sells no products or services, shows no ads and does not profit from your data.",
			],
		},
		{
			id: "contas",
			title: "Accounts and authentication",
			paragraphs: [
				"There is no self-signup: accounts are created manually by the Arbitrator, only for the campaign's players. An account stores a display name, an e-mail and a password — the password is stored with a strong cryptographic hash (Argon2), never in plain text.",
				"When you sign in, an essential session cookie keeps you authenticated. It expires and can be removed by signing out or clearing your browser cookies.",
			],
		},
		{
			id: "contato",
			title: "Contact form",
			paragraphs: [
				"When you use the contact page you provide a name, an e-mail, a subject and a message. That data is used exclusively to read and answer your message: it is delivered by e-mail to the maintainer through a sending provider, and never feeds marketing lists, is never sold and never shared with third parties.",
			],
		},
		{
			id: "cookies",
			title: "Cookies",
			paragraphs: [
				"The site uses essential cookies only: a language cookie (NEXT_LOCALE, storing your choice between English and Portuguese) and the sign-in session cookie. There are no advertising cookies, cross-site tracking or fingerprinting.",
			],
		},
		{
			id: "metricas",
			title: "Usage metrics",
			paragraphs: [
				"We use Vercel Analytics to understand site usage in an aggregated, anonymous way (most visited pages, country of origin). It uses no cookies and does not identify individual visitors.",
			],
		},
		{
			id: "seguranca",
			title: "Security and rate limiting",
			paragraphs: [
				"To prevent abuse (contact-form spam, excessive use of the rules assistant), the IP address of requests is processed temporarily by a rate-limiting service. It is not used to build profiles and is not cross-referenced with other data.",
			],
		},
		{
			id: "assistente",
			title: "Rules assistant",
			paragraphs: [
				"Questions asked to the rules assistant (available to signed-in users) are sent to AI providers (Anthropic and OpenAI) solely to generate the answer. There is a daily question limit per user. Avoid including personal data in your questions.",
			],
		},
		{
			id: "infraestrutura",
			title: "Where the data lives",
			paragraphs: [
				"The site is hosted on Vercel. The database and image storage live on Supabase (São Paulo region). Rate limiting uses Upstash. Contact-form messages go through an e-mail sending provider. Each of these services processes only what its function requires.",
			],
		},
		{
			id: "imagens",
			title: "Gallery images",
			paragraphs: [
				"The gallery and the reports contain photos of miniatures and games from our table. If you appear in an image (or are the author of one) and want it removed, ask through the contact page — removal is handled with no bureaucracy.",
			],
		},
		{
			id: "direitos",
			title: "Your rights (LGPD)",
			paragraphs: [
				"Under the Brazilian General Data Protection Law (LGPD), you can request access to, correction of or deletion of your personal data at any time. Just use the contact page — no forms, no absurd deadlines.",
			],
		},
		{
			id: "mudancas",
			title: "Changes to this policy",
			paragraphs: [
				"This policy may be updated as the site gains new features. The date of the last update appears at the top of the page; relevant changes will be reflected here.",
			],
		},
	],
};

export const TERMS: LegalDoc = {
	kicker: "// SUPPORT · TERMS",
	title: "Terms of Use",
	lastUpdated: "Last updated: July 27, 2026",
	intro:
		"By using NecroForja you agree to these terms. They are short, because the site is simple: a free fan project that tracks a Necromunda campaign.",
	sections: [
		{
			id: "natureza",
			title: "What the service is",
			paragraphs: [
				"NecroForja is an independent, free, non-commercial fan project: a digital campaign manager for the Necromunda tabletop game. It is not a store, sells no miniatures, kits or 3D prints, and is not affiliated with Games Workshop.",
				"The service is provided \"as is\", with no promise of continuous availability — it is a hobby maintained in one person's spare time.",
			],
		},
		{
			id: "contas",
			title: "Accounts",
			paragraphs: [
				"Accounts are created by the Arbitrator for the campaign's players. You are responsible for keeping your credentials safe and for what is done with your account. Accounts may be suspended or removed in case of abuse.",
			],
		},
		{
			id: "uso-aceitavel",
			title: "Acceptable use",
			paragraphs: [
				"Do not try to bypass authentication, exploit vulnerabilities, overload the service (including abusive scraping) or use the contact form and the rules assistant for spam, illegal or offensive content. It is a hobby site — don't make it a target.",
			],
		},
		{
			id: "pi-gw",
			title: "Intellectual property — Games Workshop",
			paragraphs: [
				"Necromunda, Warhammer 40,000 and all associated marks, names, characters and imagery are ®, ™ and/or © Games Workshop Limited. NecroForja is an unofficial fan project with no affiliation, endorsement or license from Games Workshop, and does not challenge the ownership of those rights.",
			],
		},
		{
			id: "pi-site",
			title: "Intellectual property — the site",
			paragraphs: [
				"NecroForja's source code is public on GitHub for reading and study, with all rights reserved (see the repository LICENSE). The site's texts and the miniature photos belong to their authors — the players at the table.",
			],
		},
		{
			id: "garantias",
			title: "No warranties",
			paragraphs: [
				"The site may go down, lose data or contain errors — including in the rankings (the Arbitrator appreciates the report). To the maximum extent permitted by law, the maintainer is not liable for damages arising from the use or unavailability of the service.",
			],
		},
		{
			id: "links",
			title: "External links",
			paragraphs: [
				"The site contains links to third-party pages (for example warhammer.com, LinkedIn, GitHub). We have no control over — and no responsibility for — their content.",
			],
		},
		{
			id: "mudancas",
			title: "Changes to these terms",
			paragraphs: [
				"These terms may be updated; the date of the last update appears at the top. Continuing to use the site after a change means agreeing to the current version.",
			],
		},
		{
			id: "contato",
			title: "Questions",
			paragraphs: [
				"Any questions about these terms or the privacy policy, talk to us through the contact page.",
			],
		},
	],
};
