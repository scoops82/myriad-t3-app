// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { postsRouter } from "./posts";
import { tagsRouter } from "./tags";

// import { exampleRouter } from "./example";
// import { protectedExampleRouter } from "./protected-example-router";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("posts.", postsRouter)
  .merge("tags.", tagsRouter);
// .merge("example.", exampleRouter)
// .merge("auth.", protectedExampleRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
