/** One group of skills, as on the CV. The first `core` are the ones used most, and are set brighter. */
export interface SkillGroup {
  label: string;
  skills: string[];
  core: number;
}

// Kept in step with the CV's Technical Skills (ekram-tech-cv-v2.tex).
export const SKILL_GROUPS: SkillGroup[] = [
  {
    label: "Languages",
    skills: ["Swift", "TypeScript", "Python", "SQL", "JavaScript", "Java", "Kotlin", "R", "Bash", "HTML", "CSS"],
    core: 4,
  },
  {
    label: "Apple platforms",
    skills: [
      "SwiftUI", "AppKit", "UIKit", "Swift Concurrency", "CloudKit", "WidgetKit", "ActivityKit",
      "Push Notifications", "Swift Testing", "Xcode", "TestFlight", "App Store Connect",
    ],
    core: 4,
  },
  {
    label: "Web & mobile",
    skills: ["Next.js", "React", "React Native", "Expo", "Node.js", "Tailwind CSS", "Framer Motion", "Three.js", "REST APIs", "Flutter"],
    core: 4,
  },
  {
    label: "Data & cloud",
    skills: ["Supabase", "PostgreSQL", "Row-Level Security", "Drizzle ORM", "Stripe", "Vercel", "MongoDB", "Firebase", "AWS", "Google Cloud", "Docker", "Git"],
    core: 4,
  },
  {
    label: "Data science & ML",
    skills: ["Pandas", "NumPy", "SciPy", "Scikit-learn", "PyTorch", "TensorFlow", "CatBoost", "PySpark", "Tableau", "Jupyter", "RStudio"],
    core: 4,
  },
  {
    label: "Bioinformatics",
    skills: ["Proteomics", "RNA-seq analysis", "limma", "DESeq2", "Bioconductor", "GO enrichment"],
    core: 3,
  },
  {
    label: "Design",
    skills: ["Figma", "Prototyping", "Components", "Auto Layout", "Icon Composer", "Human Interface Guidelines", "Liquid Glass"],
    core: 2,
  },
  {
    label: "AI tools",
    skills: ["Claude Code", "Codex", "Gemini API", "LLM APIs"],
    core: 2,
  },
];
