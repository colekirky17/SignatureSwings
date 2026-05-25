import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Signature Swings",
  description:
    "Learn about Signature Swings, a brand focused on custom golf accessories and personalized golf gifts for memorable rounds and events.",
};

export default function AboutPage() {
  return (
    <main className="page narrow-page">
      <section className="page-header">
        <h1>About Signature Swings</h1>
        <p className="page-copy">
          Signature Swings is a custom golf accessories brand focused on thoughtful details,
          premium presentation, and memorable gifts.
        </p>
      </section>
    </main>
  );
}
