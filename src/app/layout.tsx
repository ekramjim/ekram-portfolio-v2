import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GalaxyCursor from "@/components/ui/GalaxyCursor";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

// The site's only typefaces. They are exposed as --font-sans / --font-mono in globals.css; nothing else loads a font.
const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  // Resolves the relative URLs below (the link-preview image, canonicals) to the live domain.
  metadataBase: new URL("https://www.ekram.tech"),
  title: "Ekram — Portfolio",
  description: "I build software end to end, from iOS apps to 3D websites to data models.",
  // Each page's own title and description are reused for previews; the banner comes from opengraph-image.jpg.
  openGraph: { type: "website", siteName: "Ekram", locale: "en_AU" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "./" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <GalaxyCursor />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
