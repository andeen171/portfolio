/**
 * Skill rarity — maps the Sanity `proficiency` field onto trading-card rarity
 * tiers, borrowing the visual language of pokemon-cards-css and the OCG Secret
 * Rare effect.
 *
 * Skills with no `proficiency` set get no tier at all: the card renders in its
 * plain form. The published dataset has been fully patched with `proficiency`,
 * so this is a defensive default for future/draft documents rather than the
 * common case — keep "no tier" visually calm either way.
 */

export type Proficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Visual tiers, ordered from least to most eye-catching.
 *
 * - `uncommon` — a flare/glare that only shows on hover.
 * - `holo`     — rainbow + scanline holo, the classic Ultra Rare look.
 * - `radiant`  — the diagonal holographic banding of a Pokémon V card.
 * - `secret`   — OCG Secret Rare, applied to the whole card.
 */
export type RarityTier = 'uncommon' | 'holo' | 'radiant' | 'secret';

const TIER_BY_PROFICIENCY: Record<Proficiency, RarityTier> = {
  beginner: 'uncommon',
  intermediate: 'holo',
  advanced: 'radiant',
  expert: 'secret',
};

/** Resolves a skill's rarity tier, or `undefined` when proficiency is unset. */
export function rarityTier(proficiency?: string | null): RarityTier | undefined {
  if (!proficiency) return undefined;
  return TIER_BY_PROFICIENCY[proficiency as Proficiency];
}

/**
 * Whether a tier's treatment covers the entire card rather than just the icon
 * window. Only Secret Rare goes card-wide — that's what makes it read as the
 * top of the ladder.
 */
export function isCardWideTier(tier?: RarityTier): boolean {
  return tier === 'secret';
}
