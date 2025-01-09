// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgM34-XC4WdJ3WXeFMSO0pu75kQPPQqlk",
  authDomain: "t-coins-world.firebaseapp.com",
  projectId: "t-coins-world",
  storageBucket: "t-coins-world.appspot.com",
  messagingSenderId: "1065880477947",
  appId: "1:1065880477947:web:9ebb8e28c58a8f2aa4505e",
  measurementId: "G-HGR6JKWBRZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// DOM Elements
const flashScreen = document.getElementById("flash-screen");
const mainApp = document.getElementById("main-app");
const countdownElem = document.getElementById("countdown");
const quoteElem = document.getElementById("quote");

// Quotes Array
const quotes = [
  "Your journey starts here...",
  "Collect coins, achieve greatness!",
  "Welcome to the world of T Coins!",
  "Get ready to explore new opportunities!",
];

let countdown = 4;

// ** Track Page Load Event **
logEvent(analytics, "flash_screen_viewed", { page: "Flash Screen" });

// Countdown Timer
const countdownInterval = setInterval(() => {
  countdown--;
  countdownElem.textContent = `Loading in ${countdown} seconds...`;

  // Track Countdown Step
  logEvent(analytics, "countdown_tick", { remaining_seconds: countdown });

  if (countdown === 0) {
    clearInterval(countdownInterval);

    // Log Event: Transition to Main App
    logEvent(analytics, "flash_screen_completed", { page: "Registration" });

    flashScreen.style.display = "none";
    mainApp.style.display = "block";
    window.location.href = "app_templete/userRegistulation.html"; // Redirect to registration
  }
}, 2000);

// Cycle Through Quotes
let currentQuoteIndex = 0;
setInterval(() => {
  currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
  quoteElem.textContent = quotes[currentQuoteIndex];

  // Log Event: Quote Changed
  logEvent(analytics, "quote_changed", { quote: quotes[currentQuoteIndex] });
}, 2000);

// Optional: Debugging to Ensure Smooth Transition
window.addEventListener("load", () => {
  console.log("Flash screen loaded successfully.");

  // Log Event: Flash Screen Loaded
  logEvent(analytics, "flash_screen_loaded", { timestamp: new Date().toISOString() });
});
