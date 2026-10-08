/**
 * Skill rarity — maps the Sanity `proficiency` field onto trading-card rarity
 * tiers. The visual treatments live in `src/styles/skill-card.css`, keyed off
 * the card's `data-rarity` attribute.
 *
 * Skills with no `proficiency` get no tier and render as a plain card.
 */

export type Proficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Visual tiers, ordered from least to most eye-catching.
 *
 * - `uncommon` — a specular sheen on the art window, on interaction only.
 * - `holo`     — a rainbow holofoil in the art window.
 * - `radiant`  — a crosshatched, sparkling foil plus an iridescent frame.
 * - `secret`   — the whole card is foil, and the frame shimmers at rest too.
 */
export type RarityTier = 'uncommon' | 'holo' | 'radiant' | 'secret';

const TIER_BY_PROFICIENCY: Record<Proficiency, RarityTier> = {
  beginner: 'uncommon',
  intermediate: 'holo',
  advanced: 'radiant',
  expert: 'secret',
};

/** Set-symbol style marks, one per tier, shown next to the proficiency label. */
export const RARITY_SYMBOL: Record<RarityTier, string> = {
  uncommon: '◆',
  holo: '★',
  radiant: '★★',
  secret: '★★★',
};

export function isProficiency(value?: string | null): value is Proficiency {
  return !!value && value in TIER_BY_PROFICIENCY;
}

/** Resolves a skill's rarity tier, or `undefined` when proficiency is unset. */
export function rarityTier(proficiency?: string | null): RarityTier | undefined {
  return isProficiency(proficiency) ? TIER_BY_PROFICIENCY[proficiency] : undefined;
}

const PROFICIENCY_RANK: Record<Proficiency, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

/** Proficiency as a number, for sorting. Unset sorts below beginner. */
export function proficiencyRank(proficiency?: string | null): number {
  return isProficiency(proficiency) ? PROFICIENCY_RANK[proficiency] : 0;
}
