import Link from "next/link";

const footerNavigation = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

const futureResources = ["Terms of Service", "Shipping & Returns"];
const socialChannels = ["Facebook", "Instagram", "TikTok"];

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand">
            Signature Swings
          </Link>
          <p>Premium custom golf accessories made for meaningful rounds and memorable gifts.</p>
        </div>

        <nav className="footer-group" aria-label="Footer navigation">
          <h2>Explore</h2>
          {footerNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="footer-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="footer-group" aria-label="Future customer resources">
          <h2>Support</h2>
          <Link href="/faq" className="footer-link">
            FAQ
          </Link>
          {futureResources.map((resource) => (
            <span key={resource} className="footer-placeholder">
              {resource}
            </span>
          ))}
        </div>

        <div className="footer-group">
          <h2>Follow Us</h2>
          <div className="social-links" aria-label="Social channels coming soon">
            {socialChannels.map((channel) => (
              <span key={channel} className="social-link">
                {channel}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="container footer-meta">
        <p>Signature Swings</p>
        <p>All rights reserved.</p>
      </div>
    </footer>
  );
}
