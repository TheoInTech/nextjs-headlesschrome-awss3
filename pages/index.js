import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [websiteURL, setWebsiteURL] = useState("");
  const [imageURL, setImageURL] = useState("/");

  const submitWebsiteURL = async () => {
    const response = await fetch("/api/get-screenshot-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: websiteURL,
      }),
    }).then((res) => res.json());

    setImageURL(response.data)
    console.log("response", response);
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Head>
          <title>NextJS + Headless Chrome + AWS S3</title>
          <meta
            name="description"
            content="NextJS + Headless Chrome + AWS S3"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Image src={imageURL} alt="image" width={1280} height={720} />

        <div className={styles.inputArea}>
          <input
            type="text"
            value={websiteURL}
            onChange={(e) => setWebsiteURL(e.target.value)}
            placeholder="Enter a website URL"
          />
          <button onClick={submitWebsiteURL}>Submit URL</button>
        </div>
      </div>
    </div>
  );
}
