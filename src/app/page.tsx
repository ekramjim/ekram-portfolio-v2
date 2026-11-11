import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Leadership } from "@/components/Leadership";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { SmokeHero } from "@/components/Smoke";
import DesignStrip from "@/components/Design/DesignStrip";
import { DESIGN } from "@/data/design";
import { FEATURED_PROJECTS, PROJECTS } from "@/data/projects";

export default function Home() {
  return (
    <main id="top">
      <SmokeHero
        greeting="Hi, I'm"
        name="Ekram"
        roles={["Software Developer", "Designer", "Data Scientist", "Entrepreneur"]}
        links={[
          {
            label: "Software projects",
            href: "/projects",
            thumbs: ["/design/shepherd-icon-light.webp", "/design/usage-finder-icon-light.webp", "/projects/f1/dashboard.webp"],
          },
          {
            label: "Design work",
            href: "/design",
            thumbs: ["/design/budly/08-home.webp", "/design/shepherd-cover-v2.webp", "/design/allegro/midnight-rich.webp"],
          },
        ]}
      />
      <About />
      <Experience />
      <Projects
        projects={FEATURED_PROJECTS}
        heading="Projects"
        note="Highlights"
        featured
        footer={{ label: "See all projects →", href: "/projects" }}
        footerAlt={{ label: "See the design work →", href: "/design" }}
        gridHeading={{ title: "Software & data", note: "iOS · macOS · Web · Bioinformatics" }}
      >
        <DesignStrip pieces={DESIGN} />
      </Projects>
      <Skills />
      <Leadership />
      <Contact />
      <Footer />
    </main>
  );
}
