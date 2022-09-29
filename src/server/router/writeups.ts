// import { resolve } from "path";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const writeupsRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      try {
        return await ctx.prisma.writeup.findMany({
          select: {
            title: true,
            mainContent: true,
            // tags: true,
            // user: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } catch (error) {
        console.log("error", error);
      }
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("postWriteup", {
    input: z.object({
      title: z.string(),
      mainContent: z.string(),
    }),
    async resolve({ ctx, input }) {
      try {
        await ctx.prisma.writeup.create({
          data: {
            title: input.title,
            mainContent: input.mainContent,
          },
        });
      } catch (error) {
        console.log(error);
      }
    },
  });
