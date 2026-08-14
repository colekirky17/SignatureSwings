"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CartIndicator } from "./cart-indicator";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact Us" },
];

const b2bNavigation = [
  { href: "#products", label: "Products" },
  { href: "#packages", label: "Packages" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#bulk-pricing", label: "Bulk Pricing" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const isB2BLandingPage = pathname === "/Clubs" || pathname === "/tournament-gifts";
  const activeNavigation = isB2BLandingPage ? b2bNavigation : navigation;

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="site-header">
      <div
        className={`container site-header-inner${isB2BLandingPage ? " is-b2b" : ""}`}
      >
        <Link href="/" className="brand" onClick={() => setIsMenuOpen(false)}>
          <img
            src="/images/signature-swings-white-script.png"
            alt="Signature Swings"
            className="brand-logo"
            width="889"
            height="270"
          />
        </Link>
        <button
          ref={menuButtonRef}
          type="button"
          className="menu-toggle"
          aria-controls="primary-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          <span>Menu</span>
          <span className={`menu-icon${isMenuOpen ? " is-open" : ""}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        <nav
          id="primary-navigation"
          aria-label="Primary navigation"
          className={`nav-links${isMenuOpen ? " is-open" : ""}`}
        >
          {activeNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isB2BLandingPage ? (
            <Link
              href="/contact"
              className="header-quote-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Request a Quote
            </Link>
          ) : (
            <CartIndicator onNavigate={() => setIsMenuOpen(false)} />
          )}
        </nav>
      </div>
    </header>
  );
}
