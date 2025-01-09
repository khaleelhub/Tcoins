import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase, ref, update, get } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgM34-XC4WdJ3WXeFMSO0pu75kQPPQqlk",
  authDomain: "t-coins-world.firebaseapp.com",
  databaseURL: "https://t-coins-world-default-rtdb.firebaseio.com",
  projectId: "t-coins-world",
  storageBucket: "t-coins-world.appspot.com",
  messagingSenderId: "1065880477947",
  appId: "1:1065880477947:web:9ebb8e28c58a8f2aa4505e",
  measurementId: "G-HGR6JKWBRZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const analytics = getAnalytics(app);

// Progress Bar and Coins
let progressValue = 0;
let totalCoins = 0;
let lastClaimTime = "Never";
let progressInterval;

const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const claimButton = document.getElementById("claim-coins");
const totalCoinsDisplay = document.getElementById("total-coins");
const lastClaimTimeDisplay = document.getElementById("last-claim-time");

function updateProgressBar() {
  progressBar.style.width = `${progressValue}%`;
  progressText.textContent = `${progressValue}%`;

  claimButton.disabled = progressValue < 100;

  // Save progress value to localStorage
  localStorage.setItem("progressValue", progressValue);
}

// Start progress bar filling
function startHourlyProgress() {
  progressInterval = setInterval(() => {
    if (progressValue < 100) {
      progressValue += 1; // 1% every 36 seconds
      updateProgressBar();

      // Log Analytics Event: Progress Updated
      logEvent(analytics, "progress_updated", { progressValue });
    } else {
      clearInterval(progressInterval); // Stop progress when full
    }
  }, 360000 / 100); // 1 hour divided by 100 steps
}

// Handle claiming coins
claimButton.addEventListener("click", async () => {
  if (progressValue === 100) {
    totalCoins += 100; // Add 100 coins
    lastClaimTime = new Date().toLocaleString();

    totalCoinsDisplay.textContent = `Total Coins: ${totalCoins}`;
    lastClaimTimeDisplay.textContent = `Last Claimed: ${lastClaimTime}`;
    progressValue = 0; // Reset progress
    updateProgressBar();

    try {
      const userId = auth.currentUser.uid;
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, {
        coins: totalCoins,
        lastClaimTime,
        progress: progressValue, // Save progress to Firebase
      });

      alert("Coins claimed successfully!");

      // Log Analytics Event: Coins Claimed
      logEvent(analytics, "coins_claimed", { amount: 100, totalCoins });
    } catch (error) {
      console.error("Error updating coins: ", error.message);
    }
  }
});

// Load user data and resume progress
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const userId = auth.currentUser?.uid;
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const { coins, lastClaimTime: lastTime, progress } = snapshot.val();
      totalCoins = coins || 0;
      lastClaimTime = lastTime || "Never";
      progressValue = progress || parseInt(localStorage.getItem("progressValue")) || 0;

      totalCoinsDisplay.textContent = `Total Coins: ${totalCoins}`;
      lastClaimTimeDisplay.textContent = `Last Claimed: ${lastClaimTime}`;
      updateProgressBar();
    } else {
      progressValue = parseInt(localStorage.getItem("progressValue")) || 0;
      updateProgressBar();
    }

    // Start progress bar
    startHourlyProgress();
  } catch (error) {
    console.error("Error loading user data: ", error.message);
    progressValue = parseInt(localStorage.getItem("progressValue")) || 0;
    updateProgressBar();
    startHourlyProgress();
  }
});

// Save progress before navigating away
window.addEventListener("beforeunload", async () => {
  const userId = auth.currentUser?.uid;
  if (userId) {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, { progress: progressValue });
  }
});

// Log Analytics Event: Page Load
logEvent(analytics, "progress_bar_page_loaded", { page: "Home Page" });
