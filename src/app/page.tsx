import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Leadership } from "@/components/Leadership";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { SmokeHero } from "@/components/Smoke";
import { FEATURED_PROJECTS, PROJECTS } from "@/data/projects";

export default function Home() {
  return (
    <main id="top">
      <SmokeHero greeting="Hi, I'm" name="Ekram" roles={["Software Developer", "Data Scientist", "Entrepreneur"]} />
      <About />
      <Experience />
      <Projects
        projects={FEATURED_PROJECTS}
        heading="Projects"
        note="Highlights"
        featured
        footer={{ label: `See all ${PROJECTS.length} projects →`, href: "/projects" }}
      />
      <Skills />
      <Leadership />
      <Contact />
      <Footer />
    </main>
  );
}
