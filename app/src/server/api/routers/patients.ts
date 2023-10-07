import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const patientsRouter = createTRPCRouter({
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
});
