import { z } from 'zod'

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure
} from '~/server/api/trpc'

export const projectRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`
      }
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    // Define pagination variables
    const page = 1 // change this as needed
    const pageSize = 10 // number of items per page

    // Get the projects with related skills
    const projects = ctx.prisma.project.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        skills: {
          select: {
            id: true,
            name: true
          },
          take: 3
        }
      }
    })

    return projects
  }),

  getOne: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.project.findUnique({
        where: {
          id: input.id
        }
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        image: z.string(),
        url: z.string(),
        repo: z.string()
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.project.create({ data: { ...input } })
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.project.update({
        where: {
          id: input.id
        },
        data: {
          name: input.name
        }
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.project.delete({
        where: {
          id: input.id
        }
      })
    })
})
