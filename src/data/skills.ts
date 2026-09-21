export interface Skill {
  name: string;
  /** How strong, 0–100. Sets a skill's star size and brightness, and is never shown as a number. */
  pct: number;
}

export interface SkillGroup {
  label: string;
  skills: Skill[];
}

/** 1 (faintest) to 5 (strongest). */
export const levelOf = (pct: number) => (pct >= 88 ? 5 : pct >= 80 ? 4 : pct >= 72 ? 3 : pct >= 64 ? 2 : 1);

export const SKILL_GROUPS: SkillGroup[] = [
  {
    label: "Languages",
    skills: [
      { name: "Python", pct: 92 },
      { name: "TypeScript", pct: 88 },
      { name: "HTML/CSS/Tailwind", pct: 88 },
      { name: "JavaScript", pct: 86 },
      { name: "Swift", pct: 80 },
      { name: "SQL", pct: 80 },
      { name: "R", pct: 74 },
      { name: "Java", pct: 72 },
      { name: "Kotlin", pct: 68 },
      { name: "Bash", pct: 62 },
    ],
  },
  {
    label: "Technologies",
    skills: [
      { name: "Next.js", pct: 92 },
      { name: "ReactJS", pct: 88 },
      { name: "iOS", pct: 82 },
      { name: "NodeJS", pct: 80 },
      { name: "Android", pct: 74 },
      { name: "MongoDB", pct: 74 },
      { name: "Flutter", pct: 68 },
      { name: "AWS", pct: 58 },
      { name: "Google Cloud", pct: 54 },
    ],
  },
  {
    label: "Data & Bioinformatics",
    skills: [
      { name: "Pandas", pct: 88 },
      { name: "NumPy", pct: 86 },
      { name: "Scikit-learn", pct: 76 },
      { name: "RNA-seq analysis", pct: 74 },
      { name: "PyTorch", pct: 70 },
      { name: "limma", pct: 70 },
      { name: "DESeq2", pct: 70 },
      { name: "TensorFlow", pct: 66 },
      { name: "GO enrichment", pct: 66 },
      { name: "Bioconductor", pct: 64 },
    ],
  },
  {
    label: "Tools",
    skills: [
      { name: "VS Code", pct: 92 },
      { name: "Git/GitHub", pct: 90 },
      { name: "RStudio", pct: 84 },
      { name: "Jupyter", pct: 84 },
      { name: "Xcode", pct: 76 },
      { name: "Tableau", pct: 74 },
      { name: "Firebase", pct: 72 },
      { name: "GeminiAPI", pct: 70 },
      { name: "Docker", pct: 64 },
    ],
  },
  {
    label: "Soft Skills",
    skills: [
      { name: "Leadership", pct: 90 },
      { name: "Technical Communication", pct: 88 },
      { name: "Decision Making", pct: 84 },
      { name: "Public Speaking", pct: 80 },
      { name: "Agile Methodologies", pct: 78 },
      { name: "Mentorship", pct: 76 },
      { name: "Negotiation", pct: 70 },
      { name: "Conflict Resolution", pct: 68 },
    ],
  },
];
