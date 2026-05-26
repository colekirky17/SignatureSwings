import type { Metadata } from "next";
import { BlogCard } from "../../components/blog-card";
import { getAllBlogPosts } from "../../lib/blog";

export const metadata: Metadata = {
  title: "Blog | Custom Golf Accessories Ideas",
  description:
    "Explore draft guides about custom golf accessories, personalized golf gifts, and thoughtful ideas for golf events and tournaments.",
  openGraph: {
    title: "Signature Swings Blog",
    description:
      "Explore draft guides about custom golf accessories, personalized golf gifts, and thoughtful ideas for golf events and tournaments.",
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="blog-page">
      <section className="blog-hero" aria-labelledby="blog-heading">
        <p className="blog-kicker">Guides And Ideas</p>
        <h1 id="blog-heading">Signature Swings Blog</h1>
        <p>
          Browse early guide previews about custom golf accessories, personalized golf gifts,
          and ideas for golf events. Full articles will be developed as the collection grows.
        </p>
      </section>

      <section aria-label="Blog article previews">
        <div className="blog-grid">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
