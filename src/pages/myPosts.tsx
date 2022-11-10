import Head from "next/head";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import { signIn, signOut, useSession } from "next-auth/react";

export default function MyPosts() {
  const { data: session, status } = useSession();
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
          {session ? <p>here are your posts</p> : <p>You are not logged in</p>}
        </div>
      </main>
    </>
  );
}
