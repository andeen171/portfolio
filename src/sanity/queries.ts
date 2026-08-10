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
  *[_type == "experience"] | order(endDate desc)
`);

export const previewExperiencesQuery = defineQuery(`
  *[_type == "experience"] | order(endDate desc)[0..2]
`);

// Skills
export const listSkillsQuery = defineQuery(`
  *[ _type == "skill"] {
    ...,
    category->
  } | order(category->order asc, name asc)
`);

export const previewSkillsQuery = defineQuery(`
  *[ _type == "skill"] {
    ...,
    category->
  } | order(category->order asc, name asc)[0..4]
`);

export const listSkillCategoriesQuery = defineQuery(`
  *[ _type == "skillCategory"] | order(order asc)
`);
