import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
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
  measurementId: "G-HGR6JKWBRZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// ** Track Page Load Event **
logEvent(analytics, "registration_page_viewed", { page: "Registration and Login Page" });

// Signup
document.getElementById("signup-btn").addEventListener("click", async () => {
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (password.length < 8) {
    alert("Password must be at least 8 characters long.");
    logEvent(analytics, "signup_failed", { reason: "Password too short" });
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful! Please log in to continue.");
    
    // Log Analytics Event
    logEvent(analytics, "signup_successful", { email: email });

    // Automatically switch to login form
    document.getElementById("signup-form").classList.remove("active");
    document.getElementById("login-form").classList.add("active");
  } catch (error) {
    console.error("Signup error:", error.message);
    alert(`Error: ${error.message}`);
    logEvent(analytics, "signup_failed", { reason: error.message });
  }
});

// Login
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("userToken", userCredential.user.accessToken);
    alert("Login successful!");

    // Log Analytics Event
    logEvent(analytics, "login_successful", { email: email });

    window.location.href = "home.html"; // Navigate to home page after login
  } catch (error) {
    console.error("Login error:", error.message);
    alert(`Error: ${error.message}`);
    logEvent(analytics, "login_failed", { reason: error.message });
  }
});

// Password Reset
document.getElementById("forgot-pass").addEventListener("click", async () => {
  const email = prompt("Enter your email to reset your password:");
  if (email) {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");

      // Log Analytics Event
      logEvent(analytics, "password_reset_requested", { email: email });
    } catch (error) {
      console.error("Password reset error:", error.message);
      alert(`Error: ${error.message}`);
      logEvent(analytics, "password_reset_failed", { reason: error.message });
    }
  }
});

// Toggle Between Forms
document.getElementById("show-login").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("signup-form").classList.remove("active");
  document.getElementById("login-form").classList.add("active");

  // Log Analytics Event
  logEvent(analytics, "form_switched", { from: "signup", to: "login" });
});

document.getElementById("show-signup").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("login-form").classList.remove("active");
  document.getElementById("signup-form").classList.add("active");

  // Log Analytics Event
  logEvent(analytics, "form_switched", { from: "login", to: "signup" });
});

// Admin Login Navigation
const adm = document.getElementById("adm");
adm.addEventListener("click", () => {
  // Log Analytics Event
  logEvent(analytics, "admin_login_attempted", { page: "Admin Login" });
  window.location.href = "admin.html";
});
