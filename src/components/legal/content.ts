// Páginas legais (issue #39 follow-up) — Privacidade e Termos.
// Conteúdo em PT-BR — fonte da verdade. content.en.ts espelha cada export;
// as chaves de lógica (ids) são idênticas entre os dois módulos.
//
// Escrito para a natureza real do projeto: fan project independente, sem
// fins comerciais, sem venda de nada, contas só criadas pelo Arbitrator,
// cookies essenciais, métricas anônimas e formulário de contato por e-mail.

export type LegalSection = {
	id: string;
	title: string;
	paragraphs: string[];
};

export type LegalDoc = {
	kicker: string;
	title: string;
	lastUpdated: string;
	intro: string;
	sections: LegalSection[];
};

export const PRIVACY: LegalDoc = {
	kicker: "// SUPORTE · PRIVACIDADE",
	title: "Política de Privacidade",
	lastUpdated: "Última atualização: 27 de julho de 2026",
	intro:
		"A NecroForja é um projeto de fã independente e sem fins comerciais. Coletamos o mínimo de dados possível — e o que coletamos existe só para o site funcionar. Esta página explica, sem juridiquês, o que é coletado, por quê e onde fica.",
	sections: [
		{
			id: "quem-opera",
			title: "Quem opera o site",
			paragraphs: [
				"A NecroForja é mantida por uma única pessoa — o criador do projeto (veja a página Creator) — como projeto de hobby e portfólio. Não é uma empresa, não vende produtos nem serviços, não exibe anúncios e não lucra com seus dados.",
			],
		},
		{
			id: "contas",
			title: "Contas e autenticação",
			paragraphs: [
				"Não existe auto-cadastro: as contas são criadas manualmente pelo Arbitrator apenas para os jogadores da campanha. Uma conta guarda nome de exibição, e-mail e senha — a senha é armazenada com hash criptográfico forte (Argon2), nunca em texto puro.",
				"Ao fazer login, um cookie de sessão essencial mantém você autenticado. Ele expira e pode ser removido saindo da conta ou limpando os cookies do navegador.",
			],
		},
		{
			id: "contato",
			title: "Formulário de contato",
			paragraphs: [
				"Ao usar a página de contato, você informa nome, e-mail, assunto e mensagem. Esses dados são usados exclusivamente para ler e responder sua mensagem: são entregues por e-mail ao mantenedor através de um provedor de envio e não alimentam listas de marketing, não são vendidos nem repassados a terceiros.",
			],
		},
		{
			id: "cookies",
			title: "Cookies",
			paragraphs: [
				"O site usa apenas cookies essenciais: um cookie de idioma (NEXT_LOCALE, que guarda sua escolha entre inglês e português), o cookie de sessão do login e, se você avaliar ou comentar uma foto da galeria, um cookie de identificação anônima (ncf_anon) que evita votos duplicados — ele contém um código aleatório, não é legível por scripts e é guardado no servidor apenas como um hash irreversível, nunca vinculado a nome, e-mail ou IP. Não há cookies de publicidade, rastreamento entre sites ou fingerprinting.",
			],
		},
		{
			id: "metricas",
			title: "Métricas de uso",
			paragraphs: [
				"Usamos o Vercel Analytics para entender o uso do site de forma agregada e anônima (páginas mais visitadas, país de origem). Ele não usa cookies e não identifica visitantes individualmente.",
			],
		},
		{
			id: "seguranca",
			title: "Segurança e rate limiting",
			paragraphs: [
				"Para prevenir abuso (spam no formulário de contato, uso excessivo do assistente de regras), o endereço IP das requisições é processado temporariamente em um serviço de rate limiting. Ele não é usado para criar perfis nem cruzado com outros dados.",
			],
		},
		{
			id: "assistente",
			title: "Assistente de regras",
			paragraphs: [
				"As perguntas feitas ao assistente de regras (disponível para usuários logados) são enviadas a provedores de IA (Anthropic e OpenAI) apenas para gerar a resposta. Há um limite diário de perguntas por usuário. Evite incluir dados pessoais nas perguntas.",
			],
		},
		{
			id: "infraestrutura",
			title: "Onde os dados ficam",
			paragraphs: [
				"O site é hospedado na Vercel. O banco de dados e o armazenamento de imagens ficam no Supabase (região São Paulo). O rate limiting usa a Upstash. As mensagens do formulário de contato passam por um provedor de envio de e-mail. Cada um desses serviços processa apenas o necessário para sua função.",
			],
		},
		{
			id: "imagens",
			title: "Imagens da galeria",
			paragraphs: [
				"A galeria e os relatórios contêm fotos de miniaturas e partidas da nossa mesa. Se você aparece em alguma imagem (ou é autor de uma) e quer que ela seja removida, peça pela página de contato — a remoção é feita sem burocracia.",
			],
		},
		{
			id: "direitos",
			title: "Seus direitos (LGPD)",
			paragraphs: [
				"Nos termos da Lei Geral de Proteção de Dados (LGPD), você pode pedir acesso, correção ou exclusão dos seus dados pessoais a qualquer momento. Basta usar a página de contato — não exigimos formulários nem prazos absurdos.",
			],
		},
		{
			id: "mudancas",
			title: "Mudanças nesta política",
			paragraphs: [
				"Esta política pode ser atualizada se o site ganhar novas funcionalidades. A data da última atualização aparece no topo da página; mudanças relevantes serão refletidas aqui.",
			],
		},
	],
};

