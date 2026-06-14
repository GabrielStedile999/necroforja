/**
 * Divisão de texto de regras em chunks para embedding (RAG).
 * Função pura e testável — sem I/O nem dependências externas.
 * Estratégia: separa por cabeçalhos Markdown e agrupa parágrafos até ~maxChars,
 * preservando o cabeçalho como contexto de cada chunk.
 */
export interface RuleChunk {
  source: string;
  heading: string;
  content: string;
}

interface Section {
  heading: string;
  body: string[];
}

export function chunkMarkdown(
  text: string,
  source: string,
  opts: { maxChars?: number } = {},
): RuleChunk[] {
  const maxChars = opts.maxChars ?? 1200;
  const lines = text.split(/\r?\n/);

  const sections: Section[] = [];
  let current: Section = { heading: "", body: [] };

  for (const line of lines) {
    const h = /^#{1,6}\s+(.*)$/.exec(line);
    if (h) {
      if (current.heading || current.body.some((l) => l.trim())) {
        sections.push(current);
      }
      current = { heading: (h[1] ?? "").trim(), body: [] };
    } else {
      current.body.push(line);
    }
  }
  if (current.heading || current.body.some((l) => l.trim())) {
    sections.push(current);
  }

  const chunks: RuleChunk[] = [];

  for (const section of sections) {
    const paragraphs = section.body
      .join("\n")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    let buffer = "";
    const flush = () => {
      if (buffer.trim()) {
        chunks.push({
          source,
          heading: section.heading,
          content: buffer.trim(),
        });
      }
      buffer = "";
    };

    for (const paragraph of paragraphs) {
      if (buffer && buffer.length + paragraph.length + 2 > maxChars) flush();
      buffer += (buffer ? "\n\n" : "") + paragraph;
      if (buffer.length >= maxChars) flush();
    }
    flush();
  }

  return chunks;
}

/**
 * Quebra texto em "blocos" semânticos: por linha em branco e, principalmente,
 * antes de verbetes/cabeçalhos em MAIÚSCULAS (ex.: "WEB ...", "TOXIN ...",
 * "GANG RATING ..."). Isola cada regra/trait, evitando chunks com vários temas.
 */
function splitBlocks(text: string): string[] {
  // Boundary (zero-width) após fim de frase, antes de um cabeçalho MAIÚSCULO
  // (palavra com 3+ letras) seguido de palavra capitalizada normal.
  const headword =
    /(?<=[.!?])(?=\s+[A-ZÀ-Ý][A-ZÀ-Ý'’]{2,}(?:\s+[A-ZÀ-Ý'’]{2,})*\s+[A-ZÀ-Ý][a-zà-ý])/;

  const blocks: string[] = [];
  for (const segment of text.split(headword)) {
    for (const para of segment.split(/\n\s*\n/)) {
      const t = para.trim();
      if (t) blocks.push(t);
    }
  }
  return blocks.length ? blocks : [text.trim()];
}

function sentencePack(block: string, maxChars: number): string[] {
  const sentences = block.match(/[^.!?]+[.!?]*\s*/g) ?? [block];
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if (buf && buf.length + s.length > maxChars) {
      out.push(buf.trim());
      buf = "";
    }
    buf += s;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

/**
 * Divide um texto plano (ex.: uma página de livro) em pedaços de até ~maxChars,
 * priorizando limites de verbete (cabeçalhos MAIÚSCULOS) para manter cada
 * regra focada. Retorna apenas strings.
 */
export function chunkPlain(text: string, maxChars = 700): string[] {
  const blocks = splitBlocks(text);
  const chunks: string[] = [];
  let buffer = "";

  const flush = () => {
    if (buffer.trim()) chunks.push(buffer.trim());
    buffer = "";
  };

  for (const block of blocks) {
    if (block.length > maxChars) {
      flush();
      for (const piece of sentencePack(block, maxChars)) chunks.push(piece);
      continue;
    }
    if (buffer && buffer.length + block.length + 1 > maxChars) flush();
    buffer += (buffer ? " " : "") + block;
  }
  flush();

  return chunks.filter((c) => c.length > 0);
}
