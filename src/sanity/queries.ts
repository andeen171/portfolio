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
  } | order(date desc)[0..3]
`);

// Experiences
export const listExperiencesQuery = defineQuery(`
  *[_type == "experience"] | order(startDate desc)
`);

export const previewExperiencesQuery = defineQuery(`
  *[_type == "experience"] | order(startDate desc)[0..2]
`);

// Skills
export const listSkillsQuery = defineQuery(`
  *[ _type == "skill"]
`);

export const previewSkillsQuery = defineQuery(`
  *[ _type == "skill"][0..4]
`);
