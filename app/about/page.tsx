import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Signature Swings",
  description:
    "Learn the story behind Signature Swings, founded by Mike and Caleb to create personal custom golf accessories, gifts, and event pieces.",
};

const storyParagraphs = [
  "What began as a simple experiment - customizing an old wedge just to see what was possible - quickly turned into something bigger. After sharing the finished piece online, they realized golfers were not just interested in custom gear. They were looking for pieces that felt personal, meaningful, and made specifically for them.",
  "That idea became the foundation for Signature Swings.",
  "Golf has always been a personal game. Every player has their own swing, their own routine, their own favorite club, their own lucky ball marker, and their own stories from the course. Signature Swings was built around the belief that your golf accessories should feel just as personal as the game itself.",
  "From custom ball markers and divot tools to Club Links, gifts, and event pieces, every product is designed to add a personal touch to the game.",
  "For Mike and Caleb, customization is not about showing off. It's about making the game more memorable.",
  "Signature Swings exists for the golfers, gift-givers, tournament hosts, and weekend players who want something a little more personal than the standard stuff on the shelf.",
  "Because when it comes to golf, the smallest details can make the game feel more like your own.",
];

const values = [
  {
    title: "Personal to the Game",
    copy: "We believe your gear should reflect your style, your story, and your love for golf.",
    icon: "person",
  },
  {
    title: "Built for Meaningful Gifts",
    copy: "Thoughtful, customizable pieces made to celebrate the moments and people that matter.",
    icon: "gift",
  },
  {
    title: "Made to Tell Your Story",
    copy: "Every detail we create is designed to make the game feel more like your own.",
    icon: "pen",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="container about-hero" aria-labelledby="about-heading">
        <div className="about-intro">
          <p className="about-kicker">Our Story</p>
          <h1 id="about-heading">About Signature Swings</h1>
          <p>
            Signature Swings started with two brothers-in-law, Mike and Caleb, a shared love for
            golf, and a fiber laser in Caleb's garage.
          </p>
          <span className="about-title-rule" aria-hidden="true" />
        </div>

        <div className="about-founder-photo">
          <Image
            src="/images/founderspic.jpg"
            alt="Mike and Caleb standing on a golf course"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 55vw"
            className="about-founder-photo-image"
          />
        </div>
      </section>

      <section className="container about-story-layout" aria-label="Signature Swings story">
        <article className="about-story-panel">
          <h2>Our Story</h2>
          <div className="about-story-copy">
            {storyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <div className="about-supporting-content">
          <section className="about-values" aria-labelledby="about-values-heading">
            <h2 id="about-values-heading">Our Values</h2>
            <div className="about-values-grid">
              {values.map((value) => (
                <article key={value.title} className="about-value-card">
                  <span className={`about-value-icon about-value-icon-${value.icon}`} aria-hidden="true" />
                  <div>
                    <h3>{value.title}</h3>
                    <p>{value.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="container about-quote" aria-label="Signature Swings belief">
        <blockquote>
          <span aria-hidden="true">&ldquo;</span>
          The smallest details can make the game feel more like your own.
        </blockquote>
      </section>
    </main>
  );
}
