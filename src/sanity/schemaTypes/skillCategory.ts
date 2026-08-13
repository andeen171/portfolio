import { defineField, defineType } from 'sanity';

export const skillCategory = defineType({
  name: 'skillCategory',
  title: 'Skill Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'internationalizedArrayString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name.0.value' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent Color',
      type: 'string',
      description: 'Card border/gradient accent for this category',
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'fallbackSvgCode',
      title: 'Fallback SVG Code',
      type: 'text',
      rows: 10,
      description:
        'Used for skills in this category that have no icon of their own (e.g. soft skills)',
    }),
  ],
  preview: {
    select: {
      title: 'name.0.value',
      subtitle: 'accentColor',
    },
  },
});
