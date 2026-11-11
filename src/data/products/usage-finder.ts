import type { Product, Shot } from "./types";

const mac = (src: string, alt: string): Shot => ({ src, alt, frame: "window" });

export const usageFinderProduct: Product = {
  id: "usage-finder",
  name: "Usage Finder",
  icon: "/apps/usage-finder/icon.webp",
  tagline: "Your Mac, in the menu bar.",
  intro:
    "A native system monitor for macOS. Usage Finder puts live CPU, memory and power meters in your menu bar, and a window with charts for every part of the Mac, from each core to the apps keeping it busy.",
  actions: [
    { label: "Download for Mac", href: "https://github.com/ekramjim/UsageFinder-Releases/releases/latest/download/UsageFinder.dmg" },
    { label: "Releases on GitHub", href: "https://github.com/ekramjim/UsageFinder-Releases" },
  ],
  hero: [
    mac(
      "/apps/usage-finder/overview.webp",
      "Usage Finder's Overview: CPU at 21%, 8 of 12 cores in use, 9.26 GB of 16 GB memory, 9.0 W of power, GPU and network charts, with panes from CPU to Apps in the sidebar",
    ),
  ],
  heroCaption: "Every reading on one page.",
  chapters: [
    {
      eyebrow: "Menu bar",
      title: "Three meters, always in view.",
      body:
        "CPU, memory and power each get their own menu bar item, so you can turn any one off or ⌘-drag it into place. Click one for a summary of everything else: GPU, network, disk, swap, load and battery.",
      points: [
        "CPU as a bar for every core, one per core type, or a single total",
        "Memory and swap side by side; power as a level meter in watts",
        "In colour or in black and white, to match the rest of your menu bar",
      ],
      shots: [
        {
          src: "/apps/usage-finder/menu-bar.webp",
          alt: "The CPU, memory and power meters in the menu bar at 21%, 58% and 9 W, with the summary panel open below them",
          frame: "image",
        },
      ],
      caption: "The meters, and the panel they open.",
    },
    {
      eyebrow: "History",
      title: "See the last day, not just the last second.",
      body:
        "Every chart switches between the last 3 minutes, hour and 24 hours. Recent readings are kept as they are, longer ranges as averages, and the history is saved on your Mac so it's still there next time you open the app.",
      points: [
        "Usage per core, split into performance and efficiency cores",
        "Memory by kind, with memory pressure and swap",
        "Gaps where Usage Finder wasn't collecting, never lines drawn across them",
      ],
      shots: [mac("/apps/usage-finder/cpu.webp", "The CPU pane over 24 hours: user and system usage, then a bar for each of 12 cores, E1 to E4 and P1 to P8")],
      caption: "CPU over the last 24 hours.",
    },
    {
      eyebrow: "Apps",
      title: "Find what's slowing your Mac down.",
      body:
        "The Apps pane lists what's using the CPU and memory, busiest first, with search. The direct download counts helper processes towards the app they belong to, so a browser's renderers add up to the browser, and adds columns for each app's power and process count.",
      shots: [mac("/apps/usage-finder/apps.webp", "The Apps pane: Xcode at 62% CPU and 1.76 GB, then Safari, Music, Mail and others, sorted by CPU")],
      caption: "Apps, sorted by CPU.",
    },
    {
      dark: true,
      eyebrow: "Power",
      title: "Watts for the whole Mac.",
      body:
        "The direct download reads total system power straight from the System Management Controller, with figures for the CPU, GPU, Neural Engine and memory from the chip's energy model, plus temperatures and fan speeds. The Mac App Store edition reads power from the battery instead.",
      points: ["Battery charge, maximum capacity, cycle count and the adapter's wattage", "Thermal state, as macOS rates it"],
      shots: [
        mac(
          "/projects/usage-finder/power.webp",
          "The Power pane in Dark Mode: a power chart at about 26 W, the GPU's share, and the battery's charge, status and power adapter",
        ),
      ],
      caption: "The Power pane in Dark Mode.",
    },
  ],
  stats: [
    { value: "3", label: "live meters in the menu bar: CPU, memory and power" },
    { value: "24 h", label: "of history in every chart, kept between launches" },
    { value: "8", label: "panes, from the Overview to Apps" },
  ],
  extras: [
    { title: "GPU, disk, network", body: "Each with its own chart, live rates and totals since startup." },
    { title: "Widget", body: "CPU, memory, GPU and power on your desktop, in small and medium sizes." },
    { title: "Shortcuts", body: "Ask for CPU, memory, GPU or power, or the busiest apps right now." },
    { title: "Light on the Mac", body: "Samples every 1, 2 or 5 seconds, and less often in Low Power Mode." },
    { title: "Stays out of the way", body: "Opens at login, hides from the Dock if you like, and keeps its meters after you quit." },
    { title: "Updates itself", body: "The direct download is notarised and installs new versions with Sparkle." },
  ],
  build: {
    intro:
      "Usage Finder is written in Swift: SwiftUI and Swift Charts for the window, AppKit for the menu bar, and IOKit and Mach calls for the readings. Two editions build from the same sources: a direct download, notarised and released by one script to GitHub with a Sparkle appcast, and a sandboxed edition for the Mac App Store.",
    notes: [
      {
        title: "Reading the hardware",
        body: "CPU from per-core tick counters, power from the SMC over IOKit, and energy per component from IOReport. A component only appears after several live readings, so a frozen counter never shows up as 0 W.",
      },
      {
        title: "Idle when nobody's looking",
        body: "Sampling runs only while something shows it: a visible window, the panel or a live meter. Window occlusion tells it when the window is covered or minimised, and with every meter off the app does no background work.",
      },
      {
        title: "Meters drawn by hand",
        body: "A menu bar item can show only one image, so each meter is drawn with Core Graphics at a fixed width on whole Retina pixels, and redrawn only when something it shows visibly changes.",
      },
    ],
  },
};
