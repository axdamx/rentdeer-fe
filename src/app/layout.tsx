import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentDeer | Rent Smarter. Live Better.",
  description:
    "RentDeer helps tenants find better rentals and supports landlords and property agents across Klang Valley.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
