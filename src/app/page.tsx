import { Galaxy } from "@/components/Galaxy";
import { Projects } from "@/components/Projects";

export default function Home() {
  return (
    <main>
      <Galaxy title={["Hi, I'm", "Ekram."]} scrollScreens={2.5} />
      <Projects />
    </main>
  );
}
