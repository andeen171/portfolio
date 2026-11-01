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
    { name: 'tatakae', title: 'Tatakae' },
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
        'The big line under the name. Wrap the words to light up in asterisks, and words the hero should retype in braces, options split by |: I build {systems|apps|platforms} that *move {money|people}*. The first braces cycle through every option; each time they come back round, the next braces move on once.',
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

    // Tatakae
    defineField({
      name: 'tatakae',
      title: 'Tatakae',
      type: 'object',
      group: 'tatakae',
      description:
        'The home page section on your own company and its closed-source work, dressed as a classified dossier.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'title', title: 'Heading', type: 'internationalizedArrayString' }),
        defineField({
          name: 'lede',
          title: 'Notes',
          type: 'internationalizedArrayText',
          description:
            'The "Notes" section. Separate paragraphs with a blank line. [[words]] are taped over until hovered; [[#18]] is a permanent 18-character bar with nothing behind it.',
        }),
        defineField({
          name: 'facts',
          title: 'Identification',
          type: 'internationalizedArrayText',
          description:
            'The record\'s form fields, one per line, label and value split by the first colon. Same tape as the notes: "Size: [[#14]]".',
        }),
        defineField({
          name: 'files',
          title: 'Files',
          type: 'array',
          description: 'The closed-source projects, one file each, in display order.',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'classifiedFile',
              fields: [
                defineField({
                  name: 'codename',
                  title: 'Codename',
                  type: 'string',
                  description: 'Decrypted on screen as the file comes into view.',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'name',
                  title: 'What it is',
                  type: 'internationalizedArrayString',
                }),
                defineField({
                  name: 'status',
                  title: 'Status',
                  type: 'internationalizedArrayString',
                  description: 'A few words next to the pulsing dot: "In active development".',
                }),
                defineField({ name: 'since', title: 'Started', type: 'date' }),
                defineField({
                  name: 'accessKey',
                  title: 'Access key',
                  type: 'string',
                  description:
                    'Locks the page until a visitor types this key. The classified project card with this codename hides it in its markup (an HTML comment) and its memory dump (as hex). Keep it short and ASCII, e.g. TTK-0321. Empty: the page is open.',
                  validation: (Rule) =>
                    Rule.regex(/^[\x21-\x7e]{1,12}$/, {
                      name: 'printable ASCII, up to 12 characters',
                    }),
                }),
                defineField({
                  name: 'summary',
                  title: 'Summary',
                  type: 'internationalizedArrayText',
                  description:
                    'The report. Paragraphs split by a blank line; [[peek]] and [[#12]] tape as in the notes.',
                }),
                defineField({
                  name: 'skills',
                  title: 'Stack',
                  type: 'array',
                  of: [defineArrayMember({ type: 'reference', to: [{ type: 'skill' }] })],
                }),
              ],
              preview: { select: { title: 'codename', subtitle: 'name.0.value' } },
            }),
          ],
        }),
      ],
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
