import type { Metadata } from "next";
import { Projects } from "@/components/Projects";
import { PROJECTS } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects — Ekram",
  description: "Everything Ekram has built across mobile, web and data science.",
};

export default function AllProjects() {
  return (
    <main>
      <Projects
        projects={PROJECTS}
        heading="All projects"
        note={`${PROJECTS.length} projects`}
        footer={{ label: "← Back to home", href: "/" }}
      />
    </main>
  );
}
