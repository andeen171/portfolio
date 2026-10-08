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
      company
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
