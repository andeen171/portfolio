import { defineQuery } from 'next-sanity';

// Projects
export const listProjectsQuery = defineQuery(`
  *[_type == "project"] {
    ...,
    skills[]->
  } | order(date desc)
`);

export const previewProjectsQuery = defineQuery(`
  *[_type == "project"] {
    ...,
    skills[]->
  } | order(date desc)[0..1]
`);

// Experiences
export const listExperiencesQuery = defineQuery(`
  *[_type == "experience"] {
    ...,
    skills[]->{ _id, name }
  } | order(endDate desc)
`);

export const previewExperiencesQuery = defineQuery(`
  *[_type == "experience"] {
    ...,
    skills[]->{ _id, name }
  } | order(endDate desc)[0..2]
`);

// Home hero: the current role and a few headline numbers.
export const heroQuery = defineQuery(`
  {
    "current": *[_type == "experience" && !defined(endDate)] | order(startDate desc)[0] {
      title,
      company,
      startDate
    },
    "careerStart": *[_type == "experience"] | order(startDate asc)[0].startDate,
    "projectCount": count(*[_type == "project"]),
    "skillCount": count(*[_type == "skill"]),
    "companyCount": count(array::unique(*[_type == "experience"].company))
  }
`);

// Skills
export const listSkillsQuery = defineQuery(`
  *[ _type == "skill"] {
    ...,
    category->
  } | order(category->order asc, name asc)
`);

export const listSkillCategoriesQuery = defineQuery(`
  *[ _type == "skillCategory"] | order(order asc)
`);

// Profile: the single document of everything the site says about Anderson
// that isn't an experience, project or skill. `knowsAbout` (structured data)
// is derived from the deck rather than kept as a second list.
export const profileQuery = defineQuery(`
  *[_type == "profile" && _id == "profile"][0] {
    fullName,
    shortName,
    nickname,
    jobTitle,
    headline,
    location,
    terminal,
    photo {
      alt,
      crop,
      hotspot,
      asset->{ _id, metadata { lqip, dimensions { width, height } } }
    },
    nameVariants,
    tagline,
    lead,
    aboutTitle,
    roles,
    bio,
    cardFlavor,
    contactTitle,
    contactInvite,
    socials[] { _key, platform, url, handle, blurb, inContact, inHero },
    projectsIntro,
    experiencesIntro,
    skillsIntro,
    seoDescription,
    shareTagline,
    pageDescriptions,
    quote,
    quoteCredit,
    footerTagline,
    "knowsAbout": *[_type == "skill" && proficiency in ["advanced", "expert"]] | order(name asc).name
  }
`);
