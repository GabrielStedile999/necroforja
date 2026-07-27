// Contact page (issue #39 follow-up) — English mirror of ./content.ts.
// Error codes (keys) are identical between the two modules.

export const CONTACT_INTRO = {
	kicker: "// SUPPORT · CONTACT",
	title: "Talk to the forge",
	body:
		"Questions about the site, the campaign or the hobby? Found a bug, want to suggest a feature or request an image takedown? Send a message — it goes straight to the project's creator.",
	privacyNote:
		"The data you submit here is used only to answer your message — no mailing lists, spam or sharing with third parties.",
	privacyLink: "Privacy Policy →",
};

export const CONTACT_FORM = {
	name: "Your name",
	email: "Your e-mail",
	subject: "Subject",
	message: "Message",
	submit: "Send message",
	submitting: "Sending...",
	success: {
		title: "MESSAGE SENT",
		body: "Received by the forge's cogitator. If a reply is needed, it will arrive at the e-mail you provided.",
		again: "Send another message",
	},
	errors: {
		invalid_input:
			"Check the fields: name (min. 2 letters), a valid e-mail, subject (min. 3) and message (min. 10).",
		rate_limited: "Too many messages in a short time. Wait a bit and try again.",
		send_failed: "The message could not be sent right now. Try again in a few minutes.",
		not_configured: "The form is temporarily unavailable. Please try again later.",
	},
};
