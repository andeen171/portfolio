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
      name: 'svgCode',
      title: 'SVG Code',
      type: 'text',
      description: 'Paste the SVG code from svgl library here',
      rows: 10,
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return 'SVG code is required';
          if (!value.trim().startsWith('<svg')) {
            return 'Must be valid SVG code starting with <svg>';
          }
          return true;
        }),
    }),
  ],
});
