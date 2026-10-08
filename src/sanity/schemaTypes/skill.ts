import { defineField, defineType } from 'sanity';

/**
 * Soft limits for what fits on the compact skill card. Longer content still
 * renders (the card fades the description and ellipsizes tags, and the full
 * text shows when the card is opened); these only warn in the Studio.
 */
const CARD_DESCRIPTION_CHARS = 180;
const CARD_TAG_CHARS = 16;
const CARD_FLAVOR_CHARS = 100;

export const skill = defineType({
  name: 'skill',
  title: 'Skill',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'internationalizedArrayString',
      description: `Shown on the card; around ${CARD_DESCRIPTION_CHARS} characters fit before it fades out (the full text shows when the card is opened).`,
      validation: (Rule) => [
        Rule.required(),
        Rule.custom((value?: { _key: string; value?: string }[]) => {
          const long = (value ?? []).filter(
            (item) => (item.value?.length ?? 0) > CARD_DESCRIPTION_CHARS
          );
          return long.length
            ? `Longer than ${CARD_DESCRIPTION_CHARS} characters (${long
                .map((item) => `${item._key}: ${item.value?.length}`)
                .join(', ')}) — the card will fade it out.`
            : true;
        }).warning(),
      ],
    }),
    defineField({
      name: 'flavorText',
      title: 'Flavor Text',
      type: 'internationalizedArrayString',
      description: `Optional one-liner printed in italics at the bottom of the opened card, like trading-card flavor text. Keep it under ${CARD_FLAVOR_CHARS} characters.`,
      validation: (Rule) =>
        Rule.custom((value?: { _key: string; value?: string }[]) => {
          const long = (value ?? []).filter(
            (item) => (item.value?.length ?? 0) > CARD_FLAVOR_CHARS
          );
          return long.length
            ? `Longer than ${CARD_FLAVOR_CHARS} characters (${long
                .map((item) => `${item._key}: ${item.value?.length}`)
                .join(', ')}) — it will wrap onto several lines.`
            : true;
        }).warning(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'skillCategory' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent Color',
      type: 'string',
      description: "Overrides the category accent color for this skill's card",
      options: {
        list: [
          { title: 'Teal', value: 'teal' },
          { title: 'Lavender', value: 'lavender' },
          { title: 'Pink', value: 'pink' },
          { title: 'Peach', value: 'peach' },
          { title: 'Green', value: 'green' },
          { title: 'Sky', value: 'sky' },
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: `Free-form keywords for search/filtering (e.g. "backend", "web3"). The card shows up to 3 that fit; keep them under ${CARD_TAG_CHARS} characters so they don't get cut.`,
      options: { layout: 'tags' },
      validation: (Rule) =>
        Rule.custom((value?: string[]) => {
          const long = (value ?? []).filter((tag) => tag.length > CARD_TAG_CHARS);
          return long.length
            ? `Will be cut on the card (over ${CARD_TAG_CHARS} characters): ${long.join(', ')}`
            : true;
        }).warning(),
    }),
    defineField({
      name: 'proficiency',
      title: 'Proficiency',
      type: 'string',
      description: 'Optional self-assessed level; leave unset if unsure',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
          { title: 'Expert', value: 'expert' },
        ],
      },
    }),
    defineField({
      name: 'yearsOfExperience',
      title: 'Years of Experience',
      type: 'number',
      description:
        'Optional. Shown in the skill card footer. Stored explicitly as null where it does not apply (e.g. soft skills).',
      validation: (Rule) => Rule.integer().min(0).max(50),
    }),
    defineField({
      name: 'svgCode',
      title: 'SVG Code',
      type: 'text',
      description:
        'Paste the SVG code from svgl library here. Optional for skills without a natural icon (e.g. soft skills) — the category fallback icon is used instead.',
      rows: 10,
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true;
          if (!value.trim().startsWith('<svg')) {
            return 'Must be valid SVG code starting with <svg>';
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category.name.0.value',
    },
  },
});
