import { createTRPCRouter } from '~/server/api/trpc'
import { projectRouter } from './routers/project'
import { skillRouter } from './routers/skill'
import { experienceRouter } from './routers/experiences'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  project: projectRouter,
  skill: skillRouter,
  experience: experienceRouter
})

// export type definition of API
export type AppRouter = typeof appRouter
