import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
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
const db = getDatabase(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// DOM Elements
const updatesFeed = document.getElementById("updates-feed");
const postUpdateBtn = document.getElementById("post-update-btn");
const updateInput = document.getElementById("update-input");
const coinsDisplay = document.getElementById("coins-display");
const adsGrid = document.getElementById("ads-grid");

let userCoins = 0;
let currentUserId = null;

// Track Current User
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserId = user.uid;

    // Initialize user's coin balance
    const userRef = ref(db, `users/${currentUserId}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      await update(userRef, { coins: 0 });
      userCoins = 0;
    } else {
      userCoins = snapshot.val().coins || 0;
    }

    updateCoinsDisplay();
  } else {
    window.location.href = "login.html"; // Redirect to login if no user is logged in
  }
});

// Update Coins Display
function updateCoinsDisplay() {
  coinsDisplay.textContent = `Coins: ${userCoins}`;
}

// Add Coins
async function addCoins(amount) {
  if (currentUserId) {
    userCoins += amount;
    const userRef = ref(db, `users/${currentUserId}`);
    await update(userRef, { coins: userCoins });
    updateCoinsDisplay();
    alert(`You earned ${amount} coins!`);
    logEvent(analytics, "earn_coins", { userId: currentUserId, amount });
  }
}

// Post an Update
postUpdateBtn.addEventListener("click", async () => {
  const message = updateInput.value.trim();
  if (message) {
    const user = auth.currentUser?.email || "Anonymous";

    await push(ref(db, "updates"), {
      user,
      message,
      likes: 0,
      comments: [],
      shares: 0,
      timestamp: Date.now(),
    });

    updateInput.value = ""; // Clear input
    logEvent(analytics, "post_update", { userId: currentUserId, message });
  }
});

// Display Updates
onValue(ref(db, "updates"), (snapshot) => {
  updatesFeed.innerHTML = ""; // Clear feed

  snapshot.forEach((childSnapshot) => {
    const updateData = childSnapshot.val();
    const updateKey = childSnapshot.key;

    const updateDiv = document.createElement("div");
    updateDiv.classList.add("update");

    updateDiv.innerHTML = `
      <h4>${updateData.user}</h4>
      <p>${updateData.message}</p>
      <div class="actions">
        <button onclick="likeUpdate('${updateKey}')">👍 ${updateData.likes}</button>
        <button onclick="commentUpdate('${updateKey}')">💬 Comment</button>
        <button onclick="shareUpdate('${updateKey}')">🔗 Share</button>
      </div>
      <div class="comments" id="comments-${updateKey}">
        <!-- Comments will be loaded here -->
      </div>
    `;

    updatesFeed.appendChild(updateDiv);
    loadComments(updateKey); // Load comments for this update
  });
});

// Like Update
async function likeUpdate(updateKey) {
  const updateRef = ref(db, `updates/${updateKey}`);
  const snapshot = await get(updateRef);
  const updateData = snapshot.val();

  await update(updateRef, { likes: updateData.likes + 1 });
  logEvent(analytics, "like_update", { userId: currentUserId, updateKey });
}

// Comment on Update
async function commentUpdate(updateKey) {
  const comment = prompt("Enter your comment:");
  if (comment) {
    const commentsRef = ref(db, `updates/${updateKey}/comments`);
    await push(commentsRef, { user: auth.currentUser?.email, comment });
    loadComments(updateKey); // Refresh comments
    logEvent(analytics, "comment_update", { userId: currentUserId, updateKey, comment });
  }
}

// Load Comments
function loadComments(updateKey) {
  const commentsRef = ref(db, `updates/${updateKey}/comments`);
  const commentsContainer = document.getElementById(`comments-${updateKey}`);

  onValue(commentsRef, (snapshot) => {
    commentsContainer.innerHTML = ""; // Clear comments

    snapshot.forEach((childSnapshot) => {
      const commentData = childSnapshot.val();
      const commentDiv = document.createElement("div");
      commentDiv.textContent = `${commentData.user}: ${commentData.comment}`;
      commentsContainer.appendChild(commentDiv);
    });
  });
}

// Share Update
function shareUpdate(updateKey) {
  alert("Shared successfully!");
  logEvent(analytics, "share_update", { userId: currentUserId, updateKey });
}

// Add Ads Dynamically
function loadAds() {
  const adsRef = ref(db, "ads");

  onValue(adsRef, (snapshot) => {
    adsGrid.innerHTML = ""; // Clear ads section

    snapshot.forEach((childSnapshot) => {
      const adData = childSnapshot.val();
      const adBox = document.createElement("div");
      adBox.classList.add("ad-box");

      if (adData.type === "video") {
        adBox.innerHTML = `
          <video src="${adData.content}" controls style="width: 100%;"></video>
          <p>${adData.title}</p>
        `;
      } else if (adData.type === "image") {
        adBox.innerHTML = `
          <img src="${adData.content}" alt="${adData.title}" style="width: 100%; border-radius: 5px;">
          <p>${adData.title}</p>
        `;
      }

      adBox.addEventListener("click", async () => {
        alert(`You clicked on "${adData.title}"`);
        await push(ref(db, "ads/clicks"), { adName: adData.title, user: auth.currentUser?.email });
        addCoins(5); // Reward 5 coins
        logEvent(analytics, "click_ad", { userId: currentUserId, adName: adData.title });
      });

      adsGrid.appendChild(adBox);
    });
  });
}

// Load Ads on Page Load
loadAds();
