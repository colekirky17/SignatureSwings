import Image from "next/image";
import Link from "next/link";
import styles from "./b2b-landing-page.module.css";

const eventTypes = [
  {
    title: "Tournament Tee Gifts",
    copy: "Polished accessories ready for registration tables, welcome bags, and sponsor moments.",
  },
  {
    title: "Member-Guest Gifts",
    copy: "Personalized keepsakes that feel premium without complicating event planning.",
  },
  {
    title: "Corporate Outings",
    copy: "Branded golf gifts built for client events, employee outings, and partner hospitality.",
  },
  {
    title: "Pro Shop / Club Orders",
    copy: "Repeatable custom accessories for clubs, shops, leagues, and seasonal gifting.",
  },
];

const packages = [
  {
    name: "Starter Package",
    description: "A focused gift set for smaller events, quick turnarounds, and essential branding.",
    items: ["Custom Ball Markers", "Divot Tools"],
    price: "$___",
  },
  {
    name: "Tournament Package",
    description: "The balanced event bundle for tee gifts, sponsor kits, and full-field outings.",
    items: ["Ball Markers", "Divot Tools", "Club Links"],
    price: "$___",
    featured: true,
  },
  {
    name: "Premium Event Package",
    description: "A higher-touch package with more ways to make the day feel memorable.",
    items: [
      "Ball Markers",
      "Divot Tools",
      "Club Links",
      "Bonus add-on / premium presentation",
    ],
    price: "$___",
  },
];

const spendTiers = [
  {
    spend: "Spend $2,000+",
    benefit: "Add a bonus door prize",
  },
  {
    spend: "Spend $3,500+",
    benefit: "Add premium event giveaway options",
  },
  {
    spend: "Spend $5,000+",
    benefit: "Unlock custom package support",
  },
];

const products = [
  {
    name: "Ball Markers",
    image: "/images/category-ball-markers.jpg",
    copy: "Compact, high-impact pieces for logos, outing marks, member initials, and sponsor branding.",
  },
  {
    name: "Divot Tools",
    image: "/images/category-divot-tools.jpg",
    copy: "Functional course accessories that turn everyday play into a branded event touchpoint.",
  },
  {
    name: "Club Links",
    image: "/images/category-club-links.jpg",
    copy: "Custom tags for club identification, member programs, and elevated tournament gifts.",
  },
];

const steps = [
  "Tell us about your event",
  "Choose your products or package",
  "Approve your design",
  "We produce and ship your order",
];

const testimonials = [
  {
    quote:
      "The package felt dialed-in for our tournament, from the first design proof to the final gift table.",
    name: "Tournament Director",
    club: "Placeholder Golf Club",
  },
  {
    quote:
      "Our members loved having something useful, custom, and polished to take onto the course.",
    name: "Head Golf Professional",
    club: "Sample Country Club",
  },
];

const clubLogos = ["Oak Ridge Club", "North Pines", "Cedar Hills", "Lakeside Links"];

export function B2BLandingPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden="true" />
        <div className={styles.heroLayout}>
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>SIGNATURE SWINGS FOR CLUBS & EVENTS</p>
            <h1>CUSTOM GOLF ACCESSORIES FOR TOURNAMENTS, MEMBER GIFTS & EVENTS</h1>
            <p className={styles.heroCopy}>
              Premium engraved golf accessories designed for tournaments, golf clubs, corporate
              outings, and event gifting.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contact" className={styles.primaryButton}>
                REQUEST A QUOTE
              </Link>
              <Link href="#packages" className={styles.secondaryButton}>
                VIEW PACKAGES
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="events-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Built for Golf Events</p>
          <h2 id="events-heading">Premium gifts for every kind of golf gathering.</h2>
        </div>
        <div className={styles.eventGrid}>
          {eventTypes.map((eventType) => (
            <article className={styles.eventCard} key={eventType.title}>
              <span aria-hidden="true" />
              <h3>{eventType.title}</h3>
              <p>{eventType.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.packagesSection}`}
        id="packages"
        aria-labelledby="packages-heading"
      >
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Bulk Packages Built for Events</p>
          <h2 id="packages-heading">Start with a package, then tailor the details.</h2>
        </div>
        <div className={styles.packageGrid}>
          {packages.map((eventPackage) => (
            <article
              className={`${styles.packageCard}${
                eventPackage.featured ? ` ${styles.featuredPackage}` : ""
              }`}
              key={eventPackage.name}
            >
              {eventPackage.featured ? (
                <p className={styles.badge}>Most Popular</p>
              ) : null}
              <h3>{eventPackage.name}</h3>
              <p>{eventPackage.description}</p>
              <ul>
                {eventPackage.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className={styles.packageFooter}>
                <span>Starting at {eventPackage.price}</span>
                <Link href="/contact" className={styles.cardButton}>
                  Request Pricing
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.impactSection}`}
        id="bulk-pricing"
        aria-labelledby="impact-heading"
      >
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Increase Your Event Impact</p>
          <h2 id="impact-heading">More spend unlocks more ways to make the day memorable.</h2>
        </div>
        <div className={styles.spendGrid}>
          {spendTiers.map((tier) => (
            <article className={styles.spendCard} key={tier.spend}>
              <strong>{tier.spend}</strong>
              <p>{tier.benefit}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={styles.section}
        id="products"
        aria-labelledby="products-heading"
      >
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Popular Bulk Order Products</p>
          <h2 id="products-heading">Course-ready products for custom event packages.</h2>
        </div>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <article className={styles.productCard} key={product.name}>
              <div className={styles.productImage}>
                <Image src={product.image} alt="" fill sizes="(min-width: 900px) 31vw, 100vw" />
              </div>
              <div>
                <h3>{product.name}</h3>
                <p>{product.copy}</p>
                <span>Available for bulk customization</span>
              </div>
              <Link href="/contact" className={styles.cardButton}>
                Include in Package
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.stepsSection}`}
        id="how-it-works"
        aria-labelledby="steps-heading"
      >
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>How Bulk Ordering Works</p>
          <h2 id="steps-heading">A simple path from event idea to delivery.</h2>
        </div>
        <div className={styles.stepGrid}>
          {steps.map((step, index) => (
            <article className={styles.stepCard} key={step}>
              <span>{index + 1}</span>
              <h3>{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.proofSection} aria-labelledby="proof-heading">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Built for Memorable Golf Events</p>
          <h2 id="proof-heading">Trusted by golf teams, planners, and clubs.</h2>
        </div>
        <div className={styles.proofGrid}>
          <div className={styles.logoWall} aria-label="Placeholder club logos">
            {clubLogos.map((club) => (
              <span key={club}>{club}</span>
            ))}
          </div>
          <div className={styles.testimonials}>
            {testimonials.map((testimonial) => (
              <blockquote key={testimonial.club}>
                <p>&ldquo;{testimonial.quote}&rdquo;</p>
                <footer>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.club}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-cta-heading">
        <p className={styles.eyebrow}>Ready When You Are</p>
        <h2 id="final-cta-heading">Planning a tournament or club event?</h2>
        <p>Let&apos;s build a custom package that fits your event and budget.</p>
        <div className={styles.heroActions}>
          <Link href="/contact" className={styles.primaryButton}>
            Request a Quote
          </Link>
          <Link href="/contact" className={styles.secondaryButton}>
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
