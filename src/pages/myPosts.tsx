import Head from "next/head";
// import Link from "next/link";
import { trpc } from "../utils/trpc";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
// import { postsRouter } from "../server/router/posts";

export default function MyPosts() {
  const { data: session, status } = useSession();
  const { data: posts, isLoading } = trpc.useQuery(["posts.findUserPosts"]);

  const [activePostId, setActivePostId] = useState("");
  // const { data: activePost } = trpc.useQuery([
  //   "posts.findSinglePost",
  //   { id: activePostId },
  // ]);

  const [title, setTitle] = useState("");
  const [mainContent, setMainContent] = useState("");
  interface FormattedTag {
    tag: {
      connectOrCreate: {
        where: { tagName: string };
        create: { tagName: string };
      };
    };
  }

  interface FormattedMediaItem {
    mediaItem: {
      connectOrCreate: {
        where: { title: string; creator: string; mediaType: string };
        create: { title: string; creator: string; mediaType: string };
      };
    };
  }
  // const [existingTags, setExistingTags] = useState<string[]>([]);

  // for optimistic update upon updating a post
  const ctx = trpc.useContext();
  const updatePost = trpc.useMutation("posts.updatePost", {
    onMutate: () => {
      ctx.cancelQuery(["posts.findUserPosts"]);

      const optimisticUpdate = ctx.getQueryData(["posts.findUserPosts"]);
      if (optimisticUpdate) {
        ctx.setQueryData(["posts.findUserPosts"], optimisticUpdate);
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["posts.findUserPosts"]);
    },
  });

  const tagRegex = new RegExp("[#]\\w+", "gm");

  if (isLoading) return <div>Fetching Your Posts...</div>;

  async function getActivePost(postId: string) {
    try {
      const activePost = await ctx.client.query("posts.findSinglePost", {
        id: postId,
      });
      if (activePost?.mainContent && activePost?.title) {
        setMainContent(activePost.mainContent);
        setTitle(activePost.title);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // async function handleUpdatePost(
  //   MediaItemsArr: Array<FormattedMediaItem>,
  //   TagArr: Array<FormattedTag>
  // ) {
  //   try {
  //     await ctx.client.mutation("posts.updatePost", {
  //       id: activePostId,
  //       title: title,
  //       mainContent: mainContent,
  //       formattedMediaItemsArr: MediaItemsArr,
  //       formattedTagArr: TagArr,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  return (
    <>
      <Head>
        <title>Myriad</title>
        <meta name="description" content="Idea Networking" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Myriad Media</h1>
        <h2>My Posts</h2>
        <div>
          {status === "authenticated" ? (
            <ul className="m-auto gap-8 flex flex-wrap justify-center">
              {posts?.map((post, index) => {
                return (
                  <div
                    className="card w-96 bg-base-100 shadow-xl mt-4"
                    key={index}
                  >
                    {/* <figure>
              <img src="https://placeimg.com/200/280/arch" alt="Movie" />
            </figure> */}
                    <div className="card-body">
                      <h2 className="card-title">{post.title}</h2>
                      <p>{post.mainContent}</p>
                      <ul className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => {
                          return (
                            <li key={index}>
                              <div className="badge badge-primary">
                                {tag.tag.tagName}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="card-actions justify-between">
                        <label
                          htmlFor="my-modal-2"
                          className="btn btn-accent"
                          onClick={() => {
                            setActivePostId(post.id);
                            getActivePost(post.id);
                          }}
                        >
                          Edit
                        </label>

                        <button className="btn btn-secondary">Delete</button>
                        <small>{post.createdAt.toLocaleString()}</small>
                      </div>
                    </div>
                    {/* <ul>
              {post.tags.map((value, index) => {
                return <li key={index}>{value.tagName}</li>;
              })}
            </ul>
            <p>{post.user.userName}</p> */}
                  </div>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col">
              <p>You are not logged in</p>
              <button className="btn" onClick={() => signIn("google")}>
                Login with Google
              </button>
              <button onClick={() => signIn("discord")}>
                Login with Discord
              </button>
            </div>
          )}
        </div>
      </main>
      <input type="checkbox" id="my-modal-2" className="modal-toggle" />
      <label className="modal cursor-pointer" htmlFor="my-modal-2">
        <label className="modal-box relative" htmlFor="">
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();

              let m;

              const formattedTagArr: FormattedTag[] = [];

              const formattedMediaItemsArr: FormattedMediaItem[] = [];

              while ((m = tagRegex.exec(mainContent)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === tagRegex.lastIndex) {
                  tagRegex.lastIndex++;
                }
                console.log("m: ", m);

                // The result can be accessed through the `m`-variable.
                m.forEach((match, groupIndex) => {
                  console.log(`Found match, group ${groupIndex}: ${match}`);

                  const formattedMatch = match.split("#")[1] as string;
                  console.log("formattedMatch: ", formattedMatch);
                  const formattedTag: FormattedTag = {
                    tag: {
                      connectOrCreate: {
                        where: { tagName: formattedMatch },
                        create: { tagName: formattedMatch },
                      },
                    },
                  };

                  formattedTagArr.push(formattedTag);
                });
              }

              // const tagArr = mainContent.match(tagRegex);
              // const tagArr = m;
              console.log("formattedTagArr: ", formattedTagArr);
              // setTagsInput(...tagsInput, formattedTagArr);

              // if (formattedTagArr.length > 0) {
              //   setTagsInput(formattedTagArr);
              //   console.log(
              //     "🚀 ~ file: index.tsx ~ line 180 ~ Home ~ tagsInput",
              //     tagsInput
              //   );
              // }
              const id = activePostId;

              // handleUpdatePost()
              updatePost.mutate({
                id,
                title,
                mainContent,
                formattedMediaItemsArr,
                formattedTagArr,
              });
            }}
          >
            <h2 className="text-2xl pt-4">Update Your Post</h2>
            {/* <select className="select select-bordered w-full max-w-xs">
                <option disabled selected>
                  Choose the book you are writing about.
                </option>
                <option value="cl8fsg4h001258bworkyos3fz">
                  &quot;Rip it up&quot; by Richard Wiseman
                </option>
                <option value="cl8mwad5g00678jwow0uj351n">
                  &quot;The Psychology of Money&quot; by Morgan Housel
                </option>
              </select> */}
            <input
              type="text"
              value={title}
              className="input input-bordered w-full max-w-xs"
              maxLength={250}
              onChange={(event) => setTitle(event.target.value)}
            />
            <textarea
              className="textarea textarea-bordered"
              value={mainContent}
              onChange={(event) => setMainContent(event.target.value)}
            />
            {/* <input
                type="text"
                value={tagInput}
                placeholder="Tags"
                className="input input-bordered w-full max-w-xs"
                maxLength={250}
                onChange={(event) => {
                  console.log(event);
                  setTagInput(event.target.value);
                }}
              /> */}
            <div className="flex gap-4 justify-center">
              <button type="submit">
                <label htmlFor="my-modal-2" className="btn btn-success">
                  Update
                </label>
              </button>

              <label htmlFor="my-modal-2" className="btn btn-error">
                Cancel
              </label>
            </div>
          </form>
        </label>
      </label>
    </>
  );
}
