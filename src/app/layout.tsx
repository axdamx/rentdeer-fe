import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Estatein | Find Your Dream Property",
  description:
    "A refined real estate experience for finding your next home or investment.",
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
