// Página de contato (issue #39 follow-up).
// Conteúdo em PT-BR — fonte da verdade. content.en.ts espelha cada export;
// os códigos de erro (chaves) são idênticos entre os dois módulos.

export const CONTACT_INTRO = {
	kicker: "// SUPORTE · CONTATO",
	title: "Fale com a forja",
	body:
		"Dúvida sobre o site, a campanha ou o hobby? Achou um bug, quer sugerir uma funcionalidade ou pedir a remoção de uma imagem? Manda a mensagem — ela cai direto com o criador do projeto.",
	privacyNote:
		"Os dados enviados aqui são usados apenas para responder sua mensagem — nada de listas, spam ou repasse a terceiros.",
	privacyLink: "Política de Privacidade →",
};

export const CONTACT_FORM = {
	name: "Seu nome",
	email: "Seu e-mail",
	subject: "Assunto",
	message: "Mensagem",
	submit: "Enviar mensagem",
	submitting: "Enviando...",
	success: {
		title: "MENSAGEM ENVIADA",
		body: "Recebido no cogitador da forja. Se precisar de resposta, ela chega no e-mail que você informou.",
		again: "Enviar outra mensagem",
	},
	errors: {
		invalid_input:
			"Confira os campos: nome (mín. 2 letras), e-mail válido, assunto (mín. 3) e mensagem (mín. 10).",
		rate_limited: "Muitas mensagens em pouco tempo. Espere um pouco e tente de novo.",
		send_failed: "Não foi possível enviar agora. Tente de novo em alguns minutos.",
		not_configured:
			"O formulário está temporariamente indisponível. Tente novamente mais tarde.",
	},
};
