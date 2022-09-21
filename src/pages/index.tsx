// import type { NextPage } from "next";
import Head from "next/head";
// import { trpc } from "../utils/trpc";
import { signIn, signOut, useSession } from "next-auth/react";

const Home = () => {
  const { data: session, status } = useSession();

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
      <main>
        <h1>Myriad Media</h1>
        {session ? (
          <div>
            <p>Hi {session.user?.name}</p>

            <button onClick={() => signOut()}>Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={() => signIn("google")}>Login with Google</button>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;
