import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, onValue, update, push } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
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
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// DOM Elements
const totalCoinsElem = document.getElementById("total-coins");
const coinBreakdownElem = document.getElementById("coin-breakdown");
const dollarValueElem = document.getElementById("dollar-value");
const transactionTable = document.getElementById("transaction-table").querySelector("tbody");
const referralCodeElem = document.getElementById("referral-code");
const copyReferralBtn = document.getElementById("copy-referral-btn");
const withdrawalList = document.getElementById("withdrawal-list");
const recipientEmailInput = document.getElementById("recipient-email");
const transferAmountInput = document.getElementById("transfer-amount");
const transferBtn = document.getElementById("transfer-btn");
const accountNameInput = document.getElementById("account-name");
const accountNumberInput = document.getElementById("account-number");
const bankNameInput = document.getElementById("bank-name");
const withdrawAmountInput = document.getElementById("withdraw-amount");
const withdrawBtn = document.getElementById("withdraw-btn");

let currentUserId = null;
let userCoins = 0;
let referralCode = null;

// Track Current User
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    loadDashboard();
  } else {
    window.location.href = "login.html"; // Redirect to login
  }
});

// Load Dashboard Data
function loadDashboard() {
  loadUserCoins();
  loadTransactions();
  generateReferralCode();
  loadWithdrawalRequests();
  loadEarningStats();
}

// Load Coins and Breakdown
function loadUserCoins() {
  const userRef = ref(db, `users/${currentUserId}`);
  onValue(userRef, (snapshot) => {
    const userData = snapshot.val();
    userCoins = userData?.coins || 0;

    totalCoinsElem.textContent = userCoins;
    dollarValueElem.textContent = `$${(userCoins / 3000 * 0.4).toFixed(2)}`;
    coinBreakdownElem.innerHTML = `
      <li>Video Click Coins: ${userData?.videoClickCoins || 0}</li>
      <li>Claimed Coins: ${userData?.claimedCoins || 0}</li>
    `;
  });
}

// Load Transactions
function loadTransactions() {
  const transactionsRef = ref(db, `transactions/${currentUserId}`);
  onValue(transactionsRef, (snapshot) => {
    transactionTable.innerHTML = ""; // Clear transactions

    snapshot.forEach((childSnapshot) => {
      const transaction = childSnapshot.val();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(transaction.timestamp).toLocaleDateString()}</td>
        <td>${transaction.description}</td>
        <td>${transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount}</td>
      `;
      transactionTable.appendChild(row);
    });
  });
}

// Generate Referral Code
function generateReferralCode() {
  referralCode = `REF-${currentUserId.slice(0, 6).toUpperCase()}`;
  referralCodeElem.textContent = referralCode;
}

// Share Referral Code
document.getElementById("share-referral-btn").addEventListener("click", () => {
  const referralLink = `${window.location.origin}?ref=${referralCode}`;
  navigator.share({
    title: "Join T Coins",
    text: "Earn rewards by joining T Coins!",
    url: referralLink,
  }).catch((error) => console.error("Error sharing referral code:", error.message));
});

// Copy Referral Code
copyReferralBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(referralCode).then(() => alert("Referral code copied!"));
});

// Load Withdrawal Requests
function loadWithdrawalRequests() {
  const withdrawalsRef = ref(db, `withdrawals/${currentUserId}`);
  onValue(withdrawalsRef, (snapshot) => {
    withdrawalList.innerHTML = ""; // Clear list

    snapshot.forEach((childSnapshot) => {
      const withdrawal = childSnapshot.val();

      const listItem = document.createElement("li");
      listItem.textContent = `Amount: ${withdrawal.amount} - Status: ${withdrawal.status}`;
      withdrawalList.appendChild(listItem);
    });
  });
}

// Handle Coin Transfer
transferBtn.addEventListener("click", async () => {
  const recipientEmail = recipientEmailInput.value.trim();
  const transferAmount = parseInt(transferAmountInput.value.trim(), 10);

  if (!recipientEmail || transferAmount <= 0 || transferAmount > userCoins) {
    alert("Invalid transfer details or insufficient coins.");
    return;
  }

  try {
    const recipientRef = ref(db, "users");
    let recipientId = null;

    onValue(recipientRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val()?.email === recipientEmail) {
          recipientId = childSnapshot.key;
        }
      });

      if (recipientId) {
        const userRef = ref(db, `users/${currentUserId}`);
        const recipientUserRef = ref(db, `users/${recipientId}`);
        update(userRef, { coins: userCoins - transferAmount });
        update(recipientUserRef, { coins: recipientUserRef.coins + transferAmount });
        alert("Coins transferred successfully!");
      } else {
        alert("Recipient not found.");
      }
    });
  } catch (error) {
    console.error("Error transferring coins:", error.message);
  }
});

// Handle Withdrawal Requests
withdrawBtn.addEventListener("click", async () => {
  const accountName = accountNameInput.value.trim();
  const accountNumber = accountNumberInput.value.trim();
  const bankName = bankNameInput.value.trim();
  const withdrawAmount = parseInt(withdrawAmountInput.value.trim(), 10);

  if (!accountName || !accountNumber || accountNumber.length > 10 || !bankName || withdrawAmount > userCoins) {
    alert("Invalid withdrawal details or insufficient coins.");
    return;
  }

  try {
    const withdrawalRef = ref(db, `withdrawals/${currentUserId}`);
    await push(withdrawalRef, {
      accountName,
      accountNumber,
      bankName,
      amount: withdrawAmount,
      status: "Pending",
      timestamp: Date.now(),
    });
    alert("Withdrawal request submitted successfully!");
    accountNameInput.value = "";
    accountNumberInput.value = "";
    bankNameInput.value = "";
    withdrawAmountInput.value = "";
  } catch (error) {
    console.error("Error submitting withdrawal request:", error.message);
  }
});
