import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import GalaxyCursor from "@/components/ui/GalaxyCursor";
import "./globals.css";

// The Galaxy overlay reads this font through the --font-space-mono variable.
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ekram — Portfolio",
  description: "Co-founder · Bioinformatician · Computer scientist",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={spaceMono.variable}>
        <GalaxyCursor />
        {children}
      </body>
    </html>
  );
}
