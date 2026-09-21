export type ContactIcon = "cv" | "email" | "work" | "github" | "linkedin" | "company";

export type ContactLink = {
  label: string;
  value: string;
  href: string;
  icon: ContactIcon;
  download?: boolean;
};

/** Public contact details migrated from the original portfolio. */
export const CONTACT_LINKS: ContactLink[] = [
  {
    label: "Download CV",
    value: "ekram-tech-cv.pdf",
    href: "/cv/ekram-tech-cv.pdf",
    icon: "cv",
    download: true,
  },
  {
    label: "Personal email",
    value: "ekramjim002@gmail.com",
    href: "mailto:ekramjim002@gmail.com",
    icon: "email",
  },
  {
    label: "LynkSphere email",
    value: "ekram@lynksphere.com",
    href: "mailto:ekram@lynksphere.com",
    icon: "work",
  },
  {
    label: "GitHub",
    value: "github.com/ekramjim002",
    href: "https://github.com/ekramjim002",
    icon: "github",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/ekram02",
    href: "https://www.linkedin.com/in/ekram02",
    icon: "linkedin",
  },
  {
    label: "LynkSphere",
    value: "lynksphere.com",
    href: "https://lynksphere.com",
    icon: "company",
  },
];
