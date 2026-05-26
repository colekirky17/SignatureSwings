import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBlogPosts, getBlogPostBySlug } from "../../../lib/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    openGraph: {
      type: "article",
      title: post.seoTitle,
      description: post.seoDescription,
    },
    twitter: {
      title: post.seoTitle,
      description: post.seoDescription,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="blog-article">
      <Link href="/blog" className="blog-back-link">
        &lt;- Back To Blog
      </Link>

      <article>
        <header className="blog-article-header">
          <p className="blog-kicker">{post.category}</p>
          <h1>{post.title}</h1>
          <div className="blog-article-meta">
            <p>{post.publishedDate}</p>
            <p>{post.readTime}</p>
          </div>
          <p className="blog-article-excerpt">{post.excerpt}</p>
        </header>

        <div className="blog-draft-note">
          <p>
            This is a short draft preview for future Signature Swings content. Full article
            details will be developed later.
          </p>
        </div>

        <div className="blog-content">
          {post.bodySections.map((section) => (
            <section key={section.heading} className="blog-section">
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
