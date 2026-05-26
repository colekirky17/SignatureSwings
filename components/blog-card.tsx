import Link from "next/link";
import type { BlogPost } from "../lib/blog";

type BlogCardProps = {
  post: BlogPost;
};

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="blog-card">
      <div className="blog-card-meta">
        <p className="blog-card-category">{post.category}</p>
        <p>{post.publishedDate}</p>
      </div>
      <h2>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="blog-card-excerpt">{post.excerpt}</p>
      <div className="blog-card-footer">
        <p>{post.readTime}</p>
        <Link href={`/blog/${post.slug}`} className="blog-card-link">
          Read Preview
          <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </article>
  );
}
