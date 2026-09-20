import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Space_Mono } from "next/font/google";
import GalaxyCursor from "@/components/ui/GalaxyCursor";
import "./globals.css";

// The Galaxy overlay reads this font through the --font-space-mono variable.
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

// Display and body faces for the projects section.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Ekram — Portfolio",
  description: "Co-founder · Bioinformatician · Computer scientist",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} ${display.variable} ${sans.variable}`}>
        <GalaxyCursor />
        {children}
      </body>
    </html>
  );
}
