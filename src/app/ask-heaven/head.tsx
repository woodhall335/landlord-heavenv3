import { getCanonicalUrl } from "@/lib/seo/urls";

export default function Head() {
  const canonical = getCanonicalUrl("/ask-heaven");

  return (
    <>
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
    </>
  );
}
