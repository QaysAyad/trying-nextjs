import type { DataPoint } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const dataPointsRouter = createTRPCRouter({
  getAllForPatient: protectedProcedure
    .input(z.object({ patient_id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.dataPoint.findMany({
        where: {
          patient_id: input.patient_id,
        },
      });
    }),
  getAllForPatients: protectedProcedure
    .input(z.object({ patient_ids: z.number().array() }))
    .query(async ({ ctx, input }) => {
      const dataPoints = await ctx.db.dataPoint.findMany({
        where: {
          patient_id: {
            in: input.patient_ids,
          },
        },
        orderBy: {
          date_testing: "asc",
        },
      });
      const dataPointsMap = dataPoints.reduce((acc, dataPoint) => {
        if (acc.has(dataPoint.patient_id)) {
          // Since the has check returned true, then this is guaranteed to be defined.
          acc.get(dataPoint.patient_id)?.push(dataPoint);
        } else {
          acc.set(dataPoint.patient_id, [dataPoint]);
        }
        return acc;
      }, new Map<number, DataPoint[]>());
      return dataPointsMap;
    }),
});
