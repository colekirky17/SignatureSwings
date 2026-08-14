import Image from "next/image";
import Link from "next/link";
import styles from "./b2b-landing-page.module.css";

const eventTypes = [
  {
    title: "Tournament Tee Gifts",
    copy: "Elevate your tournament with custom gifts players will keep.",
    icon: "trophy",
  },
  {
    title: "Member-Guest Gifts",
    copy: "Strengthen member relationships with premium personalized gifts.",
    icon: "members",
  },
  {
    title: "Corporate Outings",
    copy: "Make a lasting impression at corporate golf events.",
    icon: "briefcase",
  },
  {
    title: "Pro Shop / Club Orders",
    copy: "Stock your shop with high-quality, custom-branded accessories.",
    icon: "clubhouse",
  },
] as const;

const packages = [
  {
    name: "Starter Package",
    description: "Great for smaller outings.",
    outro: "A simple, affordable package for smaller golf events and club gifts.",
    items: ["Custom Ball Markers", "Divot Tools"],
    price: "$___",
    icon: "flag",
    featured: false,
  },
  {
    name: "Tournament Package",
    description: "Our most popular all-in-one option.",
    outro: "Everything you need for a successful tournament experience.",
    items: ["Ball Markers", "Divot Tools", "Club Links"],
    price: "$___",
    icon: "trophy",
    featured: true,
  },
  {
    name: "Premium Event Package",
    description: "Ideal for premium tournaments or corporate gifting.",
    outro: "Elevate your event with premium presentation and exclusive add-ons.",
    items: [
      "Ball Markers",
      "Divot Tools",
      "Club Links",
      "Bonus add-on / premium presentation",
    ],
    price: "$___",
    icon: "star",
    featured: false,
  },
] as const;

const spendTiers = [
  {
    spend: "Spend $2,000+",
    benefit: "Add a bonus door prize",
    icon: "gift",
  },
  {
    spend: "Spend $3,500+",
    benefit: "Add premium event giveaway options",
    icon: "gift",
  },
  {
    spend: "Spend $5,000+",
    benefit: "Unlock custom package support",
    icon: "crown",
  },
] as const;

const products = [
  {
    name: "Ball Markers",
    image: "/images/category-ball-markers.jpg",
    copy: "High-quality metal markers engraved with your logo or event design.",
  },
  {
    name: "Divot Tools",
    image: "/images/category-divot-tools.jpg",
    copy: "Durable, precision-crafted tools that combine function and style.",
  },
  {
    name: "Club Links",
    image: "/images/category-club-links.jpg",
    copy: "Magnetic links that stay secure and showcase your brand on the course.",
  },
];

const steps = [
  {
    title: "Tell us about your event",
    copy: "Share event details, quantities, and customization needs.",
    icon: "chat",
  },
  {
    title: "Choose your products or package",
    copy: "Select items or a package that fits your event.",
    icon: "bag",
  },
  {
    title: "Approve your design",
    copy: "We provide a digital proof for your approval.",
    icon: "pencil",
  },
  {
    title: "We produce and ship your order",
    copy: "Quality crafted, on time, and ready for your event.",
    icon: "truck",
  },
] as const;

const testimonials = [
  {
    quote:
      "Signature Swings elevated our member-guest weekend. The quality and presentation were second to none.",
    name: "Jason R.",
    club: "Oak Hills Country Club",
    mark: "crest",
  },
  {
    quote:
      "Our corporate clients love these gifts. Professional, unique, and always a hit on the course.",
    name: "Melissa T.",
    club: "Event Director, Fairway Events",
    mark: "fairway",
  },
  {
    quote:
      "We order every year for our tournament. The team is easy to work with and always delivers.",
    name: "Mark L.",
    club: "Golf Classic Organizer",
    mark: "clubs",
  },
] as const;

const clubLogos = [
  "Oak Hills Country Club",
  "Pineview Golf Club",
  "Fairway Events",
  "Summit Golf Club",
  "Riverwood Country Club",
  "Greenbriar Golf Club",
];

type EventIconName = (typeof eventTypes)[number]["icon"];
type AccentIconName =
  | (typeof packages)[number]["icon"]
  | (typeof spendTiers)[number]["icon"]
  | (typeof steps)[number]["icon"]
  | (typeof testimonials)[number]["mark"];

