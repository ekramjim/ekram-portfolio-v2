import type { Product } from "./types";

export const callMonitorProduct: Product = {
  id: "call-monitor",
  name: "Android Call State Monitor",
  tagline: "See who's calling, as it rings.",
  intro:
    "A small Android app that listens for changes in the phone's call state. When a call comes in, it shows the caller's number on screen while the phone is still ringing.",
  actions: [{ label: "View on GitHub", href: "https://github.com/ekramjim/MyCallReceiver" }],
  hero: [],
  heroCaption: "",
  chapters: [
    {
      eyebrow: "Listening",
      title: "A receiver for every change in call state.",
      body:
        "When the app starts, it registers a broadcast receiver for the system's phone state broadcast. Each time the state changes, the receiver attaches a listener to the phone's TelephonyManager, and when that listener sees the phone ringing, it shows the incoming number in a toast.",
      points: [
        "Registered in code when the activity starts, rather than in the manifest",
        "Only the ringing state shows a message",
        "The number stays on screen as a long toast",
      ],
    },
    {
      dark: true,
      eyebrow: "Permissions",
      title: "It asks first.",
      body:
        "Reading the phone's state and the incoming number needs the user's permission on modern Android. The app asks for phone state, call log and phone call access as soon as it opens, and declares what it uses in its manifest. Telephony hardware is marked optional, so the app still installs on devices without it.",
    },
  ],
  stats: [
    { value: "API 34", label: "minimum and target SDK: Android 14" },
    { value: "3", label: "permissions requested at launch" },
    { value: "2", label: "source files: the activity and the receiver" },
  ],
  extras: [
    { title: "Material 3", body: "A Material 3 DayNight theme, so it follows the system's light or dark setting." },
    { title: "Kotlin build scripts", body: "Gradle configured with the Kotlin DSL, compiling Java 8 source." },
    { title: "Optional telephony", body: "The manifest marks telephony as not required, so the app isn't filtered out of devices without it." },
  ],
  build: {
    intro:
      "The app is written in Java against the Android SDK and built with Gradle, using Kotlin build scripts. It comes down to two classes: MainActivity asks for permissions and registers the receiver, and MyCallsReceiver does the listening.",
    notes: [
      {
        title: "BroadcastReceiver",
        body: "Registered at runtime with an IntentFilter for TelephonyManager.ACTION_PHONE_STATE_CHANGED when the activity starts.",
      },
      {
        title: "TelephonyManager",
        body: "On each broadcast the receiver gets the TelephonyManager system service and listens with a PhoneStateListener for LISTEN_CALL_STATE, acting on the ringing state.",
      },
      {
        title: "Permissions",
        body: "READ_PHONE_STATE and READ_CALL_LOG are declared in the manifest and requested at launch with CALL_PHONE. The incoming number is only shared with apps that hold call log access.",
      },
    ],
  },
};
