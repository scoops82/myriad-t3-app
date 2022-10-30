// import { resolve } from "path";
import { TRPCError } from "@trpc/server";
// import { nanoid } from "nanoid";
import { z } from "zod";
import { createRouter } from "./context";
// import { tagsRouter } from "./tags";

export const postsRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      try {
        return await ctx.prisma.post.findMany({
          // select: {
          //   title: true,
          //   mainContent: true,
          //   tags: true,
          //   // user: true,
          //   createdAt: true,
          // },
          include: { tags: { include: { tag: true } } },
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
  .mutation("postNewPost", {
    input: z.object({
      title: z.string(),
      mainContent: z.string(),
      formattedMediaItemsArr: z
        .object({
          mediaItem: z.object({
            connectOrCreate: z.object({
              where: z.object({
                title: z.string(),
                creator: z.string(),
                mediaType: z.string(),
              }),
              create: z.object({
                title: z.string(),
                creator: z.string(),
                mediaType: z.string(),
              }),
            }),
          }),
        })
        .array(),
      formattedTagArr: z
        .object({
          tag: z.object({
            connectOrCreate: z.object({
              where: z.object({ tagName: z.string() }),
              create: z.object({ tagName: z.string() }),
            }),
          }),
        })
        .array(),
    }),
    async resolve({ ctx, input }) {
      // const newPostId = nanoid();
      try {
        const session = await ctx.session;
        if (!session) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        }

        const { user } = session;

        // const testTitle = "This is a Test";
        // const testMainContent =
        //   "This is a test note. This is a test note. This is a test note. This is a test note. This is a test note. This is a test note. This is a test note. This is a test note. This is a test note.";

        // const testUser = "cl8fs3vn000075bwo6srda3uk";
        // const testInputTags = [
        //   {
        //     tag: {
        //       connectOrCreate: {
        //         where: { tagName: "testTag1" },
        //         create: { tagName: "testTag1" },
        //       },
        //     },
        //   },
        //   {
        //     tag: {
        //       connectOrCreate: {
        //         where: { tagName: "testTag2" },
        //         create: { tagName: "testTag2" },
        //       },
        //     },
        //   },
        //   {
        //     tag: {
        //       connectOrCreate: {
        //         where: { tagName: "Psychology" },
        //         create: { tagName: "Psychology" },
        //       },
        //     },
        //   },
        // ];

        return await ctx.prisma.post.create({
          data: {
            // id: newPostId,
            title: input.title,
            // title: testTitle,
            mainContent: input.mainContent,
            // mainContent: testMainContent,
            user: { connect: { id: user?.id } },
            // user: { connect: { id: testUser } },
            mediaItems: {
              create: input.formattedMediaItemsArr,
            },
            tags: {
              create: input.formattedTagArr,
            },
            // tags: {

            // }
          },
          include: { tags: { include: { tag: true } } },
        });
      } catch (error) {
        console.log(error);
      }
    },
  });
