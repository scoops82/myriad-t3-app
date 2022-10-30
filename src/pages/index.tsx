// import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { signIn, signOut, useSession } from "next-auth/react";
// import NewPostForm from "../components/NewPostForm";
import { useState, useEffect } from "react";
// import { tagsRouter } from "../server/router/tags";
// import { useQueries } from "react-query";

const Posts = () => {
  const { data: posts, isLoading } = trpc.useQuery(["posts.getAll"]);
  const { data: tags } = trpc.useQuery(["tags.getAll"]);

  if (isLoading) return <div>Fetching Entries...</div>;

  return (
    <div className="m-auto gap-8 flex flex-wrap justify-center">
      {posts?.map((post, index) => {
        return (
          <div className="card w-96 bg-base-100 shadow-xl mt-4" key={index}>
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
              <div className="card-actions justify-end">
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
    </div>
  );
};

const Home = () => {
  const { data: session, status } = useSession();
  const { data: tags } = trpc.useQuery(["tags.getAll"]);
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
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const ctx = trpc.useContext();
  const postNewPost = trpc.useMutation("posts.postNewPost", {
    onMutate: () => {
      ctx.cancelQuery(["posts.getAll"]);

      const optimisticUpdate = ctx.getQueryData(["posts.getAll"]);
      if (optimisticUpdate) {
        ctx.setQueryData(["posts.getAll"], optimisticUpdate);
      }
    },
    onSettled: () => {
      ctx.invalidateQueries(["posts.getAll"]);
    },
  });

  // extracts the tagName from each tag object and adds the array to state
  // will run whenever tags in the db changes.
  useEffect(() => {
    if (tags) {
      const existingTagNames = [];
      for (const tag of tags) {
        const tagName = tag.tagName;
        existingTagNames.push(tagName);
      }
      setExistingTags(existingTagNames);
    }
  }, [tags?.length]);

  const tagRegex = new RegExp("[#]\\w+", "gm");

  if (status === "loading") {
    return <main>Loading...</main>;
  }
  return (
    <>
      <Head>
        <title>Myriad</title>
        <meta name="description" content="Idea Networking" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center">
        <h1 className="text-3xl pt-4">Myriad Media</h1>
        <p>Write-ups of media that people have been viewing/listening to.</p>
        {session ? (
          <div>
            <p>Hi {session.user?.name}</p>

            <button onClick={() => signOut()}>Logout</button>
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

                    const formattedMatch = match
                      .toLowerCase()
                      .split("#")[1] as string;
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

                postNewPost.mutate({
                  formattedTagArr,
                  title,
                  mainContent,
                  formattedMediaItemsArr,
                });

                setTitle("");
                setMainContent("");
              }}
            >
              <h2 className="text-2xl pt-4">Add a new Media Note</h2>
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
                placeholder="The Title of your note..."
                className="input input-bordered w-full max-w-xs"
                maxLength={250}
                onChange={(event) => setTitle(event.target.value)}
              />
              <textarea
                className="textarea textarea-bordered"
                placeholder="Your note..."
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
                <button type="submit" className="btn btn-success">
                  Post
                </button>
                <button
                  type="reset"
                  onClick={() => {
                    setMainContent("");
                    setTitle("");
                  }}
                  className="btn btn-error"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col">
            <button className="btn" onClick={() => signIn("google")}>
              Login with Google
            </button>
            <button onClick={() => signIn("discord")}>
              Login with Discord
            </button>
          </div>
        )}
        <div className="pt-10">
          <Posts />
        </div>
      </main>
    </>
  );
};

export default Home;
