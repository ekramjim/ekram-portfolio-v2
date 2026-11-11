import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { Design } from "@/components/Design";
import { DESIGN } from "@/data/design";

// Fraunces for this page only (the rest of the site uses Geist): the hero's type card shows it, as Budly's own face.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["SOFT", "WONK", "opsz"] });

export const metadata: Metadata = {
  title: "Design — Ekram",
  description: "App screens, app icons, App Store artwork and wallpapers Ekram designed in Figma and Icon Composer.",
  alternates: { canonical: "/design" },
  openGraph: {
    title: "Design — Ekram",
    description: "App screens, app icons, App Store artwork and wallpapers designed in Figma.",
    url: "/design",
    images: ["/design/shepherd-cover-v2.webp"],
  },
};

export default function DesignPage() {
  return (
    <main className={fraunces.variable}>
      <Design pieces={DESIGN} />
    </main>
  );
}
