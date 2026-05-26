export type BlogPostSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedDate: string;
  readTime: string;
  seoTitle: string;
  seoDescription: string;
  bodySections: BlogPostSection[];
};

const blogPosts: BlogPost[] = [
  {
    title: "How to Choose Custom Golf Ball Markers",
    slug: "how-to-choose-custom-golf-ball-markers",
    excerpt:
      "A draft guide to thinking through style, gifting, and event needs for custom golf ball markers.",
    category: "Ball Markers",
    publishedDate: "Publishing date coming soon",
    readTime: "3 min read preview",
    seoTitle: "How to Choose Custom Golf Ball Markers",
    seoDescription:
      "Preview a future Signature Swings guide to choosing custom golf ball markers for gifts, golf outings, and events.",
    bodySections: [
      {
        heading: "Start With The Occasion",
        paragraphs: [
          "Draft preview: this guide will cover how the occasion, recipient, and expected quantity can shape a custom golf ball marker idea.",
        ],
      },
      {
        heading: "Details To Consider",
        paragraphs: [
          "Future content will outline practical design considerations and questions to discuss before placing a custom inquiry.",
        ],
      },
    ],
  },
  {
    title: "Best Personalized Golf Gifts for Events and Tournaments",
    slug: "best-personalized-golf-gifts-for-events-and-tournaments",
    excerpt:
      "A short draft preview of personalized golf gift ideas for outings, tournaments, and guest experiences.",
    category: "Gift Ideas",
    publishedDate: "Publishing date coming soon",
    readTime: "4 min read preview",
    seoTitle: "Best Personalized Golf Gifts for Events and Tournaments",
    seoDescription:
      "Preview ideas for personalized golf gifts designed for events, tournaments, and memorable guest experiences.",
    bodySections: [
      {
        heading: "Plan Around Your Guests",
        paragraphs: [
          "Draft preview: a future article will compare golf gift formats suited to tournament guests, sponsors, and event keepsakes.",
        ],
      },
      {
        heading: "Build A Cohesive Event Gift",
        paragraphs: [
          "Future guidance will cover matching personalized golf gifts to event branding, quantities, and presentation goals.",
        ],
      },
    ],
  },
  {
    title: "Custom Golf Accessories: What to Know Before You Order",
    slug: "custom-golf-accessories-what-to-know-before-you-order",
    excerpt:
      "A draft checklist for exploring custom golf accessories and preparing for a future order inquiry.",
    category: "Custom Orders",
    publishedDate: "Publishing date coming soon",
    readTime: "3 min read preview",
    seoTitle: "Custom Golf Accessories: What to Know Before You Order",
    seoDescription:
      "Preview a future checklist for selecting custom golf accessories and preparing for a custom or bulk inquiry.",
    bodySections: [
      {
        heading: "Clarify Your Goals",
        paragraphs: [
          "Draft preview: this article will help customers identify product type, purpose, quantity, and timeline before reaching out.",
        ],
      },
      {
        heading: "Prepare For An Inquiry",
        paragraphs: [
          "Future content will explain what information helps start a productive discussion about custom or bulk golf accessories.",
        ],
      },
    ],
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
