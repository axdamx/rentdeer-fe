"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import type { SiteSettingsInput } from "@/lib/listing-schema";

type SiteFooterProps = {
  tone?: "default" | "dark";
};

export default function SiteFooter({ tone = "dark" }: SiteFooterProps) {
  const fallbackSocialLinks = [
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
  const settingsQuery = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiRequest<{ data: SiteSettingsInput }>("/api/settings"),
    staleTime: 5 * 60_000,
  });
  const settings = settingsQuery.data?.data;
  const socialMarks = Object.fromEntries(
    fallbackSocialLinks.map((link) => [link.label, link.mark]),
  );
  const socialLinks = settings?.socialLinks.length
    ? settings.socialLinks
        .filter((link) => link.isVisible && link.url)
        .map((link) => ({
          label: link.platform,
          href: link.url,
          mark: socialMarks[link.platform] ?? "↗",
        }))
    : fallbackSocialLinks;
  const tenantPhone = settings?.tenantPhone || "+6019 252 3804";
  const companyEmail = settings?.companyEmail || "hello.rentdeer@gmail.com";
  const companyAddress =
    settings?.companyAddress ||
    "S-036 & S-042, Seasons Square, Jalan PJU 10/3C, Damansara Damai, 47830 Petaling Jaya, Selangor, Malaysia";

  return (
    <footer
      className={
        tone === "dark" ? "site-footer site-footer-dark" : "site-footer"
      }
    >
      <div className="site-footer-inner">
        <div className="footer-find-us">
          <Link className="brand footer-brand" href="/">
            {settings?.logo ? (
              <Image
                className="brand-logo-image"
                src={settings.logo.url}
                alt={settings.logo.alt || `${settings.siteName} logo`}
                width={180}
                height={54}
                unoptimized
              />
            ) : (
              <span className="brand-wordmark">
                <span className="brand-symbol">R</span>RentDeer
              </span>
            )}
          </Link>
          <strong className="footer-column-label">Find Us</strong>
          <p>{companyAddress}</p>
          <div className="footer-contact-list">
            <a href={`tel:${tenantPhone.replace(/\s/g, "")}`}>
              <span aria-hidden="true">⌕</span> Contact Us
            </a>
            <a href={`mailto:${companyEmail}`}>
              <span aria-hidden="true">✉</span> {companyEmail}
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
