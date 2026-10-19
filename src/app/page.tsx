import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Galaxy } from "@/components/Galaxy";
import { Leadership } from "@/components/Leadership";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { FEATURED_PROJECTS, PROJECTS } from "@/data/projects";

export default function Home() {
  return (
    <main id="top">
      <Galaxy title={["Hi, I'm", "Ekram."]} scrollScreens={1.6} />
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
