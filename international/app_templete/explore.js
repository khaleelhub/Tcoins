import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, push, update, get, onValue } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
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
const db = getDatabase(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// DOM Elements
const adsSection = document.getElementById("ads-section");
const templateAd = document.getElementById("template-ad");

let userId = null; // Track logged-in user

// Authenticate User
onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
    loadAds(); // Load ads after user authentication
  } else {
    alert("You need to log in first.");
    window.location.href = "login.html";
  }
});

// Load Ads from Firebase
function loadAds() {
  const adsRef = ref(db, "ads");
  onValue(adsRef, (snapshot) => {
    adsSection.innerHTML = ""; // Clear existing ads

    snapshot.forEach((childSnapshot) => {
      const adId = childSnapshot.key;
      const adData = childSnapshot.val();

      const adBox = templateAd.cloneNode(true);
      adBox.removeAttribute("id");
      adBox.hidden = false;

      if (adData.type === "image") {
        adBox.querySelector(".ad-image").src = adData.content;
        adBox.querySelector(".ad-image").hidden = false;
      } else if (adData.type === "video") {
        adBox.querySelector(".ad-video source").src = adData.content;
        adBox.querySelector(".ad-video").hidden = false;
      }

      adBox.querySelector(".ad-title").textContent = adData.title;
      adBox.querySelector(".ad-description").textContent = adData.description;
      adBox.querySelector(".like-btn").setAttribute("data-id", adId);
      adBox.querySelector(".click-btn").setAttribute("data-id", adId);
      adBox.querySelector(".like-count").textContent = adData.likes || 0;

      adsSection.appendChild(adBox);
    });
  });
}

// Like Ad
adsSection.addEventListener("click", async (e) => {
  if (e.target.classList.contains("like-btn")) {
    const adId = e.target.getAttribute("data-id");
    const likeCountElem = e.target.querySelector(".like-count");

    // Prevent Multiple Likes
    const userLikeRef = ref(db, `ads/${adId}/likes/${userId}`);
    const likeSnapshot = await get(userLikeRef);
    if (likeSnapshot.exists()) {
      alert("You already liked this ad!");
      return;
    }

    // Save Like in Firebase
    await update(userLikeRef, { liked: true });
    likeCountElem.textContent = parseInt(likeCountElem.textContent) + 1;

    // Update Total Likes
    const adRef = ref(db, `ads/${adId}`);
    const adSnapshot = await get(adRef);
    const adData = adSnapshot.val() || { likes: 0 };
    await update(adRef, { likes: (adData.likes || 0) + 1 });

    // Log Analytics Event
    logEvent(analytics, "ad_liked", { adId });
  }
});

// Click Ad
adsSection.addEventListener("click", async (e) => {
  if (e.target.classList.contains("click-btn")) {
    const adId = e.target.getAttribute("data-id");

    // Prevent Multiple Clicks
    const userClickRef = ref(db, `ads/${adId}/clicks/${userId}`);
    const clickSnapshot = await get(userClickRef);
    if (clickSnapshot.exists()) {
      alert("You already clicked this ad!");
      return;
    }

    // Update User Coins
    const userRef = ref(db, `users/${userId}`);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val() || { coins: 0 };
    await update(userRef, { coins: (userData.coins || 0) + 5 });

    // Save Click in Firebase
    await update(userClickRef, { clicked: true });

    alert("You earned 5 coins!");

    // Log Analytics Event
    logEvent(analytics, "ad_clicked", { adId });
  }
});
