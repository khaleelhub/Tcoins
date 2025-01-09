// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase, ref, update, get } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";

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
const storage = getStorage(app);

// ***************************************************************************************************************
// Personalized Greeting and User Validation
onAuthStateChanged(auth, async (user) => {
  const greetingElement = document.getElementById("greeting");
  const timeGreetingElement = document.getElementById("time-greeting");
  const profileAvatar = document.getElementById("profile-avatar");

  if (user) {
    const userId = user.uid;
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);

    // Display user's name and avatar
    const userData = snapshot.val() || {};
    const userName = userData.name || user.email.split("@")[0];
    const avatarUrl = userData.avatar || "default-avatar.png";

    // Update UI
    const currentHour = new Date().getHours();
    const timeGreeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

    greetingElement.textContent = `Hello, ${userName}!`;
    timeGreetingElement.textContent = `${timeGreeting}!`;
    profileAvatar.src = avatarUrl;
  } else {
    // Redirect to login if no user is logged in
    window.location.href = "login.html";
  }
});

// ***************************************************************************************************************
// Avatar Upload
document.getElementById("upload-avatar").addEventListener("change", async (event) => {
  try {
    const file = event.target.files[0];
    const userId = auth.currentUser.uid;
    const avatarRef = storageRef(storage, `avatars/${userId}`);

    // Upload file to Firebase Storage
    await uploadBytes(avatarRef, file);
    const avatarUrl = await getDownloadURL(avatarRef);

    // Update user's avatar URL in the Realtime Database
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, { avatar: avatarUrl });

    document.getElementById("profile-avatar").src = avatarUrl;
    alert("Profile picture updated!");
  } catch (error) {
    console.error("Error uploading avatar: ", error.message);
    alert("Error updating avatar. Please try again.");
  }
});

// ***************************************************************************************************************
// Theme Selector
const themeDropdown = document.getElementById("theme-dropdown");

async function applyTheme(theme) {
  document.body.className = ""; // Reset all classes
  document.body.classList.add(`${theme}-theme`);

  try {
    const userId = auth.currentUser.uid;
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, { theme }); // Save theme to Firebase
  } catch (error) {
    console.error("Error saving theme: ", error.message);
  }
}

// Load theme on page load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userId = user.uid;
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const { theme } = snapshot.val();
        const savedTheme = theme || "dark"; // Default to dark theme
        themeDropdown.value = savedTheme;
        applyTheme(savedTheme);
      }
    } catch (error) {
      console.error("Error loading theme: ", error.message);
    }
  }
});

// Listen for theme changes
themeDropdown.addEventListener("change", (event) => {
  const selectedTheme = event.target.value;
  applyTheme(selectedTheme);
});

// ***************************************************************************************************************
// Navigation Guard
window.addEventListener("beforeunload", () => {
  if (!auth.currentUser) {
    alert("You must be logged in to navigate!");
    window.location.href = "login.html";
  }
});
