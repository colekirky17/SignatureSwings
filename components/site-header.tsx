import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          Signature Swings
        </Link>
        <nav aria-label="Primary navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
