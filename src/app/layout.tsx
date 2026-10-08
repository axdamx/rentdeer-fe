import type { Metadata } from "next";
import localFont from "next/font/local";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/video-plugin/index.css";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "yet-another-react-lightbox/styles.css";
import Providers from "./providers";

const handwritten = localFont({
  src: "../../public/fonts/caveat/Caveat-VariableFont_wght.ttf",
  variable: "--font-handwritten",
  weight: "400 700",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RentDeer | Rent Smarter. Live Better.",
  description:
    "RentDeer helps tenants find better rentals and supports landlords and property agents across Klang Valley.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={handwritten.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
