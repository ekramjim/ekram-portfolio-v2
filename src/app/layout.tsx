import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GalaxyCursor from "@/components/ui/GalaxyCursor";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

// The site's only typefaces. They are exposed as --font-sans / --font-mono in globals.css; nothing else loads a font.
const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Ekram — Portfolio",
  description: "Co-founder · Bioinformatician · Computer scientist",
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
