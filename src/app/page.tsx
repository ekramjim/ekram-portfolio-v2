import { About } from "@/components/About";
import { Galaxy } from "@/components/Galaxy";
import { Projects } from "@/components/Projects";
import { HIGHLIGHTS } from "@/data/projects";

export default function Home() {
  return (
    <main>
      <Galaxy title={["Hi, I'm", "Ekram."]} scrollScreens={2.5} />
      <About />
      <Projects projects={HIGHLIGHTS} heading="Projects" note="Highlights" footer={{ label: "See all projects →", href: "/projects" }} />
    </main>
  );
}