function EventIcon({ name }: { name: EventIconName }) {
  const commonProps = {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "trophy") {
    return (
      <svg {...commonProps}>
        <path d="M22 12h20v10c0 8-4 15-10 15S22 30 22 22V12Z" />
        <path d="M22 17H11v5c0 7 5 12 13 12" />
        <path d="M42 17h11v5c0 7-5 12-13 12" />
        <path d="M32 37v10" />
        <path d="M22 52h20" />
        <path d="M26 47h12" />
      </svg>
    );
  }

  if (name === "members") {
    return (
      <svg {...commonProps}>
        <circle cx="24" cy="25" r="8" />
        <circle cx="42" cy="23" r="7" />
        <path d="M10 50c2-10 8-15 15-15s13 5 15 15" />
        <path d="M36 36c7 1 12 6 14 14" />
      </svg>
    );
  }

  if (name === "briefcase") {
    return (
      <svg {...commonProps}>
        <path d="M12 24h40v27H12z" />
        <path d="M24 24v-8h16v8" />
        <path d="M12 34h40" />
        <path d="M28 34h8" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M12 49h40" />
      <path d="M18 49V30h28v19" />
      <path d="M14 30h36L32 16 14 30Z" />
      <path d="M32 16V8" />
      <path d="M32 8h7" />
      <path d="M25 49V37h14v12" />
    </svg>
  );
}

function AccentIcon({ name }: { name: AccentIconName }) {
  const commonProps = {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "flag") {
    return (
      <svg {...commonProps}>
        <path d="M20 54V10" />
        <path d="M20 13h26l-6 9 6 9H20" />
      </svg>
    );
  }

  if (name === "trophy") {
    return <EventIcon name="trophy" />;
  }

  if (name === "star") {
    return (
      <svg {...commonProps}>
        <path d="m32 10 6 14 15 1-12 10 4 15-13-8-13 8 4-15-12-10 15-1 6-14Z" />
      </svg>
    );
  }

  if (name === "gift") {
    return (
      <svg {...commonProps}>
        <path d="M12 28h40v26H12z" />
        <path d="M9 20h46v9H9z" />
        <path d="M32 20v34" />
        <path d="M32 20c-8 0-12-3-12-7 0-3 2-5 5-5 5 0 7 6 7 12Z" />
        <path d="M32 20c8 0 12-3 12-7 0-3-2-5-5-5-5 0-7 6-7 12Z" />
      </svg>
    );
  }

  if (name === "crown") {
    return (
      <svg {...commonProps}>
        <path d="m12 46 5-24 12 13 11-20 7 20 12-13-5 24H12Z" />
        <path d="M16 53h32" />
      </svg>
    );
  }

  if (name === "chat") {
    return (
      <svg {...commonProps}>
        <path d="M12 16h40v27H25L14 53v-10h-2V16Z" />
        <path d="M23 29h1M32 29h1M41 29h1" />
      </svg>
    );
  }

  if (name === "bag") {
    return (
      <svg {...commonProps}>
        <path d="M16 24h32l4 30H12l4-30Z" />
        <path d="M24 24a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  if (name === "pencil") {
    return (
      <svg {...commonProps}>
        <path d="m16 46 5-14 24-24 11 11-24 24-16 3Z" />
        <path d="m38 15 11 11" />
      </svg>
    );
  }

  if (name === "truck") {
    return (
      <svg {...commonProps}>
        <path d="M8 20h31v25H8z" />
        <path d="M39 30h10l7 8v7H39z" />
        <circle cx="19" cy="49" r="4" />
        <circle cx="49" cy="49" r="4" />
      </svg>
    );
  }

  if (name === "fairway") {
    return (
      <svg {...commonProps}>
        <path d="M32 8v44" />
        <path d="M32 13c9 2 13 7 16 13-7-2-12-1-16 3" />
        <path d="M18 52h28" />
      </svg>
    );
  }

  if (name === "clubs") {
    return (
      <svg {...commonProps}>
        <path d="M20 12 46 50" />
        <path d="M44 12 18 50" />
        <circle cx="17" cy="9" r="4" />
        <circle cx="47" cy="9" r="4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M32 7c8 6 15 7 22 8v15c0 14-9 23-22 28C19 53 10 44 10 30V15c7-1 14-2 22-8Z" />
      <path d="m22 33 7 7 14-16" />
    </svg>
  );
}

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

      <section
        className={`${styles.section} ${styles.eventSection}`}
        aria-labelledby="events-heading"
      >
        <div className={`${styles.sectionHeader} ${styles.eventHeader}`}>
          <p className={styles.eyebrow}>Built for Golf Events</p>
          <h2 id="events-heading" className={styles.visuallyHidden}>
            Premium gifts for every kind of golf gathering.
          </h2>
        </div>
        <div className={styles.eventGrid}>
          {eventTypes.map((eventType) => (
            <article className={styles.eventCard} key={eventType.title}>
              <span className={styles.eventIcon}>
                <EventIcon name={eventType.icon} />
              </span>
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
              <div className={styles.packageIntro}>
                <span className={styles.packageIcon}>
                  <AccentIcon name={eventPackage.icon} />
                </span>
                <div>
                  <h3>{eventPackage.name}</h3>
                  <p>{eventPackage.description}</p>
                </div>
              </div>
              <ul>
                {eventPackage.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className={styles.packageOutro}>{eventPackage.outro}</p>
              <div className={styles.packageFooter}>
                <span>Starting at {eventPackage.price}</span>
                <Link
                  href="/contact"
                  className={`${styles.cardButton}${
                    eventPackage.featured ? ` ${styles.goldButton}` : ""
                  }`}
                >
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
        <div className={`${styles.sectionHeader} ${styles.compactCenteredHeader}`}>
          <p className={styles.eyebrow}>Increase Your Event Impact</p>
          <h2 id="impact-heading" className={styles.visuallyHidden}>
            More spend unlocks more ways to make the day memorable.
          </h2>
        </div>
        <div className={styles.spendGrid}>
          {spendTiers.map((tier) => (
            <article className={styles.spendCard} key={tier.spend}>
              <span className={styles.spendIcon}>
                <AccentIcon name={tier.icon} />
              </span>
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
        <div className={`${styles.sectionHeader} ${styles.compactCenteredHeader}`}>
          <p className={styles.eyebrow}>Popular Bulk Order Products</p>
          <h2 id="products-heading" className={styles.visuallyHidden}>
            Course-ready products for custom event packages.
          </h2>
        </div>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <article className={styles.productCard} key={product.name}>
              <div className={styles.productImage}>
                <Image src={product.image} alt="" fill sizes="(min-width: 900px) 31vw, 100vw" />
              </div>
              <div className={styles.productBody}>
                <h3>{product.name}</h3>
                <p>{product.copy}</p>
                <span>Available for bulk customization</span>
                <Link href="/contact" className={styles.cardButton}>
                  Include in Package
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.stepsSection}`}
        id="how-it-works"
        aria-labelledby="steps-heading"
      >
        <div className={`${styles.sectionHeader} ${styles.compactCenteredHeader}`}>
          <p className={styles.eyebrow}>How Bulk Ordering Works</p>
          <h2 id="steps-heading" className={styles.visuallyHidden}>
            A simple path from event idea to delivery.
          </h2>
        </div>
        <div className={styles.stepGrid}>
          {steps.map((step, index) => (
            <article className={styles.stepCard} key={step.title}>
              <span className={styles.stepIcon}>
                <AccentIcon name={step.icon} />
              </span>
              <div>
                <h3>
                  {index + 1}. {step.title}
                </h3>
                <p>{step.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.proofSection} aria-labelledby="proof-heading">
        <div className={`${styles.sectionHeader} ${styles.proofHeader}`}>
          <p className={styles.eyebrow}>Built for Memorable Golf Events</p>
          <h2 id="proof-heading">
            Designed to help golf clubs, tournament organizers, and brands create gifts players
            actually remember.
          </h2>
        </div>
        <div className={styles.proofGrid}>
          <div className={styles.testimonials}>
            {testimonials.map((testimonial) => (
              <blockquote key={testimonial.club}>
                <span className={styles.quoteMark}>&ldquo;</span>
                <p>&ldquo;{testimonial.quote}&rdquo;</p>
                <footer>
                  <span className={styles.testimonialMark}>
                    <AccentIcon name={testimonial.mark} />
                  </span>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.club}</span>
                </footer>
              </blockquote>
            ))}
          </div>
          <div className={styles.logoWall} aria-label="Placeholder club logos">
            {clubLogos.map((club) => (
              <span key={club}>{club}</span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-cta-heading">
        <div>
          <h2 id="final-cta-heading">Planning a tournament or club event?</h2>
        </div>
        <div>
          <p>Let&apos;s build a custom package that fits your event and budget.</p>
          <div className={styles.heroActions}>
          <Link href="/contact" className={styles.primaryButton}>
            Request a Quote
          </Link>
          <Link href="/contact" className={styles.secondaryButton}>
            Contact Us
          </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
