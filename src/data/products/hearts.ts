import type { Product } from "./types";

export const heartsProduct: Product = {
  id: "hearts",
  name: "Hearts Card Game",
  tagline: "Hearts, in the terminal.",
  intro:
    "The classic trick-taking card game, played in a terminal against computer opponents. Written in Python, it follows the full rules, from dealing and passing to breaking hearts and shooting the moon, with two AI strategies to play against.",
  actions: [{ label: "View on GitHub", href: "https://github.com/ekramjim/Hearts-Game" }],
  hero: [],
  heroCaption: "",
  chapters: [
    {
      eyebrow: "Playing",
      title: "Three to five players. One of them is you.",
      body:
        "Choose how many players and a target score, then play with cards drawn right in the terminal. Your hand is laid out side by side with a number under each card: type one to play it, or three to pass. If a card isn't allowed, the game tells you why and asks again.",
      points: [
        "Cards drawn with box characters and suit symbols",
        "The game ends when someone reaches the target score, and the lowest score wins",
        "A tie for the lowest score plays another round",
      ],
    },
    {
      eyebrow: "Rules",
      title: "Every rule, enforced.",
      body:
        "The two of clubs leads the first trick. You must follow suit if you can, hearts can't lead until they've been broken, and nobody can throw a heart or the queen of spades on the first trick. Each heart you take costs a point and the queen of spades 13. Take all 26 and you shoot the moon: you score nothing and everyone else gets 26.",
      points: [
        "With three or five players, twos are taken out so the deck deals evenly",
        "A deal that leaves anyone without a heart or the queen of spades is dealt again",
        "Three cards passed every round, with the passing shifting one seat each time",
      ],
    },
    {
      dark: true,
      eyebrow: "Opponents",
      title: "Two ways to play against you.",
      body:
        "Player 2 is a basic AI that always plays its lowest legal card. Every other computer player uses a better strategy. It still leads low, but when following suit it plays the highest card that won't take the trick, and when it can't follow suit it gets rid of the queen of spades if it holds it, or otherwise its highest card.",
      points: ["Both pass their three highest cards", "Every AI move goes through the same rule checks as yours"],
    },
  ],
  stats: [
    { value: "3–5", label: "players: you and two to four AI opponents" },
    { value: "2", label: "AI strategies" },
    { value: "26", label: "points to shoot the moon" },
  ],
  extras: [
    { title: "Card art", body: "Each card drawn in box characters, with ♣ ♦ ♠ ♥ in the middle." },
    { title: "Sorted hands", body: "Your hand is kept in order, by suit and then by rank." },
    { title: "Clear errors", body: "Messages like “Player cannot lead with a heart until hearts have been broken”." },
    { title: "Checked input", body: "Player count, target score and passed cards are asked again until they're valid." },
    { title: "Paced play", body: "Short pauses between moves, so you can follow each trick as it's played." },
  ],
  build: {
    intro:
      "Hearts is plain Python using only the standard library, split into classes for the cards, the players, a round and the game.",
    notes: [
      {
        title: "Cards that compare",
        body: "Rank and Suit are enums with their own ordering, and Card compares by suit then rank, so sort(), min() and max() work on a hand directly. The AI players rely on that.",
      },
      {
        title: "One interface for every player",
        body: "A Player base class holds the rule checks. The human and both AI players each implement play_card and pass_cards, so a round treats them all the same.",
      },
      {
        title: "Rounds and the game",
        body: "Round plays tricks until the hands are empty, tracks broken hearts, scores penalties and checks for a shot moon. Hearts deals, checks the deal, passes cards and runs rounds until the target is reached.",
      },
    ],
  },
};
