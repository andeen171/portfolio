import type { SchemaTypeDefinition } from 'sanity';
import { experience } from '@/sanity/schemaTypes/experience';
import { project } from '@/sanity/schemaTypes/project';
import { skill } from '@/sanity/schemaTypes/skill';
import { skillCategory } from '@/sanity/schemaTypes/skillCategory';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [experience, project, skill, skillCategory],
};
