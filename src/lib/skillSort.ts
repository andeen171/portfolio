import type { ListSkillsQueryResult } from '@/sanity/types';
import { proficiencyRank } from './rarity';

type Skill = ListSkillsQueryResult[number];

/**
 * How the /skills grid is ordered.
 *
 * - `category`    — the query's own order (category, then name), grouped.
 * - `experience`  — most years first; skills without a figure go last.
 * - `proficiency` — highest proficiency first.
 *
 * Each sort breaks ties with the other measure and then the name, so the
 * order is total and stable between renders.
 */
export const SKILL_SORTS = ['category', 'experience', 'proficiency'] as const;
export type SkillSort = (typeof SKILL_SORTS)[number];

export function isSkillSort(value: string): value is SkillSort {
  return (SKILL_SORTS as readonly string[]).includes(value);
}

const byYears = (a: Skill, b: Skill) => (b.yearsOfExperience ?? -1) - (a.yearsOfExperience ?? -1);
const byProficiency = (a: Skill, b: Skill) =>
  proficiencyRank(b.proficiency) - proficiencyRank(a.proficiency);
const byName = (a: Skill, b: Skill) => (a.name ?? '').localeCompare(b.name ?? '');

export function sortSkills<T extends Skill>(skills: readonly T[], sort: SkillSort): T[] {
  switch (sort) {
    case 'category':
      return [...skills];
    case 'experience':
      return [...skills].sort((a, b) => byYears(a, b) || byProficiency(a, b) || byName(a, b));
    case 'proficiency':
      return [...skills].sort((a, b) => byProficiency(a, b) || byYears(a, b) || byName(a, b));
  }
}
