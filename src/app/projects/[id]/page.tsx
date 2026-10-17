import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Projects } from "@/components/Projects";
import { PROJECTS } from "@/data/projects";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

/** Every project has a static page; any other id is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) return {};
  const title = `${project.name} — Ekram`;
  return {
    title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      title,
      description: project.summary,
      url: `/projects/${project.id}`,
      ...(project.screenshots?.length ? { images: [project.screenshots[0]] } : {}),
    },
  };
}

/** The projects page, arriving with one project already open. */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  if (!PROJECTS.some((p) => p.id === id)) notFound();
  return (
    <main>
      <Projects
        projects={PROJECTS}
        heading="All projects"
        note={`${PROJECTS.length} projects`}
        footer={{ label: "← Back to home", href: "/" }}
        initialId={id}
      />
    </main>
  );
}
