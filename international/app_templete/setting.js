import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, updatePassword, signOut } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase, ref, update, get } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

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

// Update Password
document.getElementById("update-password-btn").addEventListener("click", async () => {
  const currentPassword = document.getElementById("current-password").value.trim();
  const newPassword = document.getElementById("new-password").value.trim();

  if (newPassword.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  try {
    await updatePassword(auth.currentUser, newPassword);
    alert("Password updated successfully!");
  } catch (error) {
    alert(`Error updating password: ${error.message}`);
  }
});

// Update Profile
document.getElementById("update-profile-btn").addEventListener("click", async () => {
  const name = document.getElementById("user-name").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const userId = auth.currentUser.uid;
  const userRef = ref(db, `users/${userId}`);

  try {
    await update(userRef, { name, email });
    alert("Profile updated successfully!");
  } catch (error) {
    alert(`Error updating profile: ${error.message}`);
  }
});

// Theme Selection
document.getElementById("theme-selection").addEventListener("change", (e) => {
  const selectedTheme = e.target.value;
  document.body.className = `${selectedTheme}-theme`;
});

// Notification Preferences
document.querySelectorAll("[id^=notif]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const preferences = {
      coinUpdates: document.getElementById("notif-coins").checked,
      promotions: document.getElementById("notif-promotions").checked,
      systemAlerts: document.getElementById("notif-system").checked,
    };
    const userId = auth.currentUser.uid;
    const userRef = ref(db, `users/${userId}`);
    update(userRef, { notificationPreferences: preferences });
  });
});

// Log Out of All Sessions
document.getElementById("logout-all-sessions-btn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Logged out of all sessions.");
    window.location.href = "userRegistulation.html";
  } catch (error) {
    alert(`Error logging out: ${error.message}`);
  }
});
