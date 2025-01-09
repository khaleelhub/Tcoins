import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCgM34-XC4WdJ3WXeFMSO0pu75kQPPQqlk",
    authDomain: "t-coins-world.firebaseapp.com",
    databaseURL: "https://t-coins-world-default-rtdb.firebaseio.com",
    projectId: "t-coins-world",
    storageBucket: "t-coins-world.firebasestorage.app",
    messagingSenderId: "1065880477947",
    appId: "1:1065880477947:web:9ebb8e28c58a8f2aa4505e",
    measurementId: "G-HGR6JKWBRZ"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let generatedOTP = null;

// Admin Login
document.getElementById("admin-login-btn").addEventListener("click", async () => {
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;

  if (email === "youradminemail@example.com" && password === "YourSecurePassword") {
    generatedOTP = Math.floor(100000 + Math.random() * 900000);
    alert(`Your OTP is: ${generatedOTP}`);
    document.getElementById("otp-section").style.display = "block";
  } else {
    alert("Unauthorized access!");
  }
});

// Verify OTP
document.getElementById("verify-otp-btn").addEventListener("click", () => {
  const enteredOTP = document.getElementById("admin-otp").value;

  if (parseInt(enteredOTP) === generatedOTP) {
    alert("OTP verified! Admin login successful.");
    window.location.href = "adminDarshboead.html";
  } else {
    alert("Invalid OTP. Please try again.");
  }
});
