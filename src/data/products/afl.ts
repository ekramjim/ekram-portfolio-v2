import type { Product } from "./types";

export const aflProduct: Product = {
  id: "afl",
  name: "AFL Game Ranking System",
  tagline: "AFL results, predicted.",
  intro:
    "A web app that predicts AFL matches. Pick two teams and it forecasts each side's score, the winner and how confident the model is, beside each team's strengths and their scores round by round. It was a final-year project by a team of five Monash data science students, and I was one of them.",
  actions: [{ label: "View on GitHub", href: "https://github.com/yeanle02/FYP" }],
  hero: [],
  heroCaption: "",
  chapters: [
    {
      eyebrow: "Prediction",
      title: "Predict the stats, then the score.",
      body:
        "Before a game, nobody knows how many disposals or tackles each side will have, so the model predicts those first. 22 CatBoost models, one for each of 11 team statistics on each side, work from what is known in advance: the teams, the round, the venue, the year and the day's temperatures. Two more CatBoost models then take those predicted statistics and predict the home and away scores.",
      points: [
        "Kicks, handballs, disposals, marks, goals, behinds, hit-outs, tackles, inside 50s, clearances and rebounds",
        "Trained on 990 games from 2018 to 2022, joined with each team's player statistics",
        "Scores counted the AFL way: six points a goal, plus the behinds",
      ],
    },
    {
      eyebrow: "Confidence",
      title: "A winner, and how sure it is.",
      body:
        "The score models give a spread as well as a score. The app turns that spread into a confidence percentage, higher when the spread is narrow. The predicted winner is highlighted, and the confidence shows as a percentage and a bar.",
    },
    {
      dark: true,
      eyebrow: "Comparison",
      title: "Two teams, side by side.",
      body:
        "Choose a match and each team gets a radar chart of five ratings, attack, defence, speed, teamwork and hustle, with its points total beside it. Below, a Plotly chart follows both teams' scores round by round, and draws the prediction on as a dashed line to the next round.",
      points: [
        "Team rankings: the top eight by points",
        "Today's matches, each ready to predict in one click",
      ],
    },
    {
      eyebrow: "Teams",
      title: "Every club, every player.",
      body:
        "Each team has its own page with its captain and coach, and a full list of its players with their position and games played, all served from MongoDB.",
    },
  ],
  stats: [
    { value: "78%", label: "match outcome accuracy" },
    { value: "990", label: "games from 2018 to 2022 in the training data" },
    { value: "24", label: "CatBoost models behind each prediction" },
  ],
  extras: [
    { title: "Weather in the model", body: "Each prediction takes the day's maximum and minimum temperature, as the historical games did." },
    { title: "One-click matches", body: "Pick a fixture from today's matches and its prediction runs straight away." },
    { title: "Team ratings", body: "Attack, defence, speed, teamwork and hustle, normalised so every team compares on the same radar." },
    { title: "Guides", body: "An info button on each panel explains what it shows and how to read it." },
  ],
  build: {
    intro:
      "A Next.js and React front end with Tailwind CSS, Framer Motion, Chart.js for the radar charts and Plotly for score history. Team, player and match data live in MongoDB. The models were trained in a Python notebook with pandas, scikit-learn and CatBoost, then saved for the app to load.",
    notes: [
      {
        title: "Python behind a Next.js route",
        body: "The predict route starts the Python script with the match details as arguments, then reads the scores, winner and confidence back from it as JSON. The script loads the trained models and label encoders from the files the notebook saved.",
      },
      {
        title: "Two stages",
        body: "Player performance isn't known until the game is played, so the first stage predicts it from pre-match details. The score models get more to work with, while still using only what's known before the first bounce.",
      },
      {
        title: "From XGBoost to CatBoost",
        body: "The first model was a single XGBoost regressor predicting both scores from match details. The final one uses CatBoost, which takes categories like team and venue directly and can predict with uncertainty, the source of the confidence figure.",
      },
    ],
  },
};
