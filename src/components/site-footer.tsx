import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="brand footer-brand" href="/">
          <span className="brand-wordmark">
            <span className="brand-symbol">R</span>RentDeer
          </span>
        </Link>
        <p>Rent smarter. Live better.</p>
      </div>
      <div className="footer-links">
        <div>
          <strong>Explore</strong>
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/bulletin">Bulletin</Link>
        </div>
        <div>
          <strong>Discover</strong>
          <Link href="/properties">Properties</Link>
          <Link href="/services">Services</Link>
          <Link href="/contact">Contact Us</Link>
        </div>
        <div>
          <strong>Connect</strong>
          <a href="mailto:hello.rentdeer@gmail.com">Email Us</a>
          <a href="tel:+60192523804">Tenant Enquiries</a>
          <a
            href="https://www.tiktok.com/@rentdeer.com"
            target="_blank"
            rel="noreferrer"
          >
            TikTok
          </a>
          <a
            href="https://www.facebook.com/people/Rentdeercom/61557446064027/"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          <a
            href="https://www.instagram.com/rent.deer/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://www.youtube.com/@RentDeer_Channel"
            target="_blank"
            rel="noreferrer"
          >
            YouTube
          </a>
          <a
            href="https://www.threads.com/@rent.deer"
            target="_blank"
            rel="noreferrer"
          >
            Threads
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 RentDeer Sdn Bhd. All Rights Reserved.</span>
        <span>Privacy Policy&nbsp;&nbsp; · &nbsp;&nbsp;Terms of Use</span>
      </div>
    </footer>
  );
}
