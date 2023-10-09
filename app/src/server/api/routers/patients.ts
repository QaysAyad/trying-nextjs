import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const patientsRouter = createTRPCRouter({
  getByClientIdWithDataPoints: protectedProcedure
    .input(z.object({ client_id: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.db.patient.findFirst({ where: { client_id: input.client_id }, include: { dataPoints: true } });
    }),
  search: protectedProcedure
    .input(z.object({ client_id: z.string() }))
    .query(({ ctx, input }) => {
      if (input.client_id.length === 0) {
        return ctx.db.patient.findMany();
      }
      return ctx.db.patient.findMany({
        where: {
          client_id: {
            contains: input.client_id,
          },
        },
      });
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.patient.findMany();
  }),
  // Public end points should not have any sensitive information.
  getAllPublic: publicProcedure.query(({ ctx }) => {
    return ctx.db.patient.findMany({select: {client_id: true, id: true}});
  }),
  getPublic: publicProcedure
    .input(z.object({ client_id: z.string().min(1) }))
    .query(({ ctx, input }) => {
      return ctx.db.patient.findFirst({ where: { client_id: input.client_id }, select: { client_id: true, id: true } });
    }),
});
