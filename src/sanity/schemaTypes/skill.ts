import { defineField, defineType } from 'sanity';

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
      validation: (Rule) => Rule.required(),
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
      description: 'Free-form keywords for search/filtering (e.g. "backend", "web3")',
      options: { layout: 'tags' },
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
        'Optional; leave unset for skills where it does not apply (e.g. soft skills). Drives the experience badge on the card.',
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
