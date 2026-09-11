import Link from "next/link";

type SiteFooterProps = {
  tone?: "default" | "dark";
};

export default function SiteFooter({ tone = "dark" }: SiteFooterProps) {
  const socialLinks = [
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@rentdeer.com",
      mark: "♪",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/people/Rentdeercom/61557446064027/",
      mark: "f",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/rent.deer/",
      mark: "◎",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@RentDeer_Channel",
      mark: "▶",
    },
    {
      label: "Threads",
      href: "https://www.threads.com/@rent.deer",
      mark: "@",
    },
  ];

  return (
    <footer
      className={
        tone === "dark" ? "site-footer site-footer-dark" : "site-footer"
      }
    >
      <div className="site-footer-inner">
        <div className="footer-find-us">
          <Link className="brand footer-brand" href="/">
            <span className="brand-wordmark">
              <span className="brand-symbol">R</span>RentDeer
            </span>
          </Link>
          <strong className="footer-column-label">Find Us</strong>
          <p>
            S-036 &amp; S-042, Seasons Square,
            <br />
            Jalan PJU 10/3C, Damansara Damai,
            <br />
            47830 Petaling Jaya, Selangor,
            <br />
            Malaysia
          </p>
          <div className="footer-contact-list">
            <a href="tel:+60192523804">
              <span aria-hidden="true">⌕</span> Contact Us
            </a>
            <a href="mailto:hello.rentdeer@gmail.com">
              <span aria-hidden="true">✉</span> hello.rentdeer@gmail.com
            </a>
          </div>
        </div>
        <nav className="footer-links" aria-label="Explore RentDeer">
          <div>
            <strong>Explore RentDeer</strong>
            <Link href="/about">About Us</Link>
            <Link href="/services">Services</Link>
            <Link href="/about#rental-belief">Our Story</Link>
            <Link href="/faq">FAQ</Link>
          </div>
        </nav>
        <div className="footer-socials">
          <strong className="footer-column-label">Stay Connected</strong>
          <div className="footer-social-list">
            {socialLinks.map((social) => (
              <a
                href={social.href}
                key={social.label}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                title={social.label}
              >
                {social.mark}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            When you&apos;re next with our services, facilities, tools, or
            managing one of our affordable spaces, always be open to new ideas
            and technologies for a better rental experience.
          </p>
          <span>© 2026 RentDeer Sdn Bhd. All Rights Reserved.</span>
          <span>Privacy Policy&nbsp;&nbsp; · &nbsp;&nbsp;Terms of Use</span>
        </div>
      </div>
    </footer>
  );
}
