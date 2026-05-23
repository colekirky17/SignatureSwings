import type { ReactNode } from "react";

const categories = [
  {
    title: "Ball Markers",
    copy: "Engraved details made to mark every green.",
    accent: "Personalized",
  },
  {
    title: "Divot Tools",
    copy: "Course-ready tools with a premium custom finish.",
    accent: "Precision",
  },
  {
    title: "Club Links",
    copy: "Small custom touches for bags, clubs, and gifts.",
    accent: "Giftable",
  },
  {
    title: "Bundles",
    copy: "Curated sets for players, events, and special occasions.",
    accent: "Best value",
  },
];

const addOns = [
  "Extra ball markers",
  "Matching divot tools",
  "Club Links",
  "Gift-ready packaging",
];

const footerLinks = ["Ball Markers", "Divot Tools", "Club Links", "Bundles", "Custom Orders"];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlaceholderMedia({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(120,190,62,0.28),transparent_28%),linear-gradient(135deg,#17251d,#07110d_55%,#030806)] shadow-2xl shadow-black/30 ${
        tall ? "min-h-[420px]" : "min-h-[240px]"
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.14),transparent_32%,rgba(255,255,255,0.06)_64%,transparent)]" />
      <div className="absolute inset-x-6 bottom-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
        <span>{label}</span>
        <span className="h-2 w-2 rounded-full bg-[#77b943]" />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-[#77b943]">
      {children}
    </p>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#04100c]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#" className="flex items-center gap-3 text-white" aria-label="Signature Swings home">
          <span className="grid h-11 w-11 place-items-center rounded-md border border-white/20 bg-white text-lg font-black text-[#07110d]">
            SS
          </span>
          <span className="leading-tight">
            <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              Signature
            </span>
            <span className="block text-xl font-black uppercase tracking-[0.08em]">Swings</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-bold uppercase tracking-[0.12em] text-white/75 lg:flex">
          <a href="#categories" className="transition hover:text-white">
            Categories
          </a>
          <a href="#bundle" className="transition hover:text-white">
            Bundles
          </a>
          <a href="#gifts" className="transition hover:text-white">
            Groomsmen
          </a>
          <a href="#custom" className="transition hover:text-white">
            Custom
          </a>
        </nav>

        <a
          href="#categories"
          className="hidden items-center gap-2 rounded-md bg-[#0ba65a] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-[#0ba65a]/20 transition hover:bg-[#0fbd68] sm:flex"
        >
          Shop Soon
          <ArrowIcon />
        </a>

        <a
          href="#categories"
          className="grid h-11 w-11 place-items-center rounded-md border border-white/15 text-white sm:hidden"
          aria-label="Jump to categories"
        >
          <ArrowIcon />
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#06110d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_22%,rgba(119,185,67,0.18),transparent_30%),linear-gradient(90deg,#03100b_0%,rgba(3,16,11,0.9)_35%,rgba(3,16,11,0.38)_72%,#03100b_100%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-1/2 opacity-80 lg:block">
        <PlaceholderMedia label="Hero media placeholder" tall />
      </div>
      <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center px-5 py-20 sm:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-2xl">
          <SectionLabel>Premium Custom Golf Accessories</SectionLabel>
          <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-normal text-white sm:text-7xl lg:text-8xl">
            Personal Details For Every Round
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/72 sm:text-xl">
            Custom engraved ball markers, divot tools, Club Links, bundles, and gifts made to feel personal from the first look.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#categories"
              className="inline-flex items-center justify-center gap-3 rounded-md bg-[#0ba65a] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-xl shadow-[#0ba65a]/20 transition hover:bg-[#0fbd68]"
            >
              Shop By Category
              <ArrowIcon />
            </a>
            <a
              href="#custom"
              className="inline-flex items-center justify-center rounded-md border border-white/18 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white/88 transition hover:border-white/40 hover:text-white"
            >
              Custom Orders
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryCards() {
  return (
    <section id="categories" className="bg-[#04100c] px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <SectionLabel>Shop By Category</SectionLabel>
            <h2 className="text-3xl font-black uppercase tracking-normal text-white sm:text-5xl">
              Custom Pieces, Easy To Gift
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-white/65">
            Choose a starting point for personal accessories, event gifts, and curated sets.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <a
              key={category.title}
              href="#custom"
              className="group overflow-hidden rounded-lg border border-white/10 bg-[#081711] transition hover:-translate-y-1 hover:border-[#77b943]/60"
            >
              <PlaceholderMedia label={category.accent} />
              <div className="p-6">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#77b943]">
                  {category.accent}
                </p>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-black uppercase text-white">{category.title}</h3>
                  <span className="text-[#77b943] transition group-hover:translate-x-1">
                    <ArrowIcon />
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/65">{category.copy}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function BundleFeature() {
  return (
    <section id="bundle" className="border-y border-white/10 bg-[#07130f] px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <PlaceholderMedia label="Signature bundle placeholder" tall />
        <div>
          <SectionLabel>Signature Bundle</SectionLabel>
          <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
            A Complete Custom Set In One Giftable Box
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
            Pair engraved essentials into a polished bundle that feels ready for birthdays, tournaments, wedding parties, and client gifts.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Ball marker", "Divot tool", "Club Link"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-white">{item}</p>
                <p className="mt-2 text-sm leading-6 text-white/58">Designed to match.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GroomsmenGifts() {
  return (
    <section id="gifts" className="bg-[#04100c] px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <SectionLabel>Groomsmen Gifts</SectionLabel>
          <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
            Personal Golf Gifts For The Whole Group
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
            Create matching sets with names, initials, dates, or short messages for wedding parties and golf weekends.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {["Names and initials", "Wedding dates", "Group bundles", "Gift-ready presentation"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/78">
                <span className="h-2.5 w-2.5 rounded-full bg-[#77b943]" />
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <PlaceholderMedia label="Groomsmen gift placeholder" tall />
      </div>
    </section>
  );
}

function AddOnSection() {
  return (
    <section className="border-y border-white/10 bg-[#07130f] px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <SectionLabel>Add-Ons</SectionLabel>
            <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
              Build A Set Around The Main Gift
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {addOns.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
                <p className="text-lg font-black uppercase text-white">{item}</p>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  Simple add-on concept for future product pages and bundles.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomOrderCta() {
  return (
    <section id="custom" className="bg-[#04100c] px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-lg border border-[#77b943]/30 bg-[linear-gradient(135deg,rgba(119,185,67,0.16),rgba(255,255,255,0.04)_42%,rgba(11,166,90,0.1))] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="p-8 sm:p-12 lg:p-14">
          <SectionLabel>B2B And Custom Orders</SectionLabel>
          <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
            Made For Events, Clubs, Teams, And Corporate Gifts
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
            A clear path for bulk gifting, tournament favors, club-branded accessories, and custom requests.
          </p>
          <a
            href="mailto:hello@signatureswings.com"
            className="mt-9 inline-flex items-center gap-3 rounded-md bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#07110d] transition hover:bg-[#e8f3df]"
          >
            Start A Custom Order
            <ArrowIcon />
          </a>
        </div>
        <div className="min-h-[260px] border-t border-white/10 lg:border-l lg:border-t-0">
          <PlaceholderMedia label="Custom order placeholder" tall />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#020806] px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xl font-black uppercase tracking-[0.12em] text-white">Signature Swings</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
            Premium custom golf accessories for players, gifts, events, and branded orders.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold uppercase tracking-[0.12em] text-white/60">
          {footerLinks.map((link) => (
            <a key={link} href="#categories" className="transition hover:text-white">
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#04100c] text-white">
      <Header />
      <Hero />
      <CategoryCards />
      <BundleFeature />
      <GroomsmenGifts />
      <AddOnSection />
      <CustomOrderCta />
      <Footer />
    </main>
  );
}
