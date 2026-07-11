// Auto-structured from the campaign lore document (lore.docx).
// Content in PT-BR — matches the campaign group language.

export type LoreBlock =
	| { type: "p"; text: string }
	| { type: "quote"; text: string }
	| { type: "img"; src: string; alt: string };

export type LoreSection = {
	id: string;
	title: string;
	/** Bold aside boxes in the source document */
	kind?: "callout";
	/** Accent color override (used by the clan house sections) */
	color?: string;
	blocks: LoreBlock[];
};

export type LoreChapter = {
	id: string;
	num: string;
	title: string;
	accent: "hazard" | "cyan" | "violet" | "rust" | "toxic";
	sections: LoreSection[];
};

/** Opening flavor text — rendered in the page hero. */
export const LORE_INTRO = {
	image: "intro",
	lead: "Que pesadelo são estes mundos colmeia?",
	body: "Nestes lugares onde o homem foi permitido crescer desenfreadamente, bilhões fervilham infestando as vastas cidades colmeia. Mesmo aqui, a pressão da humanidade não é forte o suficiente para reverter a loucura ou desviar as forças malignas do caos, heresia e morte. A vida é barata. A bala e a granada são reis. Nem o dia nem a noite tocam os bilhões de almas presas neste mundo de pesadelo. Para eles, existe apenas a penumbra séptica e incessante da fluorescência antiga. A atmosfera pútrida da sub-colmeia é manchada pela pátina escura da idade. Uma névoa marrom preenche o ar que foi reciclado um milhão de milhões de vezes e oferece aos habitantes apenas a mais ínfima medida de vida possível sem sufocá-los.",
	close: "Cuidado com as sombras da colmeia, onde apenas os mais fortes sobrevivem…",
};

