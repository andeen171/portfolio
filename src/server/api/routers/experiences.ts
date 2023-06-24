import { z } from 'zod'

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure
} from '~/server/api/trpc'

export const experienceRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    // Define pagination variables
    const page = 1 // change this as needed
    const pageSize = 10 // number of items per page

    // Get the experiences with related skills
    const experiences = ctx.prisma.experience.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        skills: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return experiences
  }),

  getOne: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.experience.findUnique({
        where: {
          id: input.id
        },
        include: {
          skills: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        company: z.string(),
        location: z.string(),
        startDate: z.date(),
        endDate: z.date().optional(),
        description: z.string()
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.experience.create({ data: { ...input } })
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.experience.update({
        where: {
          id: input.id
        },
        data: {
          title: input.title
        }
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.experience.delete({
        where: {
          id: input.id
        }
      })
    })
})
