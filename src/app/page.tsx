import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Galaxy } from "@/components/Galaxy";
import { Leadership } from "@/components/Leadership";
import { Projects } from "@/components/Projects";
import { Skills } from "@/components/Skills";
import { PROJECTS } from "@/data/projects";

export default function Home() {
  return (
    <main>
      <Galaxy title={["Hi, I'm", "Ekram."]} scrollScreens={2.5} />
      <About />
      <Projects projects={PROJECTS} heading="Projects" note="Highlights" />
      <Experience />
      <Skills />
      <Leadership />
    </main>
  );
}
