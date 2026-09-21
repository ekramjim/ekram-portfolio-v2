export type LeadershipIcon =
  | "rocket-launch"
  | "presentation-chart"
  | "microphone-stage"
  | "globe-hemisphere-east"
  | "map-trifold"
  | "chalkboard-teacher"
  | "hands-clapping";

export interface LeadershipItem {
  title: string;
  location: string;
  /** Short label for the kind of role, e.g. "Public Speaking". */
  type: string;
  description: string;
  icon: LeadershipIcon;
}

export const LEADERSHIP: LeadershipItem[] = [
  {
    title: "Monash Generator Representative",
    location: "Melbourne, Australia",
    type: "Representation",
    description: "Represented Monash Generator at new student orientation, briefing incoming cohorts on entrepreneurship programs, startup resources, and business development opportunities.",
    icon: "rocket-launch",
  },
  {
    title: "Kingston Business Network",
    location: "Melbourne, Australia",
    type: "Startup Pitch",
    description: "Represented LynkSphere and delivered a startup-focused talk on how founders can start, position, and grow a successful business.",
    icon: "presentation-chart",
  },
  {
    title: "BNI Melbourne",
    location: "Melbourne, Australia",
    type: "Business Story",
    description: "Took part in BNI Melbourne's short story program, presenting LynkSphere's work in software and startup development to a business audience.",
    icon: "microphone-stage",
  },
  {
    title: "Go-Global Day Representative",
    location: "Sunway, Malaysia",
    type: "Public Speaking",
    description: "Represented Monash Prato campus to 200+ students of Monash University Malaysia as the main event representative.",
    icon: "globe-hemisphere-east",
  },
  {
    title: "Pisa Tour Leader",
    location: "Pisa, Italy",
    type: "Tour Leadership",
    description: "Guided a group of 5 students across Pisa, delivering a speech on the historical significance of key sites including the Leaning Tower of Pisa.",
    icon: "map-trifold",
  },
  {
    title: "Class Leader — MGX3991",
    location: "Monash Prato, Italy",
    type: "Facilitation",
    description: "Led a 45-minute student session, keeping the cohort engaged through interactive activities and a two-week recap.",
    icon: "chalkboard-teacher",
  },
  {
    title: "MUVP × RMM Outreach",
    location: "Kuala Lumpur, Malaysia",
    type: "Outreach",
    description: "Conducted an educational class for orphaned children as part of a university outreach initiative.",
    icon: "hands-clapping",
  },
];
