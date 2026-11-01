/** A word the hero retypes in turn: `{systems|apps|platforms}` in the Studio. */
export type TaglineSlot = { slot: number; options: string[] };
export type TaglinePiece = string | TaglineSlot;
/** A stretch of the tagline that is either lit (`*…*`) or plain. */
export type TaglineRun = { lit: boolean; pieces: TaglinePiece[] };

/**
 * Splits the hero tagline as written in the Studio: `*words*` light up and
 * `{a|b|c}` is a slot the hero retypes, numbered left to right. A slot with a
 * single option is plain text, and an unpaired `{` stays as typed.
 */
export function parseTagline(source: string): TaglineRun[] {
  const runs: TaglineRun[] = [{ lit: false, pieces: [] }];
  let slot = 0;
  for (const [token, inner] of source.matchAll(/\*|\{([^{}]*)\}|[^*{]+|\{/g)) {
    const run = runs[runs.length - 1] as TaglineRun;
    if (token === '*') {
      runs.push({ lit: !run.lit, pieces: [] });
      continue;
    }
    if (inner === undefined) {
      run.pieces.push(token);
      continue;
    }
    const options = inner
      .split('|')
      .map((option) => option.trim())
      .filter(Boolean);
    run.pieces.push(options.length > 1 ? { slot: slot++, options } : (options[0] ?? ''));
  }
  return runs.filter((run) => run.pieces.length > 0);
}

/** The tagline as one plain sentence, each slot showing its first option. */
export const taglineText = (runs: TaglineRun[]) =>
  runs
    .flatMap((run) => run.pieces)
    .map((piece) => (typeof piece === 'string' ? piece : piece.options[0]))
    .join('');
