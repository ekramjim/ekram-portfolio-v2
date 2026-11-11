import type { Product, Shot } from "./types";

const chart = (name: string, alt: string): Shot => ({ src: `/apps/f1/${name}.webp`, alt, frame: "image" });

export const f1Product: Product = {
  id: "f1",
  name: "F1 Pinnacle Of Motor Sports",
  tagline: "Formula 1, on one dashboard.",
  intro:
    "A Tableau dashboard on Formula 1: where its drivers come from, and how the leading drivers and teams scored and won from 2010 to 2023. Five charts run down one long page, each with a short written reading of what it shows.",
  actions: [{ label: "Open the dashboard", href: "https://public.tableau.com/app/profile/ekramul.islam/viz/Visualization1F1/Dashboard1" }],
  hero: [
    {
      src: "/projects/f1/dashboard.webp",
      alt: "The Driver Nationality treemap: British and American drivers in the largest dark blue blocks, Italian, French and German next, then smaller nationalities in paler teal, with callouts for 166 British and 18 Australian Formula 1 drivers",
      frame: "image",
    },
  ],
  heroCaption: "Every nationality, sized by its number of drivers.",
  chapters: [
    {
      eyebrow: "Drivers",
      title: "Five drivers, fourteen seasons.",
      body:
        "The dashboard opens on a treemap of every driver nationality, with a filter to pick out one country. Below it, Driver Points compares five drivers of the 2010 to 2023 era: Charles Leclerc, Lando Norris, Lewis Hamilton, Max Verstappen and Valtteri Bottas. Hamilton's bar is the tallest, and the reading beside it puts that down to his dominance over the period.",
      shots: [chart("drivers", "Driver Points (2010–2023) bar chart for Charles, Lando, Lewis, Max and Valtteri, with Lewis tallest and a callout reading 204")],
      caption: "Driver Points, 2010 to 2023.",
    },
    {
      eyebrow: "Constructors",
      title: "Points by team, season by season.",
      body:
        "Constructor Points stacks Ferrari, McLaren, Mercedes, Red Bull and Williams for each year from 2010 to 2023, with a Year menu to show one season. The reading notes Mercedes and Red Bull at the front, particularly after 2014, and the dip in 2020, called out at 75.6, when the COVID-19 pandemic shortened the season.",
      shots: [chart("constructors", "Constructor Points Over Years: stacked bars for Ferrari, McLaren, Mercedes, Red Bull and Williams from 2010 to 2023, with a callout for the least points in 2020")],
      caption: "Constructor Points Over Years.",
    },
    {
      eyebrow: "Over time",
      title: "The same five teams, as one shape.",
      body:
        "Cumulative Team Performance draws those points again as a stacked area, so the balance between the teams reads as a shape over the years. Labels mark Mercedes as the most consistent constructor and Williams as the worst performing.",
      shots: [chart("cumulative", "Cumulative Team Performance: a stacked area chart for the five teams from 2010 to 2023, with labels for the most consistent and worst performing constructors")],
      caption: "Cumulative Team Performance.",
    },
    {
      dark: true,
      eyebrow: "Wins",
      title: "Who won, year by year.",
      body:
        "Team Wins plots each team's race wins per season as a line. It ends on Red Bull's 21 wins in 2023, called out as the most in a single year.",
      points: [
        "Mercedes leads every season from 2014 to 2020",
        "McLaren's drop after 2012 is called out",
        "Red Bull falls back after 2013, then climbs again from 2021",
      ],
      shots: [chart("wins", "Team Wins (2010–2023): one line per team, with callouts for a major dip after 2012 and the highest number of wins in a year, 21")],
      caption: "Team Wins, 2010 to 2023.",
    },
  ],
  stats: [
    { value: "5", label: "charts on one dashboard" },
    { value: "166", label: "British drivers, the largest group in the treemap" },
    { value: "14", label: "seasons, 2010 to 2023, in the driver and team charts" },
  ],
  extras: [
    { title: "Filters", body: "Nationality and Year menus narrow the treemap and the team charts to one country or one season." },
    { title: "Callouts", body: "Notes on the charts point out the most points, the 2020 low and the most wins in a season." },
    { title: "Written readings", body: "Every chart has a reading beside or beneath it, with the names that matter in bold." },
    { title: "One colour per team", body: "Ferrari red, McLaren orange, Mercedes teal, Red Bull blue and Williams light blue, in every team chart." },
    { title: "Tableau Public", body: "Published on Tableau Public, so anyone can open it and use the filters in a browser." },
  ],
  build: {
    intro:
      "Built in Tableau and published to Tableau Public. Each chart is its own worksheet, from Driver Nationality to Team Wins, placed on one long dashboard with a text panel for each.",
    notes: [
      {
        title: "Size and colour together",
        body: "In the treemap, both the area and the shade of each block stand for its driver count, on a scale from 1 to 166. The long tail of small nationalities still fits beside Britain's block.",
      },
      {
        title: "Bars, then areas",
        body: "Constructor points appear twice: as stacked bars to compare single seasons, then as a stacked area to show the trend. Both use the same five teams in the same colours, so one leads into the next.",
      },
      {
        title: "Labels on the chart",
        body: "The key points are written on the charts themselves, such as the 204 in Driver Points, 2020's 75.6 and the 21 wins in 2023, so the story reads without hovering.",
      },
    ],
  },
};
