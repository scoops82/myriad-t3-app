import React, { useState } from "react";
import { trpc } from "../utils/trpc";
import { useSession } from "next-auth/react";

export default function NewWriteupForm() {
  const { data: session, status } = useSession();

  const [title, setTitle] = useState("");
  const [mainContent, setMainContent] = useState("");
  const [mediaItem, setMediaItem] = useState("");
  const postWriteup = trpc.useMutation("writeups.postWriteup");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        postWriteup.mutate({
          title,
          mainContent,
          tags,
        });

        setTitle("");
        setMainContent("");
        setMediaItem("");
      }}
    >
      <h3>Add a new Writeup</h3>
      <input
        type="text"
        value={title}
        placeholder="The Title of your writeup..."
        maxLength={250}
        onChange={(event) => setTitle(event.target.value)}
      />
    </form>
  );
}
