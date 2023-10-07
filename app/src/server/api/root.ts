import { patientsRouter } from "~/server/api/routers/patients";
import { createTRPCRouter } from "~/server/api/trpc";
import { dataPointsRouter } from "./routers/dataPoints";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  patients: patientsRouter,
  dataPoints: dataPointsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