export const TERMS: LegalDoc = {
	kicker: "// SUPORTE · TERMOS",
	title: "Termos de Uso",
	lastUpdated: "Última atualização: 27 de julho de 2026",
	intro:
		"Ao usar a NecroForja você concorda com estes termos. Eles são curtos, porque o site é simples: um projeto de fã, gratuito, que acompanha uma campanha de Necromunda.",
	sections: [
		{
			id: "natureza",
			title: "O que é o serviço",
			paragraphs: [
				"A NecroForja é um projeto de fã independente, gratuito e sem fins comerciais: um gerenciador digital de campanha para o jogo de mesa Necromunda. Não é uma loja, não vende miniaturas, kits ou impressão 3D, e não é afiliada à Games Workshop.",
				"O serviço é fornecido \"como está\", sem compromisso de disponibilidade contínua — é um hobby mantido no tempo livre de uma pessoa.",
			],
		},
		{
			id: "contas",
			title: "Contas",
			paragraphs: [
				"As contas são criadas pelo Arbitrator para os jogadores da campanha. Você é responsável por manter suas credenciais em segurança e pelo que for feito com a sua conta. Contas podem ser suspensas ou removidas em caso de abuso.",
			],
		},
		{
			id: "uso-aceitavel",
			title: "Uso aceitável",
			paragraphs: [
				"Não tente burlar a autenticação, explorar vulnerabilidades, sobrecarregar o serviço (incluindo scraping abusivo) ou usar o formulário de contato e o assistente de regras para spam, conteúdo ilegal ou ofensivo. É um site de hobby — não faça dele um alvo.",
			],
		},
		{
			id: "pi-gw",
			title: "Propriedade intelectual — Games Workshop",
			paragraphs: [
				"Necromunda, Warhammer 40,000 e todas as marcas, nomes, personagens e imagens associadas são ®, ™ e/ou © Games Workshop Limited. A NecroForja é um projeto de fã não-oficial, sem afiliação, endosso ou licenciamento da Games Workshop, e não contesta a titularidade desses direitos.",
			],
		},
		{
			id: "pi-site",
			title: "Propriedade intelectual — o site",
			paragraphs: [
				"O código-fonte da NecroForja é público no GitHub para leitura e estudo, com todos os direitos reservados (veja a LICENSE do repositório). Os textos do site e as fotos das miniaturas pertencem aos seus autores — os jogadores da mesa.",
			],
		},
		{
			id: "garantias",
			title: "Sem garantias",
			paragraphs: [
				"O site pode sair do ar, perder dados ou conter erros — inclusive nos rankings (o Arbitrator agradece o report). Na máxima extensão permitida por lei, o mantenedor não se responsabiliza por danos decorrentes do uso ou da indisponibilidade do serviço.",
			],
		},
		{
			id: "links",
			title: "Links externos",
			paragraphs: [
				"O site contém links para páginas de terceiros (por exemplo, warhammer.com, LinkedIn, GitHub). Não temos controle nem responsabilidade sobre o conteúdo delas.",
			],
		},
		{
			id: "mudancas",
			title: "Alterações destes termos",
			paragraphs: [
				"Estes termos podem ser atualizados; a data da última atualização aparece no topo. Continuar usando o site após uma mudança significa concordar com a versão vigente.",
			],
		},
		{
			id: "contato",
			title: "Dúvidas",
			paragraphs: [
				"Qualquer dúvida sobre estes termos ou sobre a política de privacidade, fale com a gente pela página de contato.",
			],
		},
	],
};
