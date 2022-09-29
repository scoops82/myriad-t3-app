// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { writeupsRouter } from "./writeups";

// import { exampleRouter } from "./example";
// import { protectedExampleRouter } from "./protected-example-router";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("writeups.", writeupsRouter);
// .merge("example.", exampleRouter)
// .merge("auth.", protectedExampleRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
