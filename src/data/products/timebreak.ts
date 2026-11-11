import type { Product, Shot } from "./types";

const art = (name: string, alt: string): Shot => ({ src: `/projects/timebreak/${name}.webp`, alt, frame: "image" });

export const timebreakProduct: Product = {
  id: "timebreak",
  name: "TimeBreak",
  icon: "/apps/timebreak/icon.webp",
  tagline: "Focus in blocks. Break on time.",
  intro:
    "TimeBreak is a Pomodoro timer for iPhone, iPad and Mac. Choose how long you work, how long you rest and how many rounds make a session, then let the dial count each block down. Your history, your Reminders and a timer in the Mac's menu bar sit right beside it.",
  actions: [
    { label: "Download on the App Store", href: "https://apps.apple.com/au/app/timebreak-pomodoro/id6763444390" },
    { label: "Source on GitHub", href: "https://github.com/ekramjim/timeBreak" },
  ],
  // The App Store art is tall and small (598 × 1300), so the four pieces sit together in one row here, and the
  // chapters below are text only.
  hero: [
    art("1-focus", "App Store art, \"Focus that earns the break.\": the timer on iPhone, a watch-style dial at 50:00 with Start and Reset, and Session Left, Breaks Left, Total and Sessions Finished below"),
    art("2-history", "App Store art, \"See your week add up.\": History on iPhone, with Today and Sessions, and the week's Focus Trail of daily minutes"),
    art("3-reminders", "App Store art, \"Tick tasks off as you focus.\": the Reminders tab on iPhone, asking to connect Apple Reminders"),
    art("4-settings", "App Store art, \"Pick the palette, pick the pace.\": Settings on iPhone, with 50-minute work, 10-minute break and 2 intervals, and six accent colours"),
  ],
  heroCaption: "The timer, History, Reminders and Settings on iPhone.",
  chapters: [
    {
      eyebrow: "The timer",
      title: "A dial that counts the block down.",
      body:
        "The timer is drawn like a dive watch, with lume markers and a ring around the bezel in your accent colour that shrinks as the block runs out. Below it: the time left in the session, the breaks still to come, and the time you'll finish.",
      points: [
        "Work, break and the number of intervals are yours to set: 50 and 10 minutes, twice, to start",
        "Pause, reset, or end a session early",
        "Session settings lock while the timer runs, so a stray tap can't change it",
      ],
    },
    {
      dark: true,
      eyebrow: "Lock Screen and menu bar",
      title: "The countdown comes with you.",
      body:
        "On iPhone, a Live Activity keeps the time left on the Lock Screen and in the Dynamic Island, with buttons to pause, resume or end. On the Mac, the countdown sits in the menu bar and turns green during a break; click it for the dial and every setting.",
      points: [
        "A sound and a notification when a break starts, work resumes and the session ends",
        "Four sounds to choose from, with their own volume",
      ],
    },
    {
      eyebrow: "History",
      title: "See your week add up.",
      body:
        "Every work block and break is logged. The day view shows today's focus time and finished sessions over a Focus Trail of minutes for each day of the week, and the overview totals each week and month.",
      points: [
        "A Focus Trail widget for the Home Screen, in your accent colour",
        "History and settings follow you between devices through iCloud",
        "Clear a day, a week or everything",
      ],
    },
    {
      eyebrow: "Reminders",
      title: "Tick tasks off as you focus.",
      body:
        "TimeBreak shows your Apple Reminders next to the timer, with counts for what's open, due today and overdue. Pick a list, add or edit a reminder, and tick it off without leaving the app.",
    },
  ],
  stats: [
    { value: "50 / 10", label: "minutes of work and break to start, then set your own" },
    { value: "12", label: "months of focus history kept" },
    { value: "4", label: "timer sounds, every one synthesised in code" },
  ],
  extras: [
    { title: "Your colour", body: "Six preset accents or any colour you pick, carried through the dial, the app and the widget." },
    { title: "Light or dark", body: "Follows the system, or stays light or dark." },
    { title: "Ends at", body: "The time your session will finish, always on screen." },
    { title: "iPad and Mac", body: "The same four tabs on every device, plus the menu bar timer on the Mac." },
    { title: "Dynamic Island", body: "The phase and time left, with Pause and End one press away." },
    { title: "Week and month", body: "Totals for any week or month, and every day's focus at a glance." },
  ],
  build: {
    intro:
      "TimeBreak is one SwiftUI codebase for iPhone, iPad and Mac. A WidgetKit extension holds the Live Activity and the Focus Trail widget, App Intents drive the Live Activity's buttons, and EventKit connects to Reminders.",
    notes: [
      {
        title: "Time kept by dates",
        body: "The timer stores when each phase ends rather than counting ticks. One timer fires at each phase's end, and after time in the background it catches up through every phase that finished, without replaying old sounds. The ring is a single Core Animation sweep to zero.",
      },
      {
        title: "Sounds without audio files",
        body: "Each chime is three sine notes with a soft attack and decay, written as WAV in memory, pitched higher when work resumes and higher again when the session ends. The app ships no sound files.",
      },
      {
        title: "Sync without a server",
        body: "History and settings live in iCloud's key-value store. Changes from another device merge entry by entry, and the history trims its oldest entries to stay inside the store's size limit.",
      },
    ],
  },
};
