import type { Product, Shot } from "./types";

const chart = (name: string, alt: string): Shot => ({ src: `/apps/renewable-energy/${name}.webp`, alt, frame: "image" });

export const renewableEnergyProduct: Product = {
  id: "renewable-energy",
  name: "Visualizing Renewable Energy",
  tagline: "Renewable energy, in five charts.",
  intro:
    "An interactive dashboard on renewable energy around the world, built with Vega-Lite for FIT3179, Monash University's data visualisation unit. A map, a bar chart, a donut, a stacked area and a stacked bar chart each take one angle on the data, starting from the World Bank's figures for how much of each country's energy is renewable.",
  actions: [
    { label: "Open the dashboard", href: "https://ekramjim.github.io/visualizing-renewable-energy/" },
    { label: "View on GitHub", href: "https://github.com/ekramjim/visualizing-renewable-energy" },
  ],
  hero: [
    {
      src: "/projects/renewable-energy/home.webp",
      alt: "The dashboard's first chart: a world map of renewable energy's share of consumption in 2020, countries shaded from pale to dark green and those without data in grey, with an intensity legend",
      frame: "browser",
      host: "ekramjim.github.io",
    },
  ],
  heroCaption: "Renewable share of each country's energy use, 2020.",
  chapters: [
    {
      eyebrow: "Production",
      title: "Five kinds of energy, side by side.",
      body:
        "A horizontal bar chart totals 2020 production, in gigawatt-hours, for biomass, geothermal, hydro, solar and wind. Pick a country from the menu, the USA, Australia, Canada, China or Japan, and the bars re-total for that country alone.",
      shots: [chart("bars", "Bar chart of renewable energy production in 2020 by energy type, from biomass to wind, with a Select Country menu set to All")],
      caption: "Production by energy type, 2020.",
    },
    {
      eyebrow: "Mix",
      title: "The 2022 mix in one ring.",
      body:
        "A donut chart shows each energy type's share of production in 2022. It keeps the bar chart's colours for each type, so the two charts read as one.",
      shots: [chart("donut", "Donut chart of energy production by type in 2022, split between biomass, geothermal, hydro, solar and wind")],
      caption: "Energy production by type, 2022.",
    },
    {
      dark: true,
      eyebrow: "Trends",
      title: "Thirty years of renewable share.",
      body:
        "A stacked area chart follows the World Bank's renewable share of energy use from 1990 to 2020 for Australia, Brazil, China, Malaysia and Singapore. Choose one country from the menu to see it on its own.",
      shots: [chart("trends", "Stacked area chart of renewable energy consumption as a percentage for Australia, Brazil, China, Malaysia and Singapore from 1990 to 2020")],
      caption: "Energy consumption trends, 1990 to 2020.",
    },
    {
      eyebrow: "Countries",
      title: "Five countries, year by year.",
      body:
        "A stacked bar chart breaks renewable production down by country for Australia, Canada, China, Japan and the USA, every year from 2000 to 2023. Hover a segment for its exact figure, or pick one country to compare its years alone.",
      shots: [chart("countries", "Stacked bar chart of renewable energy production in gigawatt-hours for Australia, Canada, China, Japan and the USA, each year from 2000 to 2023")],
      caption: "Renewable production by country, 2000 to 2023.",
    },
  ],
  stats: [
    { value: "5", label: "chart idioms, each with its own reading" },
    { value: "212", label: "countries and regions in the World Bank data" },
    { value: "31", label: "years of renewable share, 1990 to 2020" },
  ],
  extras: [
    { title: "Intensity slider", body: "A slider on the map hides every country below a renewable share you choose, from 0 to 100%." },
    { title: "Tooltips", body: "Hover any country, bar or segment for its exact value. Grey countries say there's no data for them." },
    { title: "Written readings", body: "Each chart has a short reading beneath it, with the countries and energy types it mentions picked out in colour." },
    { title: "Equal Earth", body: "The map uses the Equal Earth projection, so countries keep their true sizes relative to each other." },
    { title: "Sketched first", body: "The dashboard was planned on paper with five design sheets, which are in the repository." },
  ],
  build: {
    intro:
      "One static HTML page, published with GitHub Pages and with no build step. Each chart is a Vega-Lite spec in its own JSON file, embedded with Vega-Embed and laid out with Pure.css. The World Bank data was cleaned and reshaped with pandas first.",
    notes: [
      {
        title: "Joining data to the map",
        body: "The map loads Natural Earth country shapes as TopoJSON and looks up each country's World Bank figure by name. A grey layer underneath catches every country without a match, so the map has no holes.",
      },
      {
        title: "Steps, not a gradient",
        body: "The map's colour scale is a threshold scale: five greens with breaks at 1, 40, 80 and 100%. Each country falls in one band, which can be read straight off the legend.",
      },
      {
        title: "Menus as parameters",
        body: "Each country menu is a Vega-Lite parameter bound to a select input, which the chart's filter transform reads. Choosing a country filters and re-totals the data in the browser, with no JavaScript of my own.",
      },
    ],
  },
  links: [{ label: "World Bank data", href: "https://data.worldbank.org/indicator/EG.FEC.RNEW.ZS" }],
};
