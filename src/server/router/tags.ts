import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const tagsRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      try {
        return await ctx.prisma.tag.findMany({
          select: {
            tagName: true,
            id: true,
          },
        });
      } catch (error) {
        console.log("error fetching tags: ", error);
      }
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  });
