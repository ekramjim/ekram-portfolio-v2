import type { Product, Shot } from "./types";

const shepherd = (name: string, alt: string): Shot => ({ src: `/projects/shepherd/${name}.webp`, alt, frame: "render" });
const companion = (name: string, alt: string): Shot => ({ src: `/projects/shepherd-companion/${name}.webp`, alt, frame: "render" });

export const shepherdProduct: Product = {
  id: "shepherd",
  name: "Shepherd",
  icon: "/design/shepherd-icon-light.webp",
  tagline: "Your agents, one keystroke away.",
  intro:
    "A native macOS terminal for coding with Claude Code and Codex. Shepherd keeps every agent across every project in one place, drops your terminals over any app with a shortcut, and tells you the moment one needs you. Its free iPhone companion lets you answer from anywhere.",
  actions: [
    { label: "Download for Mac", href: "https://sphrd.dev/download" },
    { label: "iPhone app on the App Store", href: "https://apps.apple.com/app/id6823984397" },
    { label: "sphrd.dev", href: "https://sphrd.dev" },
  ],
  hero: [
    shepherd("2-open", "Shepherd's window on a MacBook Pro: projects and agents in the sidebar, Claude Code in the terminal and the project's files beside it"),
    companion("2-list", "Shepherd Companion on iPhone: the Mac live over Wi-Fi, then projects with their sessions"),
  ],
  heroCaption: "Every project and agent in one window.",
  chapters: [
    {
      eyebrow: "Shepherd Mini",
      title: "Keep your IDE. Lose its terminal.",
      body:
        "⌥⇧Space opens Mini over whatever you're in, your IDE included, in Liquid Glass that takes on what's behind it. It's on every Space, even over a full-screen app, so your terminals are always one shortcut away.",
      points: [
        "Put away, Mini drifts into a small bubble with a badge for whoever needs you",
        "Hover the bubble for every agent; click one and Mini opens right on it",
        "Files, Git and a browser slide over the terminal without resizing it",
      ],
      shots: [shepherd("1-mini", "Shepherd Mini floating over a full-screen app, with its glass sidebar of projects and agents")],
      caption: "Mini over a full-screen app.",
    },
    {
      dark: true,
      eyebrow: "Agents",
      title: "Know the moment an agent needs you.",
      body:
        "Shepherd watches the files Claude Code and Codex already keep, so it knows when one is working, finished or waiting on you. No hooks written into your setup and no config edits. Projects sit in groups, each with its sessions and terminals.",
      points: [
        "A notification and a menu bar badge when an agent asks a question or finishes",
        "Split right, split down: an agent in one pane, your tests in another, Git in a third",
        "Saved commands run your dev server from the toolbar",
      ],
      shots: [shepherd("3-split", "One Shepherd tab split into three panes: Claude Code, a test run and a git log")],
      caption: "One tab, three panes.",
    },
    {
      eyebrow: "Built in",
      title: "Files, search, Git and a browser, beside the terminal.",
      body:
        "A panel beside the terminal, ⌘1 to ⌘4, holds the project's files, search, saved commands and Git. Edit with syntax colours, folding and a Markdown preview; stage changes from the gutter; commit, branch and push from the commit graph. Your dev server's page opens in the built-in browser by itself.",
      shots: [shepherd("5-git", "Shepherd's Git panel: changed files, a commit message and the commit graph")],
      caption: "The Git panel and its commit graph.",
    },
    {
      id: "iphone",
      eyebrow: "Shepherd Companion · iPhone",
      title: "Approve, reply and push from your phone.",
      body:
        "The free iPhone app shows every session on your Mac live. Approve or deny an agent from the Lock Screen, read and reply to the whole conversation or flip to its terminal, start a new agent, and commit and push with Git. Your Mac and iPhone talk directly on the same Wi-Fi, or through your private iCloud when you're out. There's no Shepherd server in the middle.",
      points: [
        "Live Activity on the Lock Screen with Approve and Deny",
        "Type into your Mac's terminals, behind Face ID and off until you allow it",
        "Send photos and files into a project",
      ],
      shots: [
        companion("1-lock", "The iPhone Lock Screen with Shepherd's Live Activity: one agent needs you, with Deny and Approve"),
        companion("3-chat", "An agent's conversation on iPhone, with the reply field"),
        companion("4-chat-terminal", "The same session flipped to its terminal on iPhone"),
      ],
      caption: "Lock Screen, a conversation and its terminal.",
    },
  ],
  stats: [
    { value: "⌥⇧Space", label: "opens Mini over any app, even one in full screen" },
    { value: "A$4.99", label: "once. No subscription, no account" },
    { value: "0", label: "Shepherd servers between your Mac and iPhone" },
  ],
  extras: [
    { title: "Every Space", body: "Mini and the browser open over full-screen apps, on whichever Space you're in." },
    { title: "Commit graph", body: "Branches, history and diffs as a graph, with staging from the editor's change bars." },
    { title: "Dev browser", body: "⇧⌘B brings up a browser for the project's local server, over any app." },
    { title: "Private by design", body: "On the same Wi-Fi, devices talk over TLS with a key only they hold, under a name that changes every hour." },
    { title: "No account", body: "Buy once, use it on up to three Macs. The version you buy keeps working for good." },
    { title: "Widget", body: "A Home Screen widget on iPhone shows who needs you, with a Watch button." },
  ],
  build: {
    intro:
      "Shepherd is written in Swift: SwiftUI for the interface, AppKit where the Mac needs it (floating panels over full-screen apps, the global shortcut, the menu bar) and SwiftTerm for the terminal itself. I designed it in Figma and Icon Composer, and built the website, licensing and update feed around it.",
    notes: [
      { title: "Watching agents without hooks", body: "Session state comes from the files Claude Code and Codex already keep, read as they change, so installing Shepherd never touches a user's tooling." },
      { title: "Mac to iPhone", body: "Network.framework with TLS on the local network, and CloudKit in the user's private database when away. ActivityKit and WidgetKit on the phone." },
      { title: "Shipping outside the App Store", body: "Notarised builds, Sparkle with signed appcasts, Stripe licences and a 7-day trial, all handled by sphrd.dev." },
    ],
  },
  links: [
    { label: "sphrd.dev", href: "https://sphrd.dev" },
    { label: "Icon and App Store art", href: "/design#shepherd-icon" },
  ],
};
