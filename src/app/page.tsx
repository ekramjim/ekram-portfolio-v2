import { Galaxy } from "@/components/Galaxy";

export default function Home() {
  return (
    <main>
      <Galaxy title={["Hi, I'm", "Ekram."]} scrollScreens={2.5} />
    </main>
  );
}