export const LORE_CHAPTERS: LoreChapter[] = [
	{
		id: "imperio",
		num: "01",
		title: "Império nas Estrelas",
		accent: "hazard",
		sections: [
			{
				id: "imperio-nas-estrelas",
				title: "Império nas Estrelas",
				blocks: [
					{ type: "img", src: "imperium", alt: "O Império da Humanidade — um milhão de mundos sob o Deus-Imperador" },
					{ type: "p", text: "O Império da Humanidade estende-se por toda a galáxia, abrangendo mais de um milhão de mundos habitáveis e incontáveis bilhões de súditos do Imperador. É o império mais extenso e populoso da história da humanidade, e é governado, como tem sido pelos últimos dez mil anos, pelo Divino Campeão e Protetor da raça humana, o Deus-Imperador da Humanidade." },
					{ type: "p", text: "O Imperador é o maior de todos os psykers humanos, suas energias mentais são ilimitadas e seus poderes incompreensíveis para humanos comuns. É somente sua mente que projeta o Astronomican por toda a galáxia, o feixe psíquico de localização que permite que as naves espaciais naveguem através do tecido do espaço warp. Sem o Imperador, o Império entraria em colapso e a unidade humana se desintegraria, deixando os bolsões restantes de civilização isolados e vulneráveis aos infinitos inimigos da Humanidade; criaturas que buscam destruir ou escravizar a raça humana." },
					{ type: "p", text: "O Imperador há muito deixou de viver em qualquer sentido normal. Dez mil anos atrás, após sua titânica batalha contra o Mestre da Guerra rebelde Horus, Primarca e Arqui-campeão do Caos, seu corpo mutilado e quase morto foi instalado dentro de uma sofisticada máquina de suporte de vida conhecida como o Trono Dourado. O Imperador não pode mais falar e é duvidoso que ele compreenda os eventos que ocorrem no universo material, enquanto sua poderosa mente se mantém vigia através daquela região nefasta de energia pura conhecida como o Reino do Caos, afastando os inimigos da Humanidade. A administração real do Império é, portanto, realizada por uma vasta burocracia conhecida como Adeptus Terra — ou Sacerdócio da Terra." },
					{ type: "img", src: "emperor", alt: "O Deus-Imperador da Humanidade, guardião no Trono Dourado" },
				],
			},
			{
				id: "os-milhoes-de-mundos-da-humanidade",
				title: "Os Milhões de Mundos da Humanidade",
				blocks: [
					{ type: "p", text: "Mesmo o Adeptus Administration, o ramo administrativo do Adeptus Terra, não sabe ao certo o número exato de mundos dentro do Império. Há aproximadamente um milhão, mas devido a traiçoeiros fenômenos vinculados às viagens espaciais, como o processo de distorção temporal e os efeitos das tempestades de warp, que podem isolar mundos por séculos, tornam uma contagem precisa impossível. Além disso, a galáxia é um lugar perigoso e belicoso, onde os mundos estão constantemente sob ameaça de invasores xenos, rebeliões internas e traição por parte de seus governantes. Também, novos mundos são constantemente adicionados ao Império: mundos virgens prontos para colonização ou antigos mundos humanos que foram re-descobertos após longos períodos de isolamento." },
					{ type: "p", text: "Os mundos do Império assumem muitas formas diferentes. Alguns são mundos agrícolas esparsamente povoados, cujo único propósito é fornecer alimento para planetas menos produtivos e mais populosos. Outros mundos são dedicados a funções específicas, como planetas de mineração ricos em minerais, estações de pesquisa áridas, planetas de observação militar e assim por diante. A maioria dos mundos do Império tem uma economia razoavelmente mista e são, em muitos aspectos, autossuficientes e autônomos. O Adeptus Terra tem muito pouco a ver com tais mundos, desde que seus governantes continuem a pagar seus dízimos e impor as leis imperiais que controlam e contêm o surgimento de psykers mutantes." },
				],
			},
			{
				id: "mundos-colmeia",
				title: "Mundos Colmeia",
				blocks: [
					{ type: "img", src: "hive-worlds", alt: "Um mundo colmeia — indústria incessante e bilhões de trabalhadores" },
					{ type: "p", text: "Mundos colmeia são planetas cuja produção industrial, embora tecnologicamente muito mais rudimentar do que a de um Mundo Forja do Adeptus Mechanicus, alimenta a fome insaciável do Império por bens manufaturados básicos. Eles utilizam vastas e imponentes cidades de metal destinadas a maximizar a exploração de recursos naturais e mão de obra; invariavelmente, as superfícies desses mundos são terrenos baldios poluídos, planícies cinzentas tornadas estéreis por gerações de mineração e usadas como depósitos para os subprodutos tóxicos da indústria. Suas populações são densamente concentradas, a vida das pessoas é um trabalho curto e miserável, a menos que a rejeitem totalmente e se unam às numerosas gangues e outros párias que existem nas rachaduras da cidade e sociedade." },
					{ type: "p", text: "Um mundo colmeia tem uma população muito superior à sua capacidade de se alimentar ou se sustentar, muitas vezes excedendo a centenas de bilhões de pessoas em um planeta do tamanho da Terra. Esse vasto número de pessoas exerce tanta pressão sobre o meio ambiente que poucos mundos colmeia podem sustentar a vida naturalmente. Cada um, portanto, está no ápice de uma teia de suprimentos, dependendo de bilhões de toneladas de alimentos a granel importados para alimentar sua vasta população. Tão dependente dessas importações é um mundo colmeia médio que, caso o fornecimento seja interrompido, bilhões de súditos famintos provavelmente se levantarão contra seus mestres e cairão uns sobre os outros em um frenesi de insanidade canibalística." },
					{ type: "p", text: "Existem milhares de planetas classificados pelo Administratum como mundos colmeia, com os nomes de Necromunda, Armageddon e Gehenna Prime conhecidos em todos os segmentos. Outros se tornam famosos por um breve período enquanto guerras ou destinos sombrios os lançam nos livros de história - Ichar IV, Paramar e Mordian sendo os principais exemplos. Outros permanecem desconhecidos pelo Império em geral por séculos a fio, apesar dos bilhões que nascem, labutam e morrem pelo Imperador dentro de suas cidades: Tellus 15/01, Arcadia, Lavantia e Avellorn." },
				],
			},
			{
				id: "lorde-helmawr",
				title: "Lorde Helmawr",
				blocks: [
					{ type: "img", src: "helmawr", alt: "Lorde Gerontius Helmawr, governante planetário de Necromunda" },
					{ type: "p", text: "O governador e soberano de toda Necromunda é o Comandante Imperial Lorde Gerontius Helmawr. Seus ancestrais são conhecidos por terem reinado sobre o mundo pelos últimos sete mil anos de acordo com os registros de governo anteriores a esse período. No entanto, é fato que muitos outros registros já desapareceram há muito tempo, tornando o passado no mínimo incerto. Mesmo os arquivos do Administratum, a burocracia do império da Humanidade que abrange a galáxia, são notavelmente silenciosos sobre a história de Necromunda durante os primeiros dias do Império." },
					{ type: "p", text: "Lorde Helmawr ocupa o topo da hierarquia feudal de Necromunda. A sociedade que ele governa é dividida em muitas facções que competem e cooperam continuamente umas com as outras, dando origem a mudanças infinitas na hierarquia feudal. Lorde Helmawr não se preocupa com as atividades de intermediários de menor poder. Ele lida diretamente com as facções mais poderosas, oferecendo-lhes apoio em troca de sua lealdade. Se um jogador importante no jogo de poder se mostra fraco ou traiçoeiro, é simples para Helmawr retirar seu apoio. O próprio boato de que ele pode estar prestes a fazê-lo costuma ser suficiente para encorajar os inimigos de uma hierarquia inferior a se voltarem contra ele e destruí-lo. O Adeptus Terra deixa Lorde Helmawr governar seu domínio como bem entender, assim como deixa todos os Comandantes Imperiais livres para administrar seus mundos. O Comandante Imperial forma um elo na cadeia feudal que se estende por toda a galáxia até o coração do Império em Terra. Enquanto Helmawr cumprir suas obrigações feudais para com o Imperador, sua posição permanece segura." },
					{ type: "p", text: "A principal obrigação de Helmawr para com o Império é fornecer um dízimo que assume a forma de uma porcentagem de todos os bens que Necromunda produz. Como toda a capacidade de produção do mundo é dedicada a fornecer bens manufaturados para as demandas infinitas da Humanidade, o dízimo é tomado como um desconto direto na receita obtida. Enquanto Necromunda continuar a cumprir essas responsabilidades, e enquanto sua capacidade de produção for suficientemente alta, o Império permanece bastante satisfeito. Claro, se a economia do mundo colmeia começar a mostrar sinais de enfraquecimento, a posição de Lorde Helmawr seria muito diferente." },
					{ type: "p", text: "Mundos colmeia como Necromunda também fornecem ao Império outro recurso útil - seu povo. Necromunda produziu gerações de jovens resistentes com um forte senso de autossuficiência. Eles são altamente valorizados como recrutas para o Astra Militarum e até mesmo para alguns dos Capítulos dos Space Marines. Fornecer recrutas em grande número é outra das obrigações feudais de Lorde Helmawr. O recrutamento traz oficiais do Império para Necromunda para inspecionar e, em alguns casos, conduzir campanhas de recrutamento entre as gangues que lutam. O próprio Helmawr é obrigado a fornecer tropas de sua guarda pessoal, geralmente um regimento inteiro de cada vez. Como o planeta fornece tantas tropas para o Astra Militarum, o nome de Necromunda é conhecido em toda a galáxia, mesmo por pessoas que não sabem nada sobre o próprio planeta. Ao longo dos séculos, os regimentos de Necromunda lutaram com distinção em muitas zonas de guerra e ganharam uma reputação temível em inúmeras frentes de batalha." },
					{ type: "p", text: "Outra obrigação importante é que Lorde Helmawr controle com sucesso o número de mutantes psíquicos perigosos. Esses psykers, ou bruxos, carregam uma mutação que está se tornando cada vez mais comum em todo o Império. Na maioria dos mundos, eles podem ser tratados com bastante facilidade, mas em um mundo colmeia como Necromunda, com sua vasta população, o assunto é muito mais difícil. Psykers são muito perigosos - provavelmente mais do que eles próprios percebem. Embora alguns sejam capazes de controlar seus poderes e usá-los para o benefício da sociedade, a maioria é incapaz de se controlar, com resultados desastrosos. Alguns se tornam hospedeiros de poderes demoníacos nascidos da Warp, enquanto outros atraem xenos psiquicamente sintonizados, como Enslavers, ou doenças psíquicas que podem infectar as mentes de pessoas comuns. Se os psykers não fossem controlados em todo o Império, a sociedade humana entraria em colapso rapidamente." },
					{ type: "img", src: "psyker", alt: "Um psyker — a mutação psíquica que traz igualmente poder e loucura" },
				],
			},
			{
				id: "necromunda",
				title: "Necromunda",
				blocks: [
					{ type: "p", text: "Fundada há muito tempo nas profundezas da Era das Trevas da Tecnologia, Necromunda foi trazida à Luz do Imperador pelos Space Marines da Legião dos Punhos Imperiais durante a Grande Cruzada. Diz-se que os resíduos de cinzas dos quais as grandes colmeias se erguem são um subproduto da devastação causada ao mundo durante sua breve resistência à chegada do Império, mas a verdade se perde sob as planícies tóxicas." },
					{ type: "img", src: "necromunda-planet", alt: "Necromunda e sua galerias" },
					{ type: "p", text: "Necromunda é um mundo de minas, fábricas, refinarias e usinas de processamento. O planeta é uma vasta usina de energia da indústria, fabricando milhares e milhares de itens diferentes para uso em sistemas planetários próximos, e nada que possa contribuir para a produção do planeta foi deixado intocado. Do topo das montanhas mais altas às profundezas dos oceanos, a riqueza de Necromunda foi extraída. Montanhas foram reduzidas a escombros pelo minério que contém; oceanos foram transformados em pouco mais do que lodo químico. A atividade humana é, por projeto, concentrada na menor área viável, com o duplo objetivo de expor o máximo possível da superfície do planeta à mineração a céu aberto e garantir que os bilhões de trabalhadores necessários para atender as indústrias nasçam, sejam criados, trabalhem, durmam e até morram dentro dos confins apertados da fábrica que passam a vida servindo. Esses enormes complexos imponentes são conhecidos como cidades colmeia, ou simplesmente como colmeias, e seus picos ou torres individuais são chamados de torres da cidade ou torres. Um grupo próximo de colmeias é conhecido como um aglomerado de colmeias." },
					{ type: "p", text: "Entre as colmeias, desertos de cinzas industriais cobrem a superfície do planeta com uma pele instável e corrosiva. Sobre este deserto encontra-se uma camada de nuvem de poluição atmosférica, de modo que as grandes torres das colmeias da cidade se erguem de uma névoa à deriva de vapor contaminado como se fossem ilhas do mar. Apesar de ter sido reduzido a um estado tão infernal, Necromunda é um mundo extremamente valioso para o Império. Embora restem poucos recursos originais de Necromunda, os montes de resíduos das gerações anteriores se tornaram uma nova fonte de riquezas. Necromunda vive do lixo acumulado de seu passado: seu povo aprendeu a catar, recuperar e reciclar tudo para extrair uma vida de seu mundo exaurido. Ao longo dos milênios, a população de Necromunda aumentou muito além da capacidade do próprio planeta de sustentá-la. Como consequência, é totalmente dependente de alimentos reconstituídos, sintéticos e importados." },
					{ type: "p", text: "Cada colmeia tem suas usinas de reciclagem que convertem matéria orgânica usada em nutrientes catalogados em manifestos oficiais como 'amido de cadáver'. Alimentos de verdade são importados de outros mundos, mas são um luxo caro que apenas os mais ricos podem pagar. À medida que cada geração contribui para a construção e reconstrução das colmeias, novas camadas de habitação são criadas, forçando suas torres cada vez mais para cima. Essas colmeias imponentes dominam o deserto ao redor como aglomerados de cupinzeiros gigantescamente impossíveis. Abaixo das colmeias e estendendo-se ao redor delas sob o próprio deserto, encontra-se uma colmeia de antigas fábricas desativadas e um labirinto formado pelos esgotos e túneis de uma era anterior. A população de Necromunda nunca foi contada e é provável que nunca seja, seus números são simplesmente muito grandes. Uma tentativa de censo da Colmeia Trazior há quatro mil anos revelou uma população de um bilhão apenas nos níveis superiores de habitação - nenhuma outra tentativa foi feita para contar a população de Necromunda em Trazior ou em qualquer outra das várias milhares de colmeias do planeta desde então." },
					{ type: "p", text: "A sociedade de Necromunda é razoavelmente típica de mundos colmeia maiores. Nenhuma tentativa é feita para impor uma administração central a toda a população, na verdade tal coisa seria impossível em um mundo onde a maioria das pessoas permanece sem registro por qualquer autoridade. Em vez disso, um tipo de sistema feudal evoluiu pelo qual os indivíduos devem lealdade a outros, que por sua vez devem sua lealdade a outros membros cada vez mais poderosos da hierarquia. Entre os elementos mais estáveis da população, essas lealdades são devidas em bases familiares, e famílias intimamente relacionadas se apoiam sob a hegemonia do membro mais poderoso de seu grupo familiar. Essa forma de feudalismo urbano tende a ser autorreguladora. Clãs mais fracos naturalmente buscam a proteção de vizinhos mais poderosos, cuja base de poder então se expande até atingir o limite em que seus números e recursos são simplesmente poucos para permitir que se expandam ainda mais." },
					{ type: "p", text: "Onde clãs rivais se encontram, é inevitável que seu poder seja testado em combate; a capacidade de um clã de exercer seu poder sendo a única medida verdadeira de sua influência. Em vez de uma guerra totalmente perdulária, esses conflitos são resolvidos por procuração. Cada clã pode recorrer aos serviços das numerosas gangues às quais quase todo o seu povo serve por um breve período, garantindo que as rodas da indústria continuem girando mesmo com sangue derramado nas ruas muito abaixo das fábricas rugindo." },
					{ type: "img", src: "necromunda-hive", alt: "O eterno conflito entre gangues tinge os frios chãos de metal com sangue e pólvora" },
					{ type: "img", src: "necromunda-city", alt: "Corte de uma cidade colmeia — da Agulha ao fundo" },
				],
			},
		],
	},
	{
		id: "anatomia",
		num: "02",
		title: "Anatomia de uma Cidade Colmeia",
		accent: "cyan",
		sections: [
			{
				id: "as-torres",
				title: "As Torres",
				blocks: [
					{ type: "p", text: "De longe, quando as nuvens se dissipam ao redor de uma colmeia, suas torres parecem um aglomerado de montes de cupins altos e afilados, muitas vezes ramificando-se de um núcleo central alto. Elas se elevam de uma ampla base de estruturas periféricas para torres quase verticais. Sua escala gigantesca é tal que quase desafia o envolvimento humano em sua construção e elas parecem ter brotado do solo sozinhas, como algum grande crescimento orgânico, e poucas estruturas humanas podem rivalizar com suas alturas inspiradoras. Embora não existam duas torres exatamente iguais, todas compartilham características comuns e são construídas de maneira semelhante." },
					{ type: "p", text: "Uma seção cortada através de uma torre não é um círculo inteiro. Uma torre é dividida em uma série de segmentos, como cunhas unidas no centro. Ravinas profundas ou fendas na torre, cruzadas por poços de comunicação, separam os segmentos. Essas ravinas devem admitir luz e ar na torre, mas seu tamanho torna isso impraticável. Cada poço de comunicação também adiciona sua sombra à escuridão do interior. As áreas próximas ao núcleo estão muito distantes do mundo exterior. Sua única iluminação é fornecida por globos brilhantes e cabos maciços de fibra óptica ou flexi-vidro, que descem até o núcleo da colmeia a partir dos pináculos iluminados pelo sol das torres. Estes criam feixes de luz fracos que penetram nas catacumbas escuras da colmeia e a iluminam como a nave de uma vasta catedral." },
					{ type: "p", text: "O ar fresco entra nos recessos internos da colmeia por meio de grandes dutos das camadas superiores. Ele é aspirado por enormes ventiladores de entrada de vento e filtrado por dezenas de usinas de purificação para remover os gases acumulados à medida que desce pela altura da torre. Nas partes mais profundas da colmeia e especialmente nas antigas fábricas e camadas inferiores, os dutos de ar não funcionam mais. Aqui, gases e ar viciado se acumulam e respiradores pessoais devem ser usados o tempo todo." },
				],
			},
			{
				id: "a-casca",
				title: "A Casca",
				blocks: [
					{ type: "p", text: "A casca externa de uma colmeia é sua pele e defesa. Embora a casca de uma torre pareça ser bastante sólida, sua superfície é perfurada com poços profundos, verticais e angulares. Esses poços são pequenos em comparação com o volume da torre, mas são importantes porque admitem luz e ar adicionais no núcleo da colmeia. Todos são protegidos por uma série de tampas maciças que podem ser movidas para o lugar quando necessário. A casca é onde a maioria dos túneis e tubos de viagem entre torres começam e terminam. Estações de túnel e fortalezas de entrada, compostos de comboios e blocos de guarnição estão todos localizados na casca, onde podem contribuir para a regulação e defesa do tráfego entre e dentro das colmeias." },
					{ type: "p", text: "A casca também é a primeira linha nas defesas ativas de uma colmeia contra invasão planetária. Lasers de defesa gigantes, cada um capaz de atingir um alvo em órbita, são montados em muitos pontos da estrutura de uma colmeia. Eles são usados para defender a colméia contra naves humanas ou xenos. No entanto, contra as violentas tempestades de cinzas que às vezes assolam Necromunda, a superfície da casca forma sua única proteção verdadeira." },
					{ type: "p", text: "Ser capaz de experimentar a luz solar direta ou sentir uma corrente de ar fresco do duto é um símbolo de status quase tão importante quanto ter uma boa dieta, mas uma única tempestade de cinzas pode tornar esses símbolos de status sem sentido. Uma forte tempestade é capaz de arrancar as camadas externas da casca, incluindo as defesas a laser de uma torre, instalações de viagem e moradores da casca. As cascas devem ser constantemente reformadas por equipes de trabalho, caso contrário, a próxima tempestade de cinzas poderá facilmente penetrar nos túneis, poços e catacumbas da torre principal e destruí-la." },
				],
			},
			{
				id: "os-portadores-do-destino",
				title: "Os Portadores do Destino",
				kind: "callout",
				blocks: [
					{ type: "img", src: "destiny-bearers", alt: "Os Portadores do Destino cruzam a Casca" },
					{ type: "quote", text: "Necromunda hospeda uma estranha raça de criatura chamada cariátide - um humanoide travesso, azul e alado que parece viver nas profundezas dos dutos de ar das cidades. Muitos moradores das colmeias veem as cariátides como amuletos de boa sorte porque às vezes se apegam a indivíduos poderosos e bem-sucedidos, ou àqueles que em breve se tornarão poderosos. Por outro lado, a partida de uma cariátide de \"estimação\" é vista como um presságio de desgraça - seu antigo companheiro então considera-se uma pessoa à espera da morte. Não se sabe se essas criaturas são algum tipo de mutante, criaturas orgânicas cultivadas em cubas que há muito se tornaram selvagens, xenos ou algo completamente inexplicável…" },
				],
			},
			{
				id: "dissipadores-de-calor",
				title: "Dissipadores de Calor",
				blocks: [
					{ type: "p", text: "No coração de cada torre há um único poço vertical conhecido como dissipador de calor. Dos níveis mais altos da torre, o dissipador de calor alcança muito abaixo dos níveis mais baixos da colmeia, descendo pela crosta geológica do próprio planeta. Um dissipador de calor pode ter vários quilômetros de diâmetro. É um vasto tubo oco e selado feito de plasteel denso que retira calor do núcleo do planeta e o transforma em energia para a torre. Em intervalos ao longo do comprimento do dissipador de calor, existem estações geradoras que convertem o calor bruto em energia utilizável. A energia é então transmitida para as fábricas e camadas habitacionais ao redor do núcleo. Não há usinas de energia nos níveis inferiores. O dissipador de calor passa por esses níveis e fornece apenas um calor constante. Isso, no entanto, é infinitamente preferível ao frio úmido da sub-colmeia." },
					{ type: "p", text: "Como é o caso de todas as coisas em Necromunda, os sistemas de geração de energia são controlados pelos clãs em cujo território eles se encontram. Esses clãs recebem uma renda considerável de todos que usam sua energia, portanto, a posse dos dissipadores de calor é uma das principais marcas de um clã poderoso do núcleo interno. Outros clãs podem controlar o território entre as usinas de energia e seus usuários, e muitas vezes cobram seus próprios pedágios de fábricas e produtores de energia para proteger as linhas de transmissão. Dessa forma, os clãs feudais de Necromunda operam como produtores, fornecedores e consumidores em uma economia próspera. Somente nas camadas habitacionais superiores da torre há um serviço regulamentado. Lá, a energia é retirada de estações controladas pelo governo - na verdade, pelas tropas pertencentes à Casa Imperial." },
				],
			},
			{
				id: "zonas-habitacionais",
				title: "Zonas Habitacionais",
				blocks: [
					{ type: "p", text: "A maior parte da população de uma colmeia pertence à classe trabalhadora contratada, cujos membros residem nas vastas e lotadas zonas habitacionais. Aqui, a maior parte dos habitantes humanos da colmeia vive em condições de miséria sombria, enquanto seus mestres vivem no luxo nos níveis superiores da torre. O local onde uma família vive em uma torre reflete sua posição social e importância, sendo os níveis mais altos povoados pelas famílias de elite da colmeia. Essa nobreza da colmeia vive em relativo conforto, desfrutando do luxo da luz natural, ar fresco e comida de verdade importada de mundos agrícolas próximos. Abaixo estão os níveis crepusculares, habitados pelo resto da população. As condições nas zonas habitacionais crepusculares são consideravelmente menos agradáveis do que nas habitações acima. A luz do dia natural é fraca, o ar fresco é desconhecido e a maior parte da comida foi consumida e reciclada muitas vezes antes." },
					{ type: "p", text: "Abaixo das camadas crepusculares está a escuridão da cidade subterrânea. Aqui, a única luz vem de globos brilhantes artificiais. Tudo, até o ar, nesses níveis já foi usado antes e reprocessado várias vezes. Em Necromunda, tudo o que pode ser reciclado é reciclado, incluindo as próprias pessoas." },
				],
			},
			{
				id: "zonas-de-manufatura",
				title: "Zonas de Manufatura",
				blocks: [
					{ type: "p", text: "Os complexos industriais construídos nas torres produzem todos os tipos de itens diferentes que são comercializados com outros planetas em troca dos alimentos que Necromunda precisa tão desesperadamente para alimentar seus bilhões de habitantes. Os níveis das fábricas se estendem de baixo das zonas habitacionais inferiores até a superfície dos resíduos de cinzas e além. Ao longo dos milênios, o escoamento exsudado das fábricas se solidificou ao redor da base das colmeias, aumentando a camada cada vez maior de resíduos de cinzas que cobrem a superfície do planeta. À medida que o nível dos resíduos de cinzas aumenta, as fábricas inferiores se encontram enterradas abaixo do nível do solo. Enquanto for possível bombear efluentes para a superfície, essas fábricas ainda podem continuar operando." },
					{ type: "p", text: "Os níveis das manufaturas em funcionamento são uma rede de tubulações de resíduos, dutos de esgoto e drenos de gás que expelem venenos e dejetos tóxicos para longe das áreas de trabalho. Esses drenos projetam-se dos flancos inferiores das colmeias, expelindo gás perigoso, lançando fumaça no ar imundo ou despejando líquidos tóxicos e resíduos sólidos sobre a cinza poluída abaixo. Em muitos casos, a escala dessas manufaturas é absolutamente impressionante, a forma humana reduzida a um insignificante grão de poeira comparada à grandeza industrial decadente que se ergue acima. Em alguns lugares, o interior parece o funcionamento interno de algum motor gigantesco, desafiando a imaginação e negando a mão da Humanidade em seu projeto e construção." },
					{ type: "p", text: "A produção industrial é controlada pelos muitos clãs das colmeias. Cada produtor se encaixa em um padrão de obrigação feudal — fornecendo a outros clãs e obtendo matérias-primas, componentes e energia de outros. Clãs grandes e poderosos, em particular as seis Casas Clã, atuam como centros de distribuição para os bens e serviços fornecidos por seus inferiores. Esse feudalismo industrial regula a oferta e a demanda de maneira brutalmente eficiente." },
					{ type: "p", text: "Os clãs frequentemente ascendem em poder e importância ao longo do tempo, à medida que clãs menores em indústrias relacionadas se unem para formar alianças instáveis. Às vezes, conflitos de interesse, direitos territoriais e rivalidades entre clãs levam a disputas internas. Esta é uma das principais causas da guerra de gangues em Necromunda, pois os clãs empregam seus jovens para lutar suas muitas batalhas por eles, garantindo que os negócios da indústria continuem sem interrupção.\\ \\ Os trabalhadores geralmente vivem em zonas habitacionais localizadas muito perto das manufaturas onde trabalham e são um recurso tanto quanto as máquinas que operam. Em alguns casos, os trabalhadores são cirurgicamente modificados para desempenhar funções especializadas. Esses aprimoramentos físicos e mentais podem ser muito caros para financiar, o que torna esses trabalhadores extremamente valiosos para aqueles para quem trabalham." },
				],
			},
			{
				id: "manufaturas-em-ruinas",
				title: "Manufaturas em Ruínas",
				blocks: [
					{ type: "p", text: "À medida que a superfície dos resíduos se eleva, torna-se cada vez mais difícil manter as manufaturas nos níveis soterrados. Bombas de vácuo gigantescas elevam incontáveis toneladas de lixo acima do nível da superfície para ventilação fora da colmeia, mas mesmo estas têm seus limites. Há um ponto em cada cidade abaixo do qual descartar os resíduos das manufaturas se torna impraticável. Quando o custo de descarte de resíduos deixa de ser compensado pelo valor da produção de uma manufatura, ela é fechada e abandonada." },
					{ type: "p", text: "Conforme os níveis inferiores caem abaixo do nível dos resíduos de cinza e são abandonados à escória da sociedade, as zonas habitacionais inferiores são convertidas em novas manufaturas e as zonas habitacionais superiores são estendidas para cima. Desta forma, as torres da cidade colmeia são continuamente renovadas." },
					{ type: "p", text: "Zonas de manufaturas em ruínas, repletas de máquinas abandonadas, às vezes alcançam profundidades subterrâneas tão extensas quanto as torres se estendem acima. As partes mais baixas dessas zonas antigas são pouco mais do que escombros, tendo desabado sob o peso da colmeia ou sido deliberadamente preenchidas para criar fundações para obras posteriores. As manufaturas e níveis habitacionais abandonados são infestados por escavadores — gangues mutantes que vagam pelas camadas mortas da colmeia em busca de qualquer coisa que possam usar ou comercializar." },
				],
			},
			{
				id: "a-sub-colmeia",
				title: "A Sub-colmeia",
				blocks: [
					{ type: "p", text: "Abaixo dos níveis funcionais de uma colmeia encontra-se um favo de mel de cúpulas antigas, túneis, ruínas e estruturas do passado há muito morto de Necromunda. Essas ruínas ficam bem no fundo de cada cidade, abaixo das zonas de manufatura dominadas pelos clãs e dos resíduos de cinza: são as sub-cidades, as partes mais antigas e profundas das colmeias de Necromunda." },
					{ type: "p", text: "Essas zonas de sub-cidade — chamadas de \"sub-colmeia\" pela maioria — frequentemente antecedem a construção da colmeia acima em muitos séculos, até milênios. São remanescentes das verdadeiras cidades de Necromunda, construídas antes que a ecologia natural do planeta fosse destruída, quando não havia resíduos de cinza invasoras, e é bem possível que os restos das naves coloniais que trouxeram a humanidade pela primeira vez ao planeta ainda estejam sob algumas colmeias." },
					{ type: "p", text: "Os habitantes das sub-colmeias são considerados pelos moradores da colmeia superior como pouco melhores do que os animais nocivos que também são encontrados lá. A vida nas sub-colmeias é ainda mais violenta e difícil do que a vida nas zonas acima. No fundo da colmeia, a mobilidade ascendente é mais do que um conceito abstrato. Os fortes, os sortudos e os implacáveis podem chegar ao topo, em termos de localização real na colmeia, bem como em status. As sub-colmeias são frequentemente os campos de batalha das guerras por procuração travadas em nome das Casas Clã, as gangues compostas pelos jovens cumprindo seu tempo antes de retornar à colmeia para servir suas famílias, se conseguirem sobreviver…" },
					{ type: "img", src: "underhive", alt: "A sub-colmeia — ruínas, domos esquecidos e assentamentos ilegais" },
				],
			},
			{
				id: "o-fundo-da-colmeia",
				title: "O Fundo da Colmeia",
				blocks: [
					{ type: "p", text: "Na base da colmeia, os edifícios se tornam tão estruturalmente perigosos que a região assume um caráter diferente e ainda mais inóspito. Esta é a zona final e mais profunda e é conhecida como o fundo da colmeia." },
					{ type: "p", text: "Essas áreas são tão deterioradas e em ruínas que as cúpulas originais e as estacas de fundação desabaram há muito tempo, formando uma camada de entulho quase sólido. Dentro dos escombros, há bolsões fechados ligados por buracos e túneis criados por líquidos vazando de cima. Esses poluentes e efluentes, o fluido de descarga de toda a colmeia, formam um vasto lago de putrefação radioativa chamado de Sumidouro." },
					{ type: "p", text: "Nada pode viver no fundo da colmeia além dos mais monstruosos mutantes. Seus habitantes são a prole das trevas e da poluição. Algumas dessas criaturas imundas encontram seu caminho para a sub-colmeia, ou até mesmo para as partes mais baixas da cidade acima, mas seu domínio natural é a escuridão do fundo da colmeia." },
					{ type: "img", src: "hive-bottom", alt: "O fundo da colmeia — o abismo tóxico sob a cidade" },
				],
			},
			{
				id: "mutacao-e-loucura",
				title: "Mutação e Loucura",
				kind: "callout",
				blocks: [
					{ type: "quote", text: "O ar, a água e a comida constantemente reciclados de uma colmeia têm um efeito inevitável sobre seus habitantes. Poluentes e toxinas se acumulam no biossistema, causando instabilidade genética e mutação, e os efeitos disso são piores mais abaixo na colmeia, onde as toxinas são mais concentradas. Como a mutação é tão comum, pequenas deformidades são toleradas até certo ponto, mesmo na colmeia superior. No entanto, mutantes conspícuos são erradicados e destruídos de acordo com as leis estritas das Casas e da colmeia. Somente aqueles que fogem para a sub-colmeia podem esperar escapar e talvez começar novas vidas, perdendo-se entre a população em constante mudança da sub-colmeia." },
					{ type: "quote", text: "Os habitantes da sub-colmeia são mais tolerantes com mutantes do que outros necromundanos. Desde que os mutantes mantenham um perfil discreto e não sejam óbvios ou grosseiramente deformados, eles podem viver pacificamente até mesmo dentro de um grande assentamento. Os habitantes da sub-colmeia não estão inclinados a fazer perguntas ou olhar muito de perto para seus vizinhos e são mais simpáticos aos mutantes em geral." },
					{ type: "quote", text: "Claro, nem todos são igualmente tolerantes. A Casa Cawdor, especialmente, é rápida em se voltar contra os mutantes. Outros grupos fanáticos, como os Redentores, odeiam todos os mutantes, não importa quão pequenas sejam suas deformidades, e seu credo prega a destruição intransigente de todos os desviantes." },
					{ type: "quote", text: "Para aqueles muito mutados para viver em um grande assentamento, a extensão sem lei do fundo da colmeia oferece ampla oportunidade para se esconder. Mutantes das variedades mais hediondas, abominações com tentáculos, monstruosidades escamosas de muitos membros, gravitarão naturalmente em direção às partes mais profundas da colmeia e ao fundo da colmeia. Nem todos os mutantes são fisicamente grotescos. Alguns parecem normais, mas na verdade têm poderes psíquicos de um tipo ou outro. Esses mutantes são mais prontamente aceitos na sub-colmeia do que desviantes conspícuos. Alguns são até bem-vindos e protegidos porque suas habilidades são úteis, como curandeiros psíquicos e precognitivos que preveem o futuro." },
				],
			},
			{
				id: "as-favelas",
				title: "As Favelas",
				blocks: [
					{ type: "p", text: "Agrupadas na borda externa das cascas das torres, existem vastas extensões de favelas decadentes. Elas são habitadas por todos os tipos de escória inadequada para a vida dentro das colmeias. As torres, pelo menos, oferecem uma proteção limitada contra as chuvas venenosas e as cinzas corrosivas — o melhor abrigo que um morador de favela pode esperar é uma ou duas camadas de material de embalagem ou um veículo abandonado. Para piorar as coisas, grande parte dos efluentes tóxicos das fábricas despeja diretamente sobre as favelas." },
					{ type: "p", text: "Se uma favela permanece em existência por qualquer período de tempo e de alguma forma escapa de ser varrida por uma tempestade ou incinerada pelas autoridades da colmeia, os habitantes escavam cavernas e porões na lama solidificada e na poeira compactada. Essas habitações podem ser reforçadas com lama cozida ao sol em tijolos brutos. Ao se retirarem para esses refúgios, alguns moradores de favelas sobrevivem às tempestades de cinzas que varrem as partes mais frágeis de suas casas. Quando a tempestade diminui, eles abrem caminho através da poeira soprada pelo vento até a superfície e tentam reconstruir a favela a partir dos destroços da antiga." },
					{ type: "p", text: "As condições nas favelas são piores do que qualquer coisa nas colmeias, mas para a maioria dos moradores de favelas, mesmo sua casa rudimentar é preferível a vagar pelos resíduos de cinzas, onde seriam vítimas das criaturas e nômades — isso se o calor, a poeira corrosiva e as tempestades anormais não os pegassem primeiro!" },
					{ type: "p", text: "Além das limpezas periódicas de controle populacional, ninguém das colmeias se incomoda muito com os moradores das favelas — eles têm pouco valor para serem relevantes. Além disso, os assentamentos extensos são um lar temporário para gangues cruéis de moradores de sumidouros, escavadores e bandos nômades que vêm periodicamente às favelas para negociar." },
				],
			},
		],
	},
	{
		id: "cidades",
		num: "03",
		title: "Cidades Colmeia de Necromunda",
		accent: "violet",
		sections: [
			{
				id: "a-colmeia-palatina-colmeia-primus",
				title: "A Colmeia Palatina — Colmeia Primus",
				blocks: [
					{ type: "p", text: "A maior e mais antiga colmeia sobrevivente em Necromunda é o lar dinástico de Lorde Helmawr, Comandante Imperial de Necromunda, conhecido em todo o planeta como o Palatino, e o aglomerado ao qual pertence como o Aglomerado Palatino. O cume da torre central e mais alta da Colmeia Palatina forma o palácio de Lorde Helmawr." },
					{ type: "p", text: "A Colmeia Palatina ostenta algumas das arquiteturas mais grandiosas e magníficas de Necromunda e também possui o único estaleiro e campo de pouso grande o suficiente para receber transportadoras orbitais. É, portanto, o único espaço-porto do planeta, uma expressão física do monopólio de Helmawr no comércio fora do planeta. Um mosteiro-fortaleza dos Adeptus Astartes Punhos Imperiais e a sede dos Adeptus Arbites em Necromunda também estão localizados na Colmeia Palatina. Nos limites da colmeia, há uma torre especificamente reservada para abumanos e para os poucos xenos sancionados que recebem acesso a Necromunda de tempos em tempos para comercializar. Tanto Anões quanto Eldar estão entre esses visitantes e são alojados em níveis separados desta torre. O Palatino, ou pelo menos seus níveis superiores, é, portanto, de longe a mais cosmopolita de todas as colmeias de Necromunda." },
					{ type: "p", text: "O equilíbrio de poder na Colmeia Primus é rigorosamente mantido e qualquer tentativa de desestabilizá-lo é reprimida com força brutal. Assim, a Casa Imperial governa com punho de ferro, enquanto as Casas Nobres e as Casas de Clãs menores detêm tanto poder que nenhuma Casa domina as outras." },
				],
			},
			{
				id: "o-olho-de-selene",
				title: "O Olho de Selene",
				blocks: [
					{ type: "p", text: "Preso em órbita geoestacionária, cem quilômetros diretamente acima da Colmeia Primus, está um dos depósitos de comércio orbital mais movimentados do Segmentum Solar — o Olho de Selene. O Olho serve como o único nexo de transporte para o planeta abaixo, e é o único meio pelo qual as mercadorias são autorizadas a serem enviadas para ou de Necromunda, garantindo que a Casa Imperial sempre receba o que lhe é devido. Os víveres são enviados para Primus e depois enviados por terra para outras colmeias em troca de produtos manufaturados que seguem na outra direção. Muitos mercadores visitantes ou administradores de dízimos observaram a aparente ineficiência deste sistema, mas nenhum questionaria sua eficácia em manter o poder inquestionável da Casa Helmawr." },
				],
			},
			{
				id: "colmeia-mortis",
				title: "Colmeia Mortis",
				blocks: [
					{ type: "p", text: "Como as grandes Casas dinásticas que as governam, as colmeias de Necromunda podem ascender e cair em suas fortunas. A Colmeia Mortis é vítima de seu próprio sucesso. Outrora um eixo industrial dos aglomerados de cidades equatoriais, gozava de grande prestígio entre a elite planetária. Sua alta produção de máquinas trouxe riqueza aos seus governantes e um lugar invejável entre as classificações de dízimo. Milhões de trabalhadores outrora enchiam seus túneis e cúpulas com o som incessante de seu trabalho, enquanto as Casas Nobres lutavam pelos frutos de seu trabalho." },
					{ type: "p", text: "As primeiras sombras do desastre foram sutis em sua chegada — uma doença que lentamente infectou as classes mais baixas e reduziu seus números. No início, as mortes se perderam entre o desgaste dos clãs de trabalho, descontadas como picos sazonais de mortalidade, mas logo até mesmo os Mestres da Casa não puderam negar seu significado. A praga havia chegado à sua colmeia." },
					{ type: "p", text: "Quando a notícia chegou a Lorde Helmawr, sua reação foi rápida e a Colmeia Mortis foi selada por ordem imperial. Durante anos, a praga devastou a colmeia e, logo, os mortos superaram os vivos. No caos, as Casas lutaram pelo poder enquanto lutavam amargamente pelo que restava. À medida que a batalha se intensificava, seções inteiras da colmeia tiveram que ser lacradas — túneis empilhados do chão ao teto com cadáveres. Eventualmente, a doença diminuiu, tendo se extinguido depois de devorar mais de vinte milhões de almas. Em sua benevolência, Lorde Helmawr revogou sua ordem e permitiu que a colmeia abrisse seus portões mais uma vez." },
					{ type: "p", text: "A Colmeia Mortis é um lugar mudado que não prospera mais na criação de máquinas, mas sim na indústria da morte. Com seus enormes recursos humanos desaparecidos, as Casas governantes se voltaram para a única coisa que tinham em abundância — os mortos. Cultos mortuários foram criados e as fábricas se voltaram para a coleta e decomposição de cadáveres. A Casa Escher ascendeu ao domínio entre seus pares na Colmeia Mortis, extraindo e fermentando drogas de corpos — embora suas gangues de \"donzelas da morte\" não fiquem sem contestação." },
					{ type: "p", text: "As Casas ainda lutam tão furiosamente quanto lutavam quando a Colmeia Mortis estava no auge de seu poder, embora o ritmo da batalha tenha mudado. Pequenas comunidades se abrigam na vastidão vazia de cúpulas e níveis construídos para abrigar milhões, e seus cidadãos ainda sentem medo de viajantes e do retorno da praga. Gangues vagam por este deserto de blocos habitacionais ocos e setores abandonados, lutando por cofres cheios de cadáveres ou tentando entrar à força em câmaras lacradas para saquear as riquezas ressecadas dentro." },
				],
			},
			{
				id: "agulha-de-gothrul",
				title: "Agulha de Gothrul",
				blocks: [
					{ type: "p", text: "A Colmeia Primus detém o monopólio do comércio exterior e é o portal de Necromunda para as estrelas, suas chaves firmemente guardadas nas mãos de Lorde Helmawr. Nem sempre foi assim. A Agulha de Gothrul, sua torre rivalizando com a altura da Colmeia Primus, foi um dos primeiros espaço-portos de Necromunda, e seus níveis superiores ainda estão repletos de plataformas de ancoragem e estações terminais para naves orbitais. No entanto, não foi apenas por causa de seu lugar como rival comercial da Colmeia Primus e da ascensão do Aglomerado Palatino que a fortuna de Gothrul foi tomada. A Agulha de Gothrul é governada pela mais perigosa e perniciosa das formas de governo: a democracia. Um conselho de representantes eleitos controla os interesses da colmeia e regula as atividades das Casas, garantindo o tratamento justo de seus cidadãos e a segurança de todos. Considerada tão insidiosa quanto qualquer ameaça xenos ou infestação de culto, as Casas de outras colmeias tentaram por anos derrubar os governantes de Gothrul. Quando perceberam que cortá-los do comércio orbital não diminuiu sua riqueza e poder, as Casas então começaram uma longa guerra nas sombras." },
					{ type: "p", text: "Gangues e guerras de gangues são proibidas pelo Conselho de Gothrul, e as Casas Clãs são toleradas sob a condição de que mantenham suas populações sob controle. Mesmo assim, elementos criminosos proliferam nos níveis inferiores da colmeia, e os oficiais de proteção ao cidadão de Gothrul — os quadros de agentes voluntários da colmeia — são constantemente testados. A Casa Delaque é um ator principal na desestabilização da Agulha de Gothrul, suas gangues subservientes rotineiramente cometendo atos de sabotagem e assassinato. Das profundezas sufocadas pelo sumidouro da colmeia, Sych Guvros, o mais poderoso dos senhores supremos Delaque, trava sua guerra de terror. Seus ganguistas invadem os níveis superiores, atacando parques habitacionais e praças de intercâmbio, cada um representando um golpe contra o Conselho. Guvros se tornou uma lenda entre sua Casa, e dezenas de gangues Delaque vieram de outras colmeias para se juntar à sua luta." },
					{ type: "p", text: "Embora o conselho democrático de Gothrul possa ser o inimigo final das Casas, isso não as impede de lutar entre si — especialmente se a queda percebida do governo da colmeia se aproximar, todas querem estar prontas para atacar e reivindicar o máximo de poder possível. Algumas gangues até lutam ao lado de Gothrul, na esperança de reverter a situação contra seus rivais, caso algum deles pareça perto demais de reivindicar a vitória final. Assim, a guerra nas sombras pela Agulha de Gothrul continua, nunca encontrando uma resolução." },
				],
			},
			{
				id: "trazior",
				title: "Trazior",
				blocks: [
					{ type: "p", text: "A Colmeia Trazior também é conhecida como as Três Irmãs no dialeto necromundano local. É assim chamada por causa de suas três enormes torres, que podem ser vistas a grande distância por qualquer viajante que atravesse os resíduos vindos do sul. Trazior está localizada na borda do Grande Deserto Equatorial e é a colmeia \"fronteiriça\" mais ao sul do grande Aglomerado Palatino." },
					{ type: "p", text: "Muitos clãs mercantes importantes estão com suas bases nesta colmeia, e é o principal depósito comercial para comboios que vão ou chegam dos aglomerados de colmeias do sul. Atraídos pelas riquezas que podem ser encontradas entre eles, os nômades que vivem nos resíduos e atacam os comboios são uma fonte constante de aborrecimento para seus habitantes." },
					{ type: "p", text: "A base manufatureira da Colmeia Trazior é dominada pelos sub-clãs da Casa Orlock, mas a Casa Goliath tem uma presença substancial e crescente em seus setores de fornalhas. As torres superiores são infames pelas muitas gangues chamadas de \"pirralhos\" - os descendentes inquietos da nobreza que se deleitam cruelmente em se envolver em guerras de gangues com os \"plebeus\" da sub-colmeia. Eles são particularmente conhecidos pelas motos a jato brilhantemente pintadas e incrivelmente raras que correm pelas vias e tubos de trânsito, causando travessuras e caos por onde passam." },
				],
			},
			{
				id: "colmeia-acropole",
				title: "Colmeia Acrópole",
				blocks: [
					{ type: "p", text: "Esta é outra colmeia antiga e ornamentada no Aglomerado Palatino. Está localizada em uma interseção vital de vários grandes túneis rodoviários e sempre foi um importante centro comercial em Necromunda. A Colmeia Acrópole é o território natal de alguns dos clãs mercantes mais poderosos, cuja ampla rede comercial se estende por muitas das colmeias de Necromunda. Desesperada para compartilhar dessa riqueza, a Colmeia Acrópole atrai uma série de favelas grandes e extensas que se agrupam em torno de sua base como uma ferida infectada." },
					{ type: "p", text: "Todas as Casas Nobres têm presença na Colmeia Acrópole, mas cada uma geralmente se contenta em apoiar o status quo. No entanto, a Casa Delaque é conhecida por exercer um rico comércio de informações e intrigas lá, lucrando imensamente com as inúmeras guerras internas dos mercadores." },
				],
			},
			{
				id: "o-temenos",
				title: "O Temenos",
				blocks: [
					{ type: "p", text: "Esta é outra colmeia no Aglomerado Palatino. Uma de suas torres forma a sede da Eclesiarquia em Necromunda, enquanto outra torre forma a Catedral do Imperador Deificado. Escolas, bibliotecas e capelas ocupam partes das outras torres. Um priorado das Adepta Sororitas também está localizado em uma das torres externas, e esta torre é frequentemente chamada de Torre das Irmãs como consequência." },
					{ type: "p", text: "A população da Colmeia Temenos está entre os seguidores mais piedosos e devotos do Culto Imperial em Necromunda. Muitas das Casas Clãs residentes fabricam itens rituais para a Eclesiarquia, enquanto outras trabalham no scriptorium, traduzindo a sabedoria do sacerdócio para os muitos dialetos de Necromunda. A Colmeia Temenos é uma importante base de poder para a Casa Cawdor, cujas gangues subservientes vasculham os níveis inferiores em busca de hereges expulsos de cima e fazem guerra constante contra quaisquer rivais cuja visão da fé difira, mesmo que ligeiramente, da sua." },
					{ type: "p", text: "Temenos é uma maravilha arquitetônica — seu interior é um labirinto de naves, capelas e criptas, tetos abobadados e salões com pilares. A luz difusa é manchada pela refração através do cristal. Incenso e o som de cânticos flutuam pelas câmaras. Aqui e ali, estátuas e hologramas do Imperador residem em santuários isolados, e de seus salões santificados, confessores e missionários são enviados por toda Necromunda e para mundos fronteiriços em sistemas próximos." },
				],
			},
			{
				id: "aglomerado-quinspirus",
				title: "Aglomerado Quinspirus",
				blocks: [
					{ type: "p", text: "O Aglomerado Quinspirus está situado na borda de um mar de lodo virtualmente solidificado chamado Oceano Sumidouro Mundial. Antigamente, quando o mar ainda era navegável, a área incluía vastos estaleiros. Estes agora permanecem enterrados nas profundezas da sub-cidade da Colmeia Quinspirus, localizada centralmente. Esta colmeia tem cinco grandes torres — daí o apelido que significa \"cinco torres\" no dialeto local e que dá nome a todo o aglomerado. Os armazéns cavernosos das antigas orlas marítimas têm sido palco de muitas guerras de gangues selvagens, em particular entre gangues subservientes às Casas Orlock e Delaque." },
				],
			},
			{
				id: "a-caveira",
				title: "A Caveira",
				blocks: [
					{ type: "p", text: "Esta colmeia abandonada é a maior de um aglomerado de três colmeias em ruínas remotas. É perfurada por grandes buracos e, à distância, parece uma grande caveira jazendo nos resíduos. É um marco famoso e há rumores de que é adorada pelos nômades locais. Este aglomerado é tudo o que resta das colmeias que foram capturadas e ocupadas por um tempo por invasores Orks. Todo o contato com o aglomerado foi perdido por vários anos antes que o resto de Necromunda percebesse o que havia acontecido e uma campanha fosse montada para limpá-los. Este foi o motivo original para o envio de um contingente de Fuzileiros Espaciais para Necromunda, que desde então se tornou um estabelecimento permanente no mundo colmeia." },
					{ type: "p", text: "As colmeias foram sitiadas e destruídas durante a campanha. Agora, os topos desabaram e jazem abandonados e sufocados pela poeira. Ninguém sabe que coisas terríveis fizeram sua casa em meio às ruínas da Caveira, e até mesmo os nômades e escavadores temem chegar perto delas." },
				],
			},
			{
				id: "colmeia-secundus",
				title: "Colmeia Secundus",
				blocks: [
					{ type: "p", text: "Houve um tempo em que a Colmeia Secundus era, como seu nome indica, a segunda maior cidade colmeia em toda Necromunda. Isso mudaria pouco mais de um século atrás, no entanto, quando Secundus foi vítima de uma infestação Genestealer que posteriormente foi descoberta como resultado de experimentos não naturais realizados pelo Tecnosacerdote Biologis Hermiatus do Adeptus Mechanicus, cuja pesquisa deu tão desastrosamente errado que agentes da Inquisição foram forçados a intervir a um custo terrível. Na destruição que se seguiu, a Colmeia Secundus foi submetida a tal punição nas mãos das próprias baterias de defesa planetária de Necromunda que sua torre central foi derrubada, caindo para descansar como uma coluna caída estilhaçada por dez quilômetros dos resíduos." },
					{ type: "p", text: "Por mais poderosa que fosse essa resposta, ela falhou em livrar Necromunda da mancha do Genestealer. Essas ruínas permanecem invadidas pelas criaturas xenos e seus parentes humanos infectados. Com as baterias de defesa planetária perigosamente esgotadas, um anel de trincheiras e redutos foi erguido ao redor da ruína, e isso se tornou cada vez mais denso a cada ano que passa, sendo patrulhado por recrutas e tropas penais de todo o mundo." },
					{ type: "p", text: "Diz-se que nada pode escapar desse anel de aço, mas é preciso vigilância implacável e constante para garantir que isso não aconteça. As criaturas xenos continuam até hoje a se reproduzir dentro da colmeia destruída, engajadas em uma guerra constante de sobrevivência com os descendentes dos sobreviventes humanos que agora existem como selvagens ferozes há muito abandonados por seus companheiros necromundanos." },
					{ type: "img", src: "hive-secundus", alt: "Colmeia Secundus, a Cidade Fantasma em quarentena" },
				],
			},
		],
	},
	{
		id: "ermos",
		num: "04",
		title: "Os Desertos de Cinzas",
		accent: "rust",
		sections: [
			{
				id: "os-desertos-de-cinzas",
				title: "Os Desertos de Cinzas",
				blocks: [
					{ type: "img", src: "ash-wastes", alt: "Os Desertos de Cinzas que separam as colmeias" },
					{ type: "p", text: "Além da Colmeia Trazior, os Grandes Desertos Equatoriais se estendem para o sul até onde a vista alcança — pelo menos em um dia relativamente claro, quando os céus amarelos tóxicos de Necromunda não estão pressionando as planícies oleosas de cinzas, ou nuvens ondulantes cor de mostarda não estão avançando do oeste ou leste em uma das infinitas frentes de tempestade do planeta. Aqui, as colmeias tornam-se menores e mais esparsas, as torres superiores da Colmeia Trazior apenas um pontinho visível no horizonte norte, e vastas regiões de dunas queimadas e terrenos duros e brilhantes dominam a paisagem." },
					{ type: "p", text: "Claro, os Desertos Equatoriais estão longe de estar vazios, e assentamentos de resíduos, estradas comerciais, tubos e minas de sucata pontilham a extensão. É uma região vital para o comércio norte/sul, com mercadorias constantemente viajando de colmeia em colmeia, e de e para a Colmeia Primus para entrar e sair da esfera orbital necromundana. Casas Clãs, nobres e guildas competem pelo controle desta região, buscando exercer sua influência sobre as estradas comerciais ou patrocinar garimpeiros e assentamentos de mineração que possam gerar lucro. E com assentamentos, postos comerciais e minas vêm todos os elementos criminosos e marginalizados que prosperam onde pessoas e lucro podem ser encontrados." },
					{ type: "p", text: "Os Grandes Desertos Equatoriais cobrem milhões de quilômetros quadrados, limitados ao norte pelo Aglomerado Palatino, a leste pela Muralha de Poeira e Colmeia Secundus, ao sul pelo Aglomerado Mynerva e a oeste pelo Oceano Irradium. É um lugar sem lei onde o poder da Casa Imperial diminui, e as infrequentes patrulhas de Executores e as Fortalezas-Prefeituras de terras ermas pouco podem fazer para manter a paz. Até mesmo as Casas Clãs devem confiar nos elementos mais marginais de seus súditos para realizar trabalhos neste deserto infernal." },
				],
			},
			{
				id: "cratera-cinderak",
				title: "Cratera Cinderak",
				blocks: [
					{ type: "p", text: "Central para a região — e o foco de todo esse comércio, conflito e prospecção — é a Cratera Cinderak, também conhecida como a Grande Cratera ou Tumba de Gothrul. Uma ferida na borda ocidental dos Grandes Desertos Equatoriais, é tudo o que resta da outrora grande Colmeia Meridian. Com mais de cem quilômetros de diâmetro, foi criada durante a Guerra de Duas Caras, quando Gothrul Helmawr tentou matar de fome a Colmeia Primus sabotando o reator de macroplasma da Colmeia Meridian — na época, a colmeia era o celeiro do hemisfério ocidental de Necromunda. A explosão resultante obliterou a colmeia, espalhando seus restos por centenas de quilômetros e deixando um buraco nos resíduos com quase um quilômetro de profundidade. No final, Gothrul foi derrotado por sua irmã Cinderak, embora a terrível evidência de seu crime permaneça. Nos séculos seguintes, tornou-se um centro para o comércio norte/sul no Planalto Palatino e um rico terreno de coleta." },
					{ type: "p", text: "No meio da Grande Cratera, construída sobre os restos destruídos da Colmeia Meridian, fica a Cidade Cinderak. Um grande assentamento, que se estende por quilômetros dos resíduos, e é o centro dos comboios comerciais do norte, sul, leste e oeste, bem como centenas de assentamentos menores nos Desertos Equatoriais e além. Cada uma das Casas Clãs tem uma participação na Cidade Cinderak e é um foco de conflito entre elas." },
				],
			},
			{
				id: "cidade-cinderak",
				title: "Cidade Cinderak",
				blocks: [
					{ type: "p", text: "O maior assentamento nos resíduos, a Cidade Cinderak é um ponto de encontro no meio dos Grandes Desertos Equatoriais. As principais estradas partem da cidade murada até as bordas da Grande Cratera e além, ligando-se à Estrada da Bala no norte e à Estrada dos Ossos no sul, bem como à Grande Estrada de Cinzas que circunda o planeta. A Cidade Cinderak é um local de encontro para moradores de colmeias, moradores de resíduos, estrangeiros e todos os demais. Suas torres de macro-armas (cada uma recuperada das defesas da Colmeia Meridian) são um farol para viajantes por quilômetros em todas as direções. Clãs de poeira e catadores vêm à Cidade Cinderak para negociar com delegações de Mercator Gelt ou Prospectores Anões do Despojo Próximo, enquanto os grandes trens rodoviários que transportam mercadorias de e para a Colmeia Primus passam pelo assentamento. Aqui seus seis Lordes Clãs cobram impostos em 'nome' de suas Casas Clãs. Para o bem ou para o mal, a Cidade Cinderak serve como o coração dos Grandes Desertos Equatoriais e representa a única civilização real por quase meio continente em todas as direções." },
				],
			},
			{
				id: "o-ermo-em-transformacao",
				title: "O Ermo em Transformação",
				blocks: [
					{ type: "p", text: "Uma das razões pelas quais a Cidade Cinderak sobreviveu por tanto tempo, onde outros assentamentos foram enterrados ou destruídos por tempestades de cinzas, é a proteção da Grande Cratera. À medida que as estações mudam e o clima tóxico rola sobre os Desertos Equatoriais, os residentes da Cratera são, até certo ponto, protegidos do pior que seu planeta pode lançar sobre eles. Isso não quer dizer que não houve momentos em que grandes tempestades radioativas ou outras calamidades desceram sobre a Cidade Cinderak, mas até agora ela escapou de danos graves. A Cidade Cinderak também se beneficia muito das tempestades periódicas, pois, embora enterrem algumas coisas, revelam outras, e na vigília de tais distúrbios tão poderosos, os catadores se espalham pela Cratera em busca de recompensas no deserto." },
				],
			},
			{
				id: "agulhas-na-tempestade",
				title: "Agulhas na Tempestade",
				blocks: [
					{ type: "p", text: "Necromunda é um mundo que está sempre à beira do colapso ambiental completo. Sua atmosfera, após milênios de abuso, é quase completamente tóxica para a vida biológica e até mesmo as grandes cidades colmeia lutam para proteger seus habitantes. Pior ainda, a falta de água potável na superfície de Necromunda levou à liberação de enormes quantidades de CO2 na atmosfera e, se não for controlada, ela se tornaria inabitável até mesmo para as poucas almas atualmente capazes de sobreviver fora das colmeias. Embora o Império se importe pouco com o destino da biosfera de Necromunda, ele exige que o mundo permaneça produtivo para que possa atender ao Dízimo Imperial." },
					{ type: "p", text: "Para esse fim, logo após o mundo ser conquistado pelo Império, terraformadores habilidosos foram trazidos para Necromunda. Muitos deles eram clãs itinerantes de Anões, cuja tecnologia de engenharia é particularmente valorizada nesta época em que o Adeptus Mechanicus proibiu tanto ciosamente. Os terraformadores ergueram grandes torres de convergência térmica nos pólos do planeta e ao redor de seu equador. Essas Agulhas, como ficaram conhecidas, processaram o CO2 e acalmaram as tempestades. Séculos depois, muitas das Agulhas ainda estão de pé, fazendo seu trabalho vital para conter a inevitável destruição da biosfera, mantidas pelos mesmos clãs Anões cujos ancestrais as ergueram." },
				],
			},
			{
				id: "estacoes-e-tempestades",
				title: "Estações e Tempestades",
				blocks: [
					{ type: "p", text: "Embora a atmosfera de Necromunda seja tóxica, nem sempre e em todos os lugares é mortal. Saber onde e quando um viajante pode passar por uma região do mundo significa entender as estações de Necromunda e as diferentes tempestades que elas provocam. Existem duas estações principais no planeta: Fúria — a Estação das Chamas e Noctia — a Estação das Cinzas." },
					{ type: "p", text: "Durante Fúria, as temperaturas disparam e os desertos químicos reagem ao calor incendiando-se, enquanto rios tóxicos são trazidos à superfície pela evaporação geológica. Durante a Estação das Chamas, as tempestades são menos frequentes e mais fracas, e viajar em algumas regiões é \"mais seguro\"." },
					{ type: "p", text: "Durante Noctia, os grandes ventos ocidentais sopram forte, circulando o planeta sem nunca diminuir, e suas tempestades causam imensa destruição tanto nas terras quanto nas colmeias. Muitos lugares em Necromunda são impossíveis de alcançar durante a Estação das Cinzas, e viajar para qualquer lugar se torna mais difícil." },
					{ type: "p", text: "Entre essas grandes estações, existem várias estações menores, como Raythum, o ciclo entre o início de Fúria e o calor total da Estação das Chamas. Durante Raythum, vastas áreas da espessa mortalha que sufoca o céu de Necromunda são dissipadas, lacunas do tamanho de continentes expondo suas terras à radiação destrutiva da estrela do sistema, enquanto criaturas que passam anos em sono profundo são despertadas pelo vazio que as chama. Raythum também é conhecida como a Estação do Contrabandista, pois os buracos que cria nas nuvens tóxicas permitem que as naves espaciais naveguem até a superfície do planeta sem a necessidade de passar pelo Olho de Selene. Em contraste, Tenaria, ou o Tempo das Sombras, ocorre na esteira das grandes tempestades de Noctia, quando a atmosfera do planeta está espessa com cinzas. Uma noite permanente chega a partes do mundo e, por ciclos sem fim, nem mesmo a luz fraca de sua estrela atinge os resíduos." },
					{ type: "p", text: "As tempestades são uma constante nos resíduos de cinzas, e raramente há um momento em que o uivo infinito do vento não sopra. Nuvens rolam e se agitam sem parar nos céus e o horizonte está quase sempre obscurecido por uma face de penhasco móvel de cinzas e areia. A visibilidade diária diminuirá à medida que as nuvens descem, e os viajantes só podem esperar que os ventos tóxicos tragam apenas os perigos habituais dos resíduos e não algo pior. Quando uma tempestade de verdade atinge os resíduos, ela pode ser forte o suficiente para arrancar as pessoas do chão, ou até mesmo arrancar veículos da estrada e arremessá-los, caindo no céu. Relâmpagos vívidos roxos e vermelhos podem cair dessas nuvens para incendiar o solo, enquanto o próprio vento pode trazer radiação mortal, toxinas corrosivas ou chuva ácida. As maiores tempestades podem até ameaçar uma cidade colmeia, atingindo sua concha, enterrando sua base em metros de cinzas e limpando-as das favelas que se agarram a cada uma como lapas. Mais de um assentamento remoto desapareceu em tal tempestade, varrido da face do planeta pelo clima volátil de Necromunda." },
				],
			},
			{
				id: "os-ermos-profundos",
				title: "Os Ermos Profundos",
				blocks: [
					{ type: "img", src: "deep-wastes", alt: "Os Ermos Profundos — território de nômades e criaturas mutantes" },
					{ type: "p", text: "A colmeia mais alta em Necromunda é a Colmeia Primus, cujas torres superiores penetram nas nuvens tóxicas e são dificilmente visíveis do solo. Muitas outras colmeias chegam perto dessa altura, e mesmo as menores podem ter vários quilômetros de altura. Isso significa que as luzes nas torres superiores tornam-se visíveis para o observador acima do horizonte muito antes que o corpo e a base da colmeia apareçam. Como a Colmeia Primus tem 16 quilômetros de altura, suas torres superiores são visíveis a mais de 400 quilômetros de distância, dependendo das condições das nuvens." },
					{ type: "p", text: "Dessa altura elevada, dizem os mestres de Necromunda que o olhar de Lorde Helmawr vê tudo na superfície do planeta, as torres das muitas colmeias que se erguem acima da superfície torturada do planeta são faróis de sua autoridade ilimitada. No entanto, isso não é totalmente verdade, pois existem inúmeros lugares que seus olhos sempre vigilantes não penetram, e os mais terríveis são os Ermos Profundos." },
					{ type: "p", text: "Para os Nômades dos Ermos de Cinzas e outros que, por qualquer motivo, preferem existir longe das colmeias, a extensão do poder da Casa Imperial é medida em um sentido muito prático. Se uma pessoa de pé nos ermos pode ver as luzes distantes, envoltas em nuvens, da torre superior de uma colmeia, ela está sob o olhar de Lorde Helmawr. Se, no entanto, eles viajarem tão fundo nos ermos que nenhuma colmeia é visível em qualquer direção, então eles estão nos Ermos Profundos, e eles próprios, e não Lorde Helmawr, são os mestres." },
					{ type: "p", text: "O que acontece nos Ermos Profundos muitas vezes é conhecido apenas por boatos, mas certamente eles são o refúgio dos Nômades dos Ermos de Cinzas e outros seres ainda mais terríveis do que eles." },
				],
			},
			{
				id: "comercio-e-transporte",
				title: "Comércio e Transporte",
				blocks: [
					{ type: "p", text: "Apesar dos perigos dos ermos, as extensões entre as colmeias continuam vitais para o comércio. Todo o comércio flui de e para a Colmeia Primus, e todas as estradas em Necromunda levam ao Aglomerado Palatino. Há muito tempo, Necromunda era circundada por grandes artérias de transporte, estradas, trilhos e túneis que se estendiam em círculos cada vez maiores a partir de suas cidades. Essas vias de trânsito conectavam o povo do planeta e permitiam que as mercadorias se movessem rapidamente da fábrica para a cidade e para a galáxia mais ampla. As maiores dessas estradas, como as que circundavam o mundo inteiro, foram cortadas através de montanhas, oceanos e todos os outros obstáculos naturais por enormes brocas de fusão, fazendo-as correr verdadeiramente retas por milhares e milhares de quilômetros. A guerra, o colapso ambiental e a negligência reduziram essas redes a uma sombra de sua antiga glória. Onde antes milhares de estradas conectavam as cidades, agora apenas um punhado de rodovias permanece. Isso é agravado pela vontade da Casa Imperial, que só permite viagens fora do mundo através do Olho de Selene e, por extensão, da Colmeia Primus. Muitas mercadorias vitais para as cotas de produção astronômicas do planeta chegam à Colmeia Primus através dos sistemas de tubos sobreviventes e seus trens maglev, enquanto mercadorias compactas de luxo são geralmente transportadas entre colmeias por estratoplanos, de torre em torre perfurando as nuvens, sem descer abaixo do nível das nuvens. O resto, no entanto, deve viajar por terra em enormes comboios — enfrentando os ermos e os muitos perigos que eles representam." },
					{ type: "p", text: "É da alçada do Mercator Gelt, ou Guilda da Moeda, operar e manter seus comboios, muitas vezes com a ajuda das Casas Clãs, das quais dependem para proteção. Algumas das cargas mais valiosas podem até receber a proteção dos Executores Palanitas de Lorde Helmawr, embora tal seja o volume de mercadorias sendo transportadas, os Executores só podem supervisionar uma pequena porcentagem disso. Tão importante quanto proteger os comboios e sua carga é manter as rotas comerciais abertas. Alguns trechos dos ermos ainda podem ser atravessados usando os antigos sistemas rodoviários, mas existem lacunas significativas. Onde uma rodovia caiu na terra ou foi destruída por tempestades constantes, novas rotas devem ser encontradas e sempre há um bom dinheiro para gangues que podem mapeá-las e proteger os transportadores que as usam." },
					{ type: "img", src: "trade", alt: "Caravanas guildeiras cruzam os ermos entre as colmeias" },
				],
			},
		],
	},
	{
		id: "casas",
		num: "05",
		title: "As Casas de Necromunda",
		accent: "toxic",
		sections: [
			{
				id: "as-casas-de-necromunda",
				title: "As Casas de Necromunda",
				blocks: [
					{ type: "img", src: "houses", alt: "As Casas de Necromunda disputam poder, tributo e território" },
					{ type: "p", text: "Necromunda é governada por um pequeno número de facções de entidades incrivelmente ricas e poderosas conhecidas como Casas Nobres. Elas são principalmente investidoras, que não produzem nada e não fornecem nenhum serviço. Subordinadas a estas estão as Casas Clãs, que mantêm a vasta base manufatureira de Necromunda. Cada Casa tem suas próprias tradições culturais, traços linguísticos distintos, códigos de vestimenta e comportamento, bem como preocupações e aptidões únicas. Embora distintas e frequentemente antagônicas umas com as outras, as Casas também são interdependentes para o fornecimento de itens ou serviços específicos e raros." },
				],
			},
			{
				id: "as-casas-nobres",
				title: "As Casas Nobres",
				blocks: [
					{ type: "img", src: "noble-houses", alt: "As Casas Nobres — a aristocracia da Agulha" },
					{ type: "p", text: "Para o universo em geral, Lorde Helmawr é Necromunda e o planeta é dele para governar como bem entender. Os patriarcas e as famílias mercantes das Casas Nobres competem por sua atenção e estão ansiosos para fazer todos os favores necessários para garantir direitos de pouso e transporte, licenças comerciais e concessões de dízimo. Mesmo enquanto cortejam o favor de Lorde Helmawr, as Casas Nobres conspiram pelas suas costas, na esperança de que um dia a Casa Helmawr seja derrubada e uma nova Casa Imperial herde seu domínio. As sete Casas Nobres de Necromunda são Casa Helmawr, Casa Catallus, Casa Ty, Casa Ulanti, Casa Greim, Casa Ran Lo e Casa Ko'iron. Entre elas, essas Casas governam Necromunda e são ricas o suficiente para ter interesses fora do mundo. Na verdade, enquanto as Casas Nobres derivam sua riqueza do comércio de Necromunda, seus membros mais importantes e de mais alta patente passam o mínimo de tempo possível lá, preferindo passar seus períodos de vida artificialmente estendidos sob árvores exóticas em mundos distantes, onde a escória das cidades colmeia nunca pode se intrometer." },
				],
			},
			{
				id: "executores-palanitas",
				title: "Executores Palanitas",
				kind: "callout",
				blocks: [
					{ type: "img", src: "enforcers", alt: "Executores Palanitas — a lei de Lorde Helmawr" },
					{ type: "quote", text: "Os Executores Palanitas são o punho de ferro da Casa Helmawr. Em todo o mundo de Necromunda, eles mantêm a Pax Helmawr, ou a Paz do Lorde Helmawr, por meio da intimidação e da violência. Suas Fortalezas-Prefeituras podem ser encontradas em todos os níveis da Cidade Colmeia, espalhadas pelos níveis superiores da sub-colmeia e até mesmo nos vastos ermos de cinzas. Equipados com as melhores armas e equipamentos de guerra que o Lorde de Necromunda pode fornecer, os Executores são mais do que páreo para a maioria das gangues da sub-colmeia — os espertalhões sabendo que, quando você vê as formas blindadas escuras dos Palanitas chegando, você corre para o outro lado. E não há falta de criminosos e reincidentes para os Executores caçarem, já que Necromunda nunca está a mais do que alguns ciclos ruins de uma rebelião aberta ou apocalipse canibal." },
				],
			},
			{
				id: "as-casas-clas",
				title: "As Casas Clãs",
				blocks: [
					{ type: "img", src: "clan-houses", alt: "As Casas Clãs, senhoras das cidades colmeia" },
					{ type: "p", text: "Inferiores na ordem feudal estão as Casas Clãs. Muitas dessas Casas existem em Necromunda, as seis mais poderosas quase rivalizando com as Casas Nobres em riqueza, embora nenhuma tenha (ou tenha permissão para ter) interesses fora do mundo. A maioria das cidades colmeia de Necromunda abriga pelo menos uma pequena presença de todas as seis Casas Clãs, mas em algumas colmeias, uma ou mais das seis Casas estão totalmente ausentes ou, inversamente, uma domina. É apenas na Colmeia Primus que existe um equilíbrio entre as seis, uma política deliberada promulgada há muito tempo por Lorde Helmawr." },
					{ type: "p", text: "As Casas Clãs não têm os privilégios e o status das Casas Nobres. Seu povo está confinado às camadas principais apertadas da colmeia, onde as condições são miseráveis e sujas. Os moradores da colmeia, como são chamados, estão acostumados com a luz fraca e o ar fétido. Sem conhecer nada melhor, a maioria vive vidas contentes de labuta nas fábricas da guilda, oficinas e outras indústrias que formam o principal negócio da colmeia. As Casas são fabricantes de bens de todos os tipos, de alimentos a armamentos. Esses produtos são comercializados uns com os outros e com as Casas Nobres e, dessa forma, as mercadorias de Necromunda chegam ao universo mais amplo. Uma relação comercial complexa, mas eficiente, cresceu em torno da competição entre as Casas Clãs para produzir bens e entre as Casas Nobres para comprá-los." },
					{ type: "p", text: "Apesar da competição entre as Casas, muitas dependem de uma ou mais, barganhando o fornecimento de algum produto ou serviço vital, sem o qual elas poderiam não existir. Como acontece com tantas coisas em Necromunda, esta é uma estratégia deliberada imposta pelos mais altos níveis de autoridade, a fim de manter o controle das Casas Nobres sobre a vasta riqueza de Necromunda." },
					{ type: "p", text: "O povo das seis Casas normalmente não se misturam, e as fronteiras entre seus domínios são cuidadosamente guardadas contra intrusos. Cada Casa se orgulha de suas tradições únicas e desdenha o modo de vida de seus rivais. Onde os territórios de duas Casas fazem fronteira um com o outro, é comum encontrar uma zona morta intermediária ou área de fortificações. Guerras prolongadas entre Casas são raras, mas não desconhecidas, questões de honra sendo resolvidas por procuração através de guerras de gangues, em vez de conflitos em grande escala entre as forças das Casas. A violência pode ser desencadeada por qualquer coisa, desde invasão acidental a invasão deliberada. A causa mais comum de animosidade é a luta contratada. Isso acontece quando uma Casa tenta destruir fábricas ou infraestruturas vitais no domínio de um vizinho, a fim de tornar impossível para eles cumprir um contrato. Se isso acontecer, o vizinho incorrerá em pesadas penalidades e poderá perder um contrato lucrativo para uma Casa rival. A hostilidade aberta é rara. Por um lado, a guerra entre duas Casas simplesmente promoveria os interesses das outras e não faria bem a nenhum dos antagonistas. Além disso, as Casas Nobres desaprovam fortemente os conflitos destrutivos porque prejudicam o comércio e dificultam a movimentação de mercadorias e podem ameaçar levar seus negócios para outro lugar, em vez de tolerar uma guerra de colmeias. Consequentemente, cada cidade colmeia é principalmente ordenada e trabalhadora, e a maioria de seu povo se contenta em trabalhar para sua Casa e colher as magras recompensas oferecidas." },
					{ type: "p", text: "As seis Casas Clãs preeminentes são Casa Cawdor, Casa Escher, Casa Goliath, Casa Van Saar, Casa Orlock e Casa Delaque. Muitos clãs menores existem nas colmeias de Necromunda, mas nenhum é tão poderoso quanto esses seis. Muitos são, na verdade, súditos feudais de uma Casa, mas outros podem ser párias ou peregrinos. Cada uma das Casas Clãs é mestre de inúmeras gangues subservientes, os lutadores servindo como soldados de infantaria descartáveis nas intermináveis guerras por procuração travadas na escuridão das sub-colmeias, permitindo que as Casas Clãs continuem seus negócios umas com as outras com uma aparência de civilidade nas torres acima." },
					{ type: "img", src: "clan-houses-2", alt: "Gangues das Casas Clãs em guerra pelo Underhive" },
				],
			},
			{
				id: "casa-cawdor",
				title: "Casa Cawdor",
				color: "#ffc23d",
				blocks: [
					{ type: "img", src: "cawdor", alt: "Casa Cawdor — a fé fanática do Culto Redentor" },
					{ type: "p", text: "A Casa Cawdor é o reduto do Culto da Redenção, cujos profetas predizem a destruição universal. Embora o culto tenha seus adeptos em toda Necromunda, na Casa Cawdor ele atingiu o status de religião oficial. Por esta razão, a Casa também é conhecida como a Casa da Redenção." },
					{ type: "p", text: "A atitude de Cawdor em relação às outras Casas Clãs é fortemente influenciada por suas crenças. Entre outras coisas, isso os proíbe de mostrar seus rostos em público, então Cawdor pode ser reconhecido por suas máscaras elaboradas, cujos designs são frequentemente bastante bizarros ou perturbadores. A Redenção exige um código de conduta rígido, e aqueles que quebram as regras são expulsos e se tornam párias. Os moradores da colmeia que não seguem a Redenção são considerados infiéis sem valor." },
					{ type: "p", text: "Desnecessário dizer que a relação entre a Casa Cawdor e as outras Casas é tensa, e frequentemente se supõe que os de Cawdor apoiam ativamente os fora-da-lei Redentores nas outras Casas." },
					{ type: "p", text: "Cawdor é uma Casa pobre, embora seus mestres existam em um estado de luxo paranoico. É de longe a mais populosa e suas massas são mantidas na linha por meio de duras devoções impostas a elas pelos pregadores da Casa. Os povos de Cawdor são catadores e recuperadores sagrados, venerando cada pedaço que reivindicam como uma relíquia e considerando o ato de reciclar como um milagre manifesto. Como tal, eles fornecem um serviço vital às outras Casas, reciclando enormes volumes de seus resíduos indesejados na busca eterna por objetos sagrados." },
					{ type: "img", src: "cawdor-2", alt: "Guerreiros Cawdor em trajes e armas improvisados" },
					{ type: "p", text: "A Casa Cawdor é governada por uma corte de nobres seniores, um dos quais — atualmente Lorde Mormaer Cawdor — possui o posto cerimonial de Thane e é considerado o primeiro entre iguais. O Thane se considera não tanto o nobre superior de uma Casa Clã, mas o principal servo do próprio Imperador em Necromunda. Isso causa um grau não pequeno de tensão com a Casa Imperial, pois Lorde Cawdor se recusa a reconhecer Lorde Helmawr como algo além de um igual, pelo menos em particular." },
				],
			},
			{
				id: "casa-delaque",
				title: "Casa Delaque",
				color: "#b07bff",
				blocks: [
					{ type: "img", src: "delaque", alt: "Casa Delaque — sombras, segredos e espionagem" },
					{ type: "p", text: "A Casa Delaque se beneficia de um entendimento especial com a Casa Imperial de Helmawr, fornecendo não apenas materiais, mas também informações aos governantes de Necromunda. Diz-se que espiões Delaque operam por toda a colmeia, observando as atividades das outras Casas. Há rumores de que alguns dos membros da família governante das Casas, e até mesmo algumas Casas Nobres, são pagos pelos Delaque." },
					{ type: "p", text: "Outras Casas suspeitam justificadamente da Casa Delaque. Sua aparência pouco faz para contradizer uma reputação ancestral de traição e espionagem. Os Delaque tradicionalmente usam casacos longos com bolsos internos nos quais podem facilmente esconder armas e outros itens. A maioria é muito pálida e careca. Suas vozes sussurrantes são finas e misteriosas, enquanto muitos usam telas de filtro implantadas para proteger seus olhos sensíveis — uma intolerância à luz sendo uma fraqueza comum dos Delaque — e diz-se que alguns podem até ser capazes de ver em espectros invisíveis para outros. Embora o interior da colmeia seja escuro para os padrões normais, o território da Casa Delaque é particularmente escuro e sombrio, como convém a um povo cujos motivos e métodos estão envoltos em mistério." },
					{ type: "p", text: "Diz-se da Casa Delaque que seus agentes utilizam os elixires mais raros e caros da Casa Escher para criar horríveis médiuns \"forçados\", permitindo-lhes ouvir os pensamentos de seus inimigos, embora a um custo terrível para suas almas eternas. Em troca, eles fornecem uma riqueza de informações para as outras Casas, embora as mais valiosas sejam sempre reservadas para a Casa Imperial de Helmawr." },
					{ type: "img", src: "delaque-2", alt: "Agentes Delaque emergem da escuridão" },
					{ type: "p", text: "Os meios e mecanismos pelos quais a Casa Delaque é ordenada e administrada estão longe de serem claros, mesmo para a população da própria Casa. Sabe-se que os nobres mais antigos da Casa se reúnem em sessão fechada, o local e o próprio corpo conhecido como Câmara Estelar. Este tribunal parece não ter uma cadeira permanente, o que significa que, a qualquer momento, uma das dezenas de nobres seniores Delaque pode estar servindo como governante da Casa, sendo o nome e a identidade do governante real deliberadamente ocultos." },
				],
			},
			{
				id: "casa-escher",
				title: "Casa Escher",
				color: "#ff2d6f",
				blocks: [
					{ type: "img", src: "escher", alt: "Casa Escher — lâminas, venenos e velocidade letal" },
					{ type: "p", text: "A Casa Escher é talvez a mais notavelmente diferente de todas as Casas Clãs de Necromunda. Como todas as Casas, ela é controlada por uma família governante, e sua vida política e instituições são dominadas por parentes próximos ou famílias a serviço. No entanto, ao contrário das outras Casas, que têm populações razoavelmente equilibradas, a de Escher é composta quase inteiramente por mulheres." },
					{ type: "p", text: "Ela produz uma gama impressionante de produtos farmacêuticos exóticos, de elixires que aprimoram genes a drogas de luxo, e deriva sua riqueza do fornecimento destes para as outras Casas, mantendo assim o equilíbrio vital de poder entre elas. É a Casa Escher que fornece os hormônios de crescimento que mantêm os trabalhadores da Casa Goliath tão grandes e fortes, e são seus equipamentos de purificação radioativa que alimentam os sistemas de suporte de vida dos quais a Casa Van Saar depende. Em troca, a Casa Escher recebe não apenas riqueza monetária, mas também uma ampla gama de material biológico bruto — bestas xenos e similares — a partir do qual criam formas de vida únicas e bizarras como animais de estimação para si e para os nobres que habitam as torres." },
					{ type: "p", text: "São os muitos milênios de exposição a processos alquímicos tão potentes que alteraram a população da Casa Escher, com o cromossomo Y danificado além de qualquer reparo. Quase sem exceção, os homens da Casa Escher são doentios e têm vida curta, e a reprodução só é possível pelo processo mais misterioso de partenogênese induzida quimicamente." },
					{ type: "p", text: "A sociedade Escher há muito se desenvolveu para lidar com sua população singularmente desequilibrada, de modo que não é mais percebida como uma desvantagem. As Escher têm uma reputação de arrogância e dizem que desprezam e têm pena de todos os homens. Elas são particularmente desdenhosas dos Goliaths como simples e brutais, e, portanto, as duas Casas são inimigas antigas e escaramuças ao longo de suas fronteiras são comuns." },
					{ type: "img", src: "escher-2", alt: "Uma gangue Escher patrulha seu território" },
					{ type: "p", text: "A Casa Escher é governada por uma corte de nobres, à frente da qual está a matriarca primus — atualmente a Rainha Adina Sabine. Uma governante jovem que só recentemente chegou ao seu título, Adina foi, no entanto, criada para a posição e preparada para ela desde o dia de seu nascimento. Nos primeiros dias de seu reinado, a Rainha Adina teve que lidar com uma grande incursão nas propriedades industriais da Casa Escher que fazem fronteira com as da Casa Goliath, a Casa Clã rival com a intenção de desestabilizar seu governo não comprovado. Adina provou ser uma líder nata, no entanto, habilmente pressionando a Casa Imperial para obter permissão para lançar uma contra-incursão no território da Casa Goliath e encerrar a crise em pouco tempo." },
				],
			},
			{
				id: "a-casa-perdida",
				title: "A Casa Perdida",
				kind: "callout",
				blocks: [
					{ type: "img", src: "lost-house", alt: "A Casa Perdida — apagada dos registros de Necromunda" },
					{ type: "quote", text: "Quase todas as Casas Clãs têm mitos e lendas relativos à sua fundação ou sua ascensão ao domínio. Algumas afirmam ser as habitantes originais de Necromunda (e, portanto, a Casa mais antiga), enquanto outras compartilham vários mitos sobre sua chegada ao planeta, sua fundação por um indivíduo particularmente poderoso ou sua emergência de outras hierarquias há muito esquecidas. Não há dúvida de que as Casas surgiram, ascenderam e caíram ao longo dos séculos, embora qualquer um que afirme conhecer a verdadeira natureza de tais evoluções dinásticas seja mentiroso ou um tolo confiante demais." },
					{ type: "quote", text: "A Casa Aranthus, por exemplo, outrora governou Necromunda, mas desapareceu completamente há vários séculos, quando uma praga imparável varreu sua população e dizimou seus números. Os sobreviventes lutaram, mas logo se viram tão vulneráveis a ataques de todos os tipos e com tão poucos recursos que a espiral de dívidas levou à dissolução de todos os seus territórios e bens pelo próprio Lorde Helmawr. Os poucos Aranthus restantes se dispersaram pelas colmeias ou foram absorvidos por outras Casas por meio de casamento, santuário ou servidão. Nos séculos após sua morte, a Casa Aranthus entrou na lenda e ficou conhecida como a Casa Perdida." },
					{ type: "quote", text: "Desde então, tornou-se moda para os indivíduos reivindicar linhagem da Casa, muitos vendo isso como um símbolo de singularidade e distinção. A reivindicação é particularmente popular entre caçadores de recompensas e membros das Casas Nobres, muitos dos quais se aventuram nos antigos redutos da Casa Aranthus em busca de restos lendários do passado, procurando por algum meio de restaurar seu status há muito perdido como uma Casa Clã de Necromunda.\\" },
				],
			},
			{
				id: "casa-goliath",
				title: "Casa Goliath",
				color: "#ff8a3d",
				blocks: [
					{ type: "img", src: "goliath", alt: "Casa Goliath — força bruta forjada nos vats" },
					{ type: "p", text: "A Casa Goliath possui e opera muitas das grandes fundições de Necromunda e seus trabalhadores são os mestres da fornalha e do metal, cujas matérias-primas são comercializadas das minas da Casa Orlock. A Casa não valoriza nada mais do que a força física e, para esse fim, cria seus trabalhadores como gado premiado, em um esforço para criar os trabalhadores de fornalha mais fortes, resistentes e irrefletidamente leais da galáxia. O núcleo desses trabalhadores são brutos enormes — incrivelmente fortes e resistentes, mas muitas vezes mentalmente desequilibrados e com vida extremamente curta. Os operadores de fornalha da Casa Goliath são frequentemente maiores do que um Fuzileiro Espacial e alguns os consideram uma linhagem classificável de abumanos." },
					{ type: "p", text: "Os súditos da Casa Goliath consideram os moradores das colmeias de outras Casas como fracos e frouxos. Na verdade, todos os moradores das colmeias são naturalmente robustos, estando acostumados às toxinas e privações que aceitam sem questionar como parte da vida normal. Os Goliath, no entanto, têm um orgulho teimoso em sua capacidade geneticamente criada de suportar dificuldades. As outras Casas veem os Goliath como bárbaros, pouco sofisticados e imprevisíveis. As instituições Goliath, como as arenas de luta e a Festa dos Caídos, não fazem nada para dissipar a impressão de um povo violento hostil aos seus vizinhos." },
					{ type: "p", text: "Tamanho e força são vistos como a medida de um homem entre os Goliath. Seu estilo de vestir enfatiza uma preocupação com o físico, apresentando correntes pesadas e enormes braçadeiras de metal com pontas, a maioria derivada de roupas de trabalho industriais pesadas. É irônico, portanto, que os brutos de Goliath sejam inteiramente dependentes de estimulantes de crescimento fornecidos por seus arquirrivais, os odiados Eschers, para atingir e manter seus quadros prodigiosos." },
					{ type: "img", src: "goliath-2", alt: "Um brutamontes Goliath pronto para a briga" },
					{ type: "p", text: "De todas as Casas Clãs de Necromunda, a Casa Goliath pode ser interpretada literalmente na afirmação de seus membros de que \"poder iguala direito\". A posição de chefe da Casa Goliath — chamado de \"Super Tirano\" — foi ocupada por muitos milhares de indivíduos ao longo dos milênios, cada um conquistando sua posição em combate antes de eventualmente perdê-la da mesma maneira. O atual Super Tirano da Casa Goliath é Varran Gor, chamado de \"Gor Olho de Ferro\", que matou seu predecessor em combate ritual durante um grande banquete no qual o próprio Lorde Helmawr estava presente. Diz-se que o Lorde de Necromunda mal levantou uma sobrancelha para o espetáculo, aceitando a troca de poder inteiramente como se nada fora do comum tivesse ocorrido." },
				],
			},
			{
				id: "casa-orlock",
				title: "Casa Orlock",
				color: "#59e36b",
				blocks: [
					{ type: "img", src: "orlock", alt: "Casa Orlock — a Casa de Ferro, senhora das estradas" },
					{ type: "p", text: "A Casa Orlock é conhecida como a Casa de Ferro porque suas fundações estão sobre profundas covas de escória ferrosa localizadas na superfície destruída de Necromunda. A Casa extrai dessas covas os detritos de tempos antigos e extrai metal puro suficiente dos resíduos para servir às suas indústrias. Os prêmios que eles arrastam da crosta irradiada são enviados pela superfície em vastos comboios de minério para processamento nas colmeias antes de serem transportados para as fábricas ou mesmo para fora do mundo. Orlock não apenas controla as minas, mas também as linhas de transporte e rotas terrestres mais vitais entre elas, e é famosa por seus batedores resistentes e destemidos que defendem os comboios de Nômades dos Ermos de Cinzas e agentes de Casas rivais. Os membros de gangues são os sortudos, no entanto, pois a maior parte dos súditos da Casa são pouco mais do que servos resignados a uma vida de labuta nas minas e refinarias." },
					{ type: "p", text: "Ao longo dos séculos, a mineração extensiva da escória fez com que algumas áreas desabassem. No passado, isso levou a tremores de cinzas e tremores de colmeias e à destruição de várias colmeias sobrepostas. Durante esse tempo, a Casa cumpriu o Contrato Ulanti, um acordo lucrativo pelo qual uma Casa fornece os requisitos básicos da Casa Nobre Ulanti. Anteriormente, o contrato era fornecido pela Casa Delaque, mas os Orlocks usurparam a posição subornando invasores de gangues da sub-colmeia para destruir as linhas de combustível de uma fábrica da guilda Delaque. Desde então, as duas Casas aproveitaram todas as oportunidades para se desacreditarem. Cinco anos atrás, Lorde Hagen Orlock foi assassinado pelos Delaque e as relações entre as Casas nunca foram tão tensas." },
					{ type: "img", src: "orlock-2", alt: "Motoqueiros Orlock nas rotas de minério" },
					{ type: "p", text: "A Casa Orlock é controlada por uma aliança frouxa de inúmeras famílias ligadas por pacto, suborno, casamento e assassinato, com cada uma dominando o máximo de recursos da Casa que seu tamanho permite e dividindo-os entre seus próprios membros como desejam. Lorde Morrow Orlock continua sendo o chefe permanente da Casa, embora, na maioria dos aspectos, a Casa Orlock seja obrigada a seguir a vontade da maior família. Surpreendentemente, a Casa Orlock continua sendo uma das Casas mais unidas e disciplinadas da colmeia, com seu sistema de liderança aparentemente dividido experimentando notavelmente poucas cisões." },
				],
			},
			{
				id: "casa-van-saar",
				title: "Casa Van Saar",
				color: "#00e5ff",
				blocks: [
					{ type: "img", src: "vansaar", alt: "Casa Van Saar — tecnologia arcaica e precisão cirúrgica" },
					{ type: "p", text: "Os Van Saar têm a reputação de serem pessoas sérias e sem humor, com um senso de ordem profundamente enraizado. A Casa Van Saar produz componentes tecnológicos básicos de função quase mítica e é a partir do fornecimento destes que se tornou excepcionalmente rica. No entanto, a Casa Van Saar guarda um segredo obscuro — sua tecnologia é derivada de uma fonte secreta que está lentamente envenenando seus súditos, um sistema corrompido de Construção de Modelo Padrão cujos frutos são abundantes, mas envenenados. Os Van Saars, portanto, são forçados a usar trajes de proteção para evitar os efeitos de suas próprias tecnologias, seu sangue irradiado continuamente filtrado pelos mecanismos. Sem seus trajes de proteção para sustentá-los, os Van Saars adoecem rapidamente e é a mais amarga das piadas que, embora fabriquem e carreguem os melhores equipamentos, sua fonte os está matando lentamente. Apesar disso, eles são totalmente dedicados à sua Casa, determinados a sobreviver mesmo que eles próprios não sobrevivam." },
					{ type: "p", text: "As Casas Nobres pagam um prêmio por bens Van Saar e, como resultado, a Casa é provavelmente a mais rica da Colmeia Primus e de muitas outras colmeias. Como acontece com todas as Casas, eles dependem de outras para bens e serviços que eles próprios não podem originar, em particular, a Casa Escher que fornecem os purificadores radioativos que os mantêm vivos em troca de elementos-chave dos processos de partenogênese que os Escher usam para manter sua população. Além disso, a Casa Van Saar fornece equipamentos de sensores e comunicação altamente avançados para a Casa Delaque, bem como dispositivos de navegação para a Casa Orlock." },
					{ type: "img", src: "vansaar-2", alt: "Guerreiros Van Saar e seu arsenal avançado" },
					{ type: "p", text: "A Casa Van Saar é organizada de acordo com um sistema estritamente definido de classificação feudal, com as famílias mais antigas e privilegiadas formando um círculo interno com acesso às impressões de Construção de Modelo Padrão (CMP) mais avançadas e, portanto, mais perigosas. As famílias de classificação inferior têm acesso apenas aos produtos menores do CMP que sustenta a Casa. Como resultado, os descendentes das famílias do círculo interno são os mais doentes da população, seus corpos sustentados pela aplicação contínua dos purificadores mais raros. O governante da Casa é o Duque Otto Van Saar XXII, um homem tão pálido como a morte e murcho como um cadáver, mas tão perigoso quanto o mais experiente caçador de recompensas da sub-colmeia." },
				],
			},
			{
				id: "a-guilda-dos-mercadores",
				title: "A Guilda dos Mercadores",
				blocks: [
					{ type: "p", text: "A Guilda dos Mercadores compõe os fios tênues que unem as Casas de Necromunda. Dentro das colmeias e através dos ermos, eles são as conexões ao longo das quais todo o comércio flui e todos os juramentos de moeda são feitos. Ao contrário dos Clãs e das Casas Nobres, a Guilda dos Mercadores não tomou seu poder por direito hereditário ou força das armas — na verdade, eles não tomaram o poder. Ao longo dos séculos, eles reivindicaram os espaços deixados entre as Casas Nobres e seus vassalos, intermediando acordos entre clãs que não se falam ou garantindo que o comércio flua sem problemas, mesmo quando a guerra de gangues está destruindo uma colmeia. Com o tempo, à medida que o poder da Guilda dos Mercadores crescia, Lorde Helmawr reconheceu sua importância para Necromunda e ratificou suas reivindicações de poder, concedendo cartas a certas famílias. Essa autoridade para lidar com os recursos vitais da colmeia não se estende à propriedade da terra, e as famílias da Guilda dos Mercadores raramente têm territórios permanentes, em vez disso, viajam constantemente entre assentamentos como comerciantes nômades." },
					{ type: "p", text: "Embora os habitantes de Necromunda possam ocasionalmente se referir à Guilda dos Mercadores como uma única entidade, ela é, na verdade, composta por dezenas de sub-facções, muitas das quais são entidades poderosas por direito próprio. Para os cidadãos da colmeia, eles são a Guilda da Água, os Fazendeiros de Cadáveres ou qualquer um dos muitos outros nomes pelos quais os braços individuais da Guilda dos Mercadores são conhecidos. Muitas vezes, essas facções são simplesmente chamadas de Guilders, um termo sinônimo de comércio. Oficialmente, cada aspecto da Guilda dos Mercadores é conhecido como 'Mercator', a palavra em Alto Gótico para um conclave mercantil. Isso é combinado com o termo em Alto Gótico para sua área de domínio. Por exemplo, a Guilda dos Cadáveres, que supervisiona o processamento dos mortos de Necromunda e a criação de amido de cadáver, é oficialmente conhecida como 'Mercator Pallidus'." },
					{ type: "p", text: "O poder das Guildas individuais varia de colmeia para colmeia, muitas vezes dependendo dos recursos locais. Na sombra do Despojo, a Guilda do Ferro regula mineiros e garimpeiros. No Mar Sulfuroso é a Guilda dos Sais, enquanto nas profundezas sufocantes de Magnoformus, os Zefirmanos da Guilda do Ar exercem seu comércio. Na Colmeia Primus, existem milhares de famílias Guilder e dezenas de Guildas, embora oito detenham a maior parte do poder da Guilda dos Mercadores. Estas são a Guilda do Promethium, a Guilda da Água, a Guilda dos Cadáveres, a Guilda dos Escravos, a Guilda da Moeda, a Guilda do Eletro, a Guilda do Ferro e a Guilda do Ar. Coletivamente, elas são conhecidas no Aglomerado Palatino como as Grandes Guildas e poucos negócios são feitos dentro das muralhas da Colmeia Primus sem o conhecimento delas." },
				],
			},
			{
				id: "redes-criminosas",
				title: "Redes Criminosas",
				blocks: [
					{ type: "p", text: "Em um mundo de líderes de gangues selvagens, médiuns desonestos e caçadores de recompensas não sancionados, apenas os criminosos mais excepcionais se destacam. Como as famílias da Guilda dos Mercadores, os chefes do crime reivindicam uma região da colmeia ou um de seus recursos e, no que diz respeito aos habitantes locais, são pouco diferentes da escória sancionada que nominalmente governa sobre eles. As redes criminosas variam dependendo de sua localização dentro da colmeia. Nas alturas rarefeitas da torre, grupos clandestinos de nobres fornecem vícios ilegais aos seus companheiros perdulários. Alguns deles podem se intitular chefes do crime, embora, quando se tem o poder das Casas Nobres à sua disposição e poucas restrições às suas ações, tais títulos são em grande parte para exibição. A classificação de chefe do crime se torna mais significativa quando se desce para o coração da colmeia, onde as empresas criminosas se escondem dentro das estruturas das Casas Clãs. Gangues de ladrões e assassinos, operando sem a sanção da Guilda ou do Clã, vagam pelas ruas da maioria das cúpulas. Reunidos em torno de um pária ou ex-membro de gangue, eles visam cidadãos trabalhadores do labirinto de sombras da cúpula. Em setores maiores, essas gangues podem se reportar a um único indivíduo, embora esses homens e mulheres tomem cuidado para não chamar muita atenção, pois os Executores são rápidos em destruir quaisquer empresas criminosas que se tornem muito organizadas." },
					{ type: "p", text: "A sub-colmeia, em contraste, é um ambiente muito mais natural para o elemento criminoso. Aqui, os chefes do crime administram assentamentos inteiros, a Guilda dos Mercadores os aceitando como um mal necessário e lidando com eles, apesar de sua falta de status oficial." },
					{ type: "p", text: "Existem inúmeras empresas e redes criminosas operando nas sombras de Necromunda — embora dentro das grandes colmeias do Aglomerado Palatino algumas sejam mais organizadas do que outras. Os Comerciantes Frios garantem um fornecimento constante de contrabando para qualquer um que possa pagar seu preço, e sempre há um mercado para produtos de fora do mundo, especialmente aqueles proibidos pelo Império. Os Impostores Imperiais são falsos nobres e são bem versados nos mecanismos de poder que governam Necromunda. A ajuda de tal indivíduo pode elevar uma gangue a níveis inéditos de \"oportunidade\" — desde que não sejam pegos. A Fábrica Desonesta produz armas e equipamentos de guerra falsificados. Essas são empresas lucrativas para uma organização criminosa e têm o benefício adicional de manter seus aliados bem equipados com munições. Os Narco-Lordes são os mestres dos produtos químicos ilegais. Essas são uma mercadoria vital em Necromunda e uma empresa extremamente lucrativa para organizações criminosas, desde o topo da torre até as profundezas da sub-colmeia. A longa história de Necromunda está repleta de nobres desgraçados e Casas Caídas — declaradas fora da lei pela Casa Imperial. A maioria desapareceu na memória, embora alguns permaneçam ansiosos para recuperar sua glória perdida por qualquer meio. A Psi-Syndica comercializa médiuns desonestos. Existem poucos crimes maiores em Necromunda do que a ocultação ou o tráfico de médiuns, embora isso não os impeça de negociar com esses indivíduos poderosos." },
					{ type: "img", src: "criminal", alt: "As redes criminosas que prosperam nas frestas da colmeia" },
				],
			},
			{
				id: "parias-forasteiros-e-cultos",
				title: "Párias, Forasteiros e Cultos",
				blocks: [
					{ type: "img", src: "outcasts", alt: "Párias, forasteiros e cultos à margem da sociedade colmeia" },
					{ type: "quote", text: "Embora as Casas Nobres e Clãs possam deter a riqueza e o poder em Necromunda, seus membros são apenas uma pequena parte da vasta população do mundo colmeia. Perdidos nas fendas sociais entre essas poderosas instituições estão os párias e os forasteiros. Os párias vêm em uma variedade estonteante de formas e tamanhos, de membros de clãs exilados e escória nascida no sumidouro a reuniões estranhas e grupos de mutantes. A única coisa que eles têm em comum é que existem fora das estruturas oficiais da sociedade necromundana — a maioria simplesmente tentando sobreviver a mais um ciclo no inferno sem lei da sub-colmeia ou nos impiedosos ermos de cinzas." },
					{ type: "quote", text: "Muito mais insidiosos do que os párias são os cultos de Necromunda. Essas são almas que dedicaram suas vidas ao serviço de um mestre xenos ou poder sombrio. Os mais comuns são os Cultos Genestealer e Helot, seguindo senhores xenos e horrores nascidos na warp, respectivamente. Quase todas as colmeias em Necromunda lidaram com pelo menos uma dessas ameaças — a primeira, gerada das ruínas de Secundus, enquanto a última apodrece nas profundezas da sub-colmeia, longe da luz do Deus-Imperador. Talvez mais aterrorizantes do que ambos, sejam os Cultos Moedores de Cadáveres. Fermentados nas fábricas de amido de cadáveres das colmeias, eles se voltam para a adoração do Senhor da Pele e dos Tendões e para a canibalização de seus companheiros moradores da colmeia. Se não for controlado, um levante do Culto Moedor de Cadáveres pode significar a ruína de uma colmeia, à medida que a influência do Caos infecta seus habitantes e eles se voltam uns contra os outros em uma orgia de violência." },
				],
			},
			{
				id: "nomades-dos-ermos-de-cinzas",
				title: "Nômades dos Ermos de Cinzas",
				blocks: [
					{ type: "img", src: "nomads", alt: "Nômades dos Ermos de Cinzas" },
					{ type: "p", text: "Poucas coisas nos ermos aterrorizam mais os viajantes do que a perspectiva de encontrar uma das tribos Nômades dos Ermos de Cinzas. Para o povo de Necromunda, eles são tão alienígenas e perturbadores quanto qualquer espécie xenos conhecida. Aos olhos de um morador da colmeia, eles parecem divorciados da humanidade e, embora possam parecer homens, não há dúvida de que sua cultura, e talvez sua própria biologia, divergiu da humanidade há muito tempo. Para aqueles que não estão familiarizados com as paisagens e os povos de Necromunda, pode parecer que, ao ouvir falar dessas tribos nômades e seu lar deserto, eles devem ser pouco diferentes dos inúmeros outros errantes, mutantes, catadores e escravos que foram forçados a existir além do abraço protetor das cidades colmeia. A diferença entre os dois, no entanto, é tão gritante quanto a diferença entre civilização e barbárie." },
					{ type: "p", text: "As origens dos Nômades dos Ermos de Cinzas estão atoladas em mitos e lendas. Contos antigos relatam como, quando os Lordes de Ferro foram derrubados pelo Império, os últimos verdadeiros cidadãos da Continuidade Araneus fugiram de seus opressores para os ermos de seu mundo agora arruinado. Alguns dizem que os nômades são descendentes dessas primeiras pessoas, atormentadas e transformadas pelo deserto nas criaturas que espreitam as selvas hoje, com o ódio do Império e seu procurador Lorde Helmawr ainda fresco em seus corações. Outros afirmam que os Nômades dos Ermos de Cinzas existiam antes mesmo da chegada do Império e eram uma classe escrava dos Lordes de Ferro, forçados a trabalhar duro nas profundezas do subsolo em minas infernais. Somente quando seus mestres foram destronados e Necromunda destruída pelo fogo, eles emergiram para tomar seu lugar de direito como governantes dos ermos de cinzas." },
				],
			},
			{
				id: "prospectores-anoes-cabeca-de-ferro",
				title: "Prospectores Anões Cabeça de Ferro",
				blocks: [
					{ type: "img", src: "squats", alt: "Prospectores anões Cabeça de Ferro nos ermos" },
					{ type: "p", text: "Os humanos não são a única raça a ter feito sua casa no mundo arruinado de Necromunda, e muitas subespécies, mutantes e até mesmo verdadeiros xenos habitam sob seus céus poluídos, embora poucos sejam talvez tão importantes para sua existência quanto os Anões. Os registros imperiais são vagos sobre as origens dessas criaturas resistentes, apenas talvez que em algum lugar no passado obscuro e distante da humanidade eles compartilhem um ancestral comum com os humanos de hoje. O que se sabe, pelo menos em Necromunda, é que os Anões chegaram a esse mundo há cerca de dez mil anos, não muito depois da Heresia de Horus, quando as cicatrizes da guerra civil que abrangeu a galáxia ainda estavam frescas na face do mundo, e muita reconstrução precisava ser feita. Para esta tarefa, os Anões eram incomparáveis em sua habilidade, sendo uma raça de engenheiros, arquitetos e artesãos. Dezenas de grandes Clãs Anões vieram para Necromunda nesta época, e não é em pequena parte devido aos seus esforços que o mundo prosperou como prosperou, embora muitos dentro das colmeias não se deem conta da dívida que têm com os Anões." },
					{ type: "p", text: "Séculos depois, os Anões, ou Anões Cabeça de Ferro, como são conhecidos pelo povo dos ermos, vivem um estilo de vida seminômade em seus grandes trens terrestres, viajando de local de mineração para local de mineração, sugando a riqueza de Necromunda para vender para as Casas Clãs. Essas vastas plataformas mecânicas de mineração são como cidades sobre trilhos, e mesmo que não possam ser vistas, o som de sua passagem estrondosa percorre quilômetros em todas as direções enquanto rastejam de uma mina para a próxima. Quando um trem terrestre chega a um local de escavação adequado, ele forma um acampamento, ou círculo de grandes veículos, e pode ficar por meses ou até anos enquanto saqueia a terra sob seus trilhos. Enquanto o acampamento está no local, grupos de prospecção se espalham em todas as direções, buscando novas descobertas e protegendo seu clã — até o momento em que o acampamento é desmontado e o trem terrestre segue para novos terrenos." },
				],
			},
		],
	},
];

