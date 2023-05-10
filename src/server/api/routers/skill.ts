import { z } from 'zod'

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure
} from '~/server/api/trpc'

export const skillRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.skill.findMany()
  }),

  getOne: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.skill.findUnique({
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
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.skill.create({ data: { ...input } })
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
