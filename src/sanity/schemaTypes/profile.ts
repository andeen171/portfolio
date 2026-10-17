import { defineArrayMember, defineField, defineType } from 'sanity';

/** The one profile document's id; the Studio opens it directly. */
export const PROFILE_ID = 'profile';

/** Networks the site has an icon and accent for. */
export const SOCIAL_PLATFORMS = [
  { title: 'GitHub', value: 'github' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'X', value: 'x' },
  { title: 'Instagram', value: 'instagram' },
] as const;

/** A section's heading and the paragraph under it, on the home page and on
 *  its own page. */
const sectionIntro = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    group: 'sections',
    options: { collapsible: true, collapsed: false },
    fields: [
      defineField({ name: 'title', title: 'Heading', type: 'internationalizedArrayString' }),
      defineField({ name: 'lede', title: 'Intro paragraph', type: 'internationalizedArrayText' }),
    ],
  });

/**
 * Everything the site says about Anderson that isn't an experience, a project
 * or a skill: who he is, the hero, the bio, contact, section intros, SEO and
 * the footer. A single document (see `structure.ts`), so there's one place to
 * edit each fact.
 */
export const profile = defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'hero', title: 'Hero' },
    { name: 'about', title: 'About' },
    { name: 'contact', title: 'Contact & socials' },
    { name: 'sections', title: 'Section intros' },
    { name: 'seo', title: 'SEO & sharing' },
    { name: 'footer', title: 'Footer' },
  ],
  fields: [
    // Identity
    defineField({
      name: 'fullName',
      title: 'Full name',
      type: 'string',
      group: 'identity',
      description: 'The name the hero types out, the share image, structured data and copyright.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortName',
      title: 'Short name',
      type: 'string',
      group: 'identity',
      description: 'The site name: page titles ("Skills · Anderson Lopes") and the profile card.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'nickname',
      title: 'Nickname',
      type: 'string',
      group: 'identity',
      description: 'The wordmark in the header and footer, after the 戦え.',
    }),
    defineField({
      name: 'jobTitle',
      title: 'Job title',
      type: 'internationalizedArrayString',
      group: 'identity',
      description:
        'Short, for the home page title and search engines. The profile card shows the current role from Experience instead, and falls back to this.',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'internationalizedArrayString',
      group: 'identity',
      description: 'A slightly longer title, under the name on the share image.',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      group: 'identity',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'region', title: 'State / region code', type: 'string' }),
        defineField({
          name: 'countryCode',
          title: 'Country code',
          type: 'string',
          description: 'Two letters, e.g. BR.',
          validation: (Rule) => Rule.length(2).uppercase(),
        }),
        defineField({
          name: 'label',
          title: 'Written out',
          type: 'internationalizedArrayString',
          description: 'As a sentence would say it: "Belo Horizonte, Brazil". The share image.',
        }),
        defineField({
          name: 'short',
          title: 'Short form',
          type: 'string',
          description: 'For tight spots like the profile card: "Belo Horizonte, BR".',
        }),
      ],
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      group: 'identity',
      description: 'The art on the profile card, shown square.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Description',
          type: 'internationalizedArrayString',
          description: 'For screen readers: what the picture shows.',
        }),
      ],
    }),
    defineField({
      name: 'terminal',
      title: 'Terminal prompt',
      type: 'object',
      group: 'identity',
      description: 'The user@host in the hero\'s "whoami" prompt and the contact window title.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'user', title: 'User', type: 'string' }),
        defineField({ name: 'host', title: 'Host', type: 'string' }),
      ],
    }),

    // Hero
    defineField({
      name: 'nameVariants',
      title: 'Typed name variants',
      type: 'array',
      group: 'hero',
      of: [defineArrayMember({ type: 'string' })],
      description:
        'After the full name, the hero types these in turn. Each only erases what differs from the next, so an order like "Anderson Ribeiro → Anderson Lopes → Andeen" reads as the name being trimmed and regrown.',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'internationalizedArrayString',
      group: 'hero',
      description:
        'The big line under the name. Wrap the words to light up in asterisks: I build backend systems that *move money*.',
    }),
    defineField({
      name: 'lead',
      title: 'Lead',
      type: 'internationalizedArrayText',
      group: 'hero',
      description: 'The paragraph under the tagline.',
    }),

    // About
    defineField({
      name: 'aboutTitle',
      title: 'Heading',
      type: 'internationalizedArrayString',
      group: 'about',
    }),
    defineField({
      name: 'roles',
      title: 'Typed roles',
      type: 'internationalizedArrayText',
      group: 'about',
      description: 'One per line. The first shows without JavaScript; the rest are typed in turn.',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'internationalizedArrayText',
      group: 'about',
      description:
        'Separate paragraphs with a blank line. The first one or two show before "Read more".',
    }),
    defineField({
      name: 'cardFlavor',
      title: 'Profile card flavor text',
      type: 'internationalizedArrayString',
      group: 'about',
      description: 'The italic line on the profile card. Keep it short.',
      validation: (Rule) =>
        Rule.custom((value?: { _key: string; value?: string }[]) =>
          (value ?? []).some((item) => (item.value?.length ?? 0) > 60)
            ? 'Longer than 60 characters: it will wrap to several lines on the card.'
            : true
        ).warning(),
    }),

    // Contact
    defineField({
      name: 'contactTitle',
      title: 'Heading',
      type: 'internationalizedArrayString',
      group: 'contact',
    }),
    defineField({
      name: 'contactInvite',
      title: 'Invitation',
      type: 'internationalizedArrayText',
      group: 'contact',
      description: 'The paragraph in the contact terminal.',
    }),
    defineField({
      name: 'socials',
      title: 'Social profiles',
      type: 'array',
      group: 'contact',
      description:
        'In display order. Listed in the footer, the command palette and structured data. No email on purpose.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialProfile',
          fields: [
            defineField({
              name: 'platform',
              title: 'Network',
              type: 'string',
              options: { list: [...SOCIAL_PLATFORMS], layout: 'dropdown' },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Profile URL',
              type: 'url',
              validation: (Rule) => Rule.required().uri({ scheme: ['https'] }),
            }),
            defineField({
              name: 'handle',
              title: 'Handle',
              type: 'string',
              description: 'As shown next to the network: @andeen171, in/anderson-lopes-dev…',
            }),
            defineField({
              name: 'blurb',
              title: 'Contact blurb',
              type: 'internationalizedArrayString',
              description: 'What to reach you there for, on its contact card.',
            }),
            defineField({
              name: 'inContact',
              title: 'Show in the contact section',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'inHero',
              title: 'Show as a button in the hero',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: 'platform', subtitle: 'handle' },
            prepare: ({ title, subtitle }) => ({
              title: SOCIAL_PLATFORMS.find((platform) => platform.value === title)?.title ?? title,
              subtitle,
            }),
          },
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value?: { platform?: string }[]) => {
          const platforms = (value ?? []).map((item) => item.platform);
          return new Set(platforms).size === platforms.length
            ? true
            : 'Each network can only be listed once.';
        }),
    }),

    // Section intros
    sectionIntro('projectsIntro', 'Projects'),
    sectionIntro('experiencesIntro', 'Experience'),
    sectionIntro('skillsIntro', 'Skills'),

    // SEO
    defineField({
      name: 'seoDescription',
      title: 'Site description',
      type: 'internationalizedArrayText',
      group: 'seo',
      description:
        'The home page description for search engines and link previews, about 150–160 characters.',
    }),
    defineField({
      name: 'shareTagline',
      title: 'Share image tagline',
      type: 'internationalizedArrayString',
      group: 'seo',
      description: 'The line under the headline on the share image.',
    }),
    defineField({
      name: 'pageDescriptions',
      title: 'Page descriptions',
      type: 'object',
      group: 'seo',
      description: 'Search and link-preview descriptions for each page.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'projects', title: 'Projects', type: 'internationalizedArrayText' }),
        defineField({
          name: 'experiences',
          title: 'Experience',
          type: 'internationalizedArrayText',
        }),
        defineField({ name: 'skills', title: 'Skills', type: 'internationalizedArrayText' }),
      ],
    }),

    // Footer
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'internationalizedArrayString',
      group: 'footer',
      description: 'The motto at the top of the footer.',
    }),
    defineField({
      name: 'quoteCredit',
      title: 'Quote credit',
      type: 'string',
      group: 'footer',
      description: 'Under the quote, after the dash: "Anderson Lopes, 2022".',
    }),
    defineField({
      name: 'footerTagline',
      title: 'Tagline',
      type: 'internationalizedArrayText',
      group: 'footer',
      description: 'The short description under the wordmark.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Profile', subtitle: 'Who you are, across the site' }),
  },
});
