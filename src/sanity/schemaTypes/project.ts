import { defineField, defineType } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'internationalizedArrayString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'internationalizedArrayString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((images: unknown[] | undefined, { document }) =>
          document?.classified || (images?.length ?? 0) > 0
            ? true
            : 'At least one image is required'
        ),
    }),
    defineField({
      name: 'url',
      title: 'Project URL',
      type: 'url',
    }),
    defineField({
      name: 'repo',
      title: 'Repository URL',
      type: 'url',
      validation: (Rule) =>
        Rule.custom((repo: string | undefined, { document }) =>
          document?.classified || repo ? true : 'Required unless the project is classified'
        ),
    }),
    defineField({
      name: 'classified',
      title: 'Classified',
      type: 'boolean',
      initialValue: false,
      description:
        'Closed source: the card glitches, wraps [[words]] in the description in censor tape and, held down, opens a Tatakae dossier file instead of linking out. No images or repository needed.',
    }),
    defineField({
      name: 'dossierFile',
      title: 'Dossier file',
      type: 'string',
      description: 'The codename of the file in Profile → Tatakae that the card opens.',
      hidden: ({ document }) => !document?.classified,
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'skill' }],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name.0.value',
    },
  },
  orderings: [
    {
      title: 'Date (Newest First)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Date (Oldest First)',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
  ],
});
