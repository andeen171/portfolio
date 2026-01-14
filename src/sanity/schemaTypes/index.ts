import type { SchemaTypeDefinition } from 'sanity';
import { experience } from '@/sanity/schemaTypes/experience';
import { project } from '@/sanity/schemaTypes/project';
import { skill } from '@/sanity/schemaTypes/skill';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [experience, project, skill],
};
