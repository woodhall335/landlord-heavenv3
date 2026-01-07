import { getCanonicalUrl } from "@/lib/seo/urls";

type BlogHeadProps = {
  params: {
    slug: string;
  };
};

export default function Head({ params }: BlogHeadProps) {
  const canonical = getCanonicalUrl(`/blog/${params.slug}`);

  return (
    <>
      <link rel="canonical" href={canonical} />
      <meta property="og:url" content={canonical} />
    </>
  );
}
