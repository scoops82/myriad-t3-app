// import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { signIn, signOut, useSession } from "next-auth/react";
// import NewWriteupForm from "../components/NewWriteupForm";
import { useState } from "react";

const Writeups = () => {
  const { data: writeups, isLoading } = trpc.useQuery(["writeups.getAll"]);

  if (isLoading) return <div>Fetching Entries...</div>;

  return (
    <div>
      {writeups?.map((writeup, index) => {
        return (
          <div key={index}>
            <p>{writeup.title}</p>
            <p>{writeup.mainContent}</p>
            {/* <ul>
              {writeup.tags.map((value, index) => {
                return <li key={index}>{value.tagName}</li>;
              })}
            </ul>
            <p>{writeup.user.userName}</p> */}
            <p>{writeup.createdAt.toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
};

const Home = () => {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [mainContent, setMainContent] = useState("");
  // const [mediaItemId, setMediaItem] = useState("");
  const postWriteup = trpc.useMutation("writeups.postWriteup");

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

                postWriteup.mutate({
                  title,
                  mainContent,
                });

                setTitle("");
                setMainContent("");
                // setMediaItem("");
              }}
            >
              <h2 className="text-2xl pt-4">Add a new Writeup</h2>
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
          <Writeups />
        </div>
      </main>
    </>
  );
};

export default Home;
