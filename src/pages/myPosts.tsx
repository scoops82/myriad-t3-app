import Head from "next/head";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import { signIn, signOut, useSession } from "next-auth/react";

export default function MyPosts() {
  const { data: session, status } = useSession();
  const { data: posts, isLoading } = trpc.useQuery(["posts.findUserPosts"]);
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
          {session ? (
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
                        <button className="btn btn-accent">Edit</button>
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
            <p>You are not logged in</p>
          )}
        </div>
      </main>
    </>
  );
}