/** Intrinsic dimensions of the images in /public/lore (for next/image). */
export const LORE_IMG_DIMS: Record<string, { w: number; h: number }> = {
	"ash-wastes": { w: 858, h: 636 },
	"cawdor": { w: 528, h: 659 },
	"cawdor-2": { w: 603, h: 717 },
	"clan-houses": { w: 1082, h: 1008 },
	"clan-houses-2": { w: 1600, h: 694 },
	"criminal": { w: 603, h: 339 },
	"deep-wastes": { w: 872, h: 754 },
	"delaque": { w: 568, h: 699 },
	"delaque-2": { w: 735, h: 413 },
	"destiny-bearers": { w: 924, h: 709 },
	"emperor": { w: 380, h: 481 },
	"enforcers": { w: 300, h: 300 },
	"escher": { w: 1184, h: 1278 },
	"escher-2": { w: 578, h: 638 },
	"goliath": { w: 640, h: 610 },
	"goliath-2": { w: 421, h: 497 },
	"helmawr": { w: 1600, h: 1499 },
	"psyker": { w: 425, h: 391 },
	"hive-bottom": { w: 1024, h: 1024 },
	"hive-secundus": { w: 649, h: 466 },
	"hive-worlds": { w: 892, h: 724 },
	"houses": { w: 928, h: 759 },
	"imperium": { w: 1024, h: 1024 },
	"intro": { w: 1284, h: 963 },
	"lost-house": { w: 412, h: 368 },
	"necromunda-city": { w: 650, h: 928 },
	"necromunda-hive": { w: 1467, h: 818 },
	"necromunda-planet": { w: 500, h: 500 },
	"noble-houses": { w: 464, h: 538 },
	"nomads": { w: 1126, h: 636 },
	"orlock": { w: 597, h: 663 },
	"orlock-2": { w: 300, h: 300 },
	"outcasts": { w: 674, h: 442 },
	"squats": { w: 1150, h: 1204 },
	"trade": { w: 422, h: 533 },
	"underhive": { w: 1600, h: 1114 },
	"vansaar": { w: 651, h: 587 },
	"vansaar-2": { w: 804, h: 857 },
};
