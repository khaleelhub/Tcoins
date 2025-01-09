import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, onValue, update, push, remove } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

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

// DOM Elements
const totalUsersElem = document.getElementById("total-users");
const totalCoinsElem = document.getElementById("total-coins-distributed");
const coinsToDollarsElem = document.getElementById("coins-to-dollars");
const activeAdsElem = document.getElementById("active-ads");
const totalEarningsElem = document.getElementById("total-earnings");
const usersTable = document.getElementById("users-table").querySelector("tbody");
const withdrawalsTable = document.getElementById("withdrawals-table").querySelector("tbody");
const adsList = document.getElementById("ads-list");
const addAdForm = document.getElementById("add-ad-form");
const adNameInput = document.getElementById("ad-name");
const adTypeInput = document.getElementById("ad-type");
const adUrlInput = document.getElementById("ad-url");

// Constants
const COIN_TO_DOLLAR_RATE = 3000 / 0.4;

// ** Platform Statistics **
function loadStatistics() {
  onValue(ref(db, "users"), (snapshot) => {
    let totalUsers = 0;
    let totalCoins = 0;

    snapshot.forEach((childSnapshot) => {
      totalUsers++;
      totalCoins += childSnapshot.val().coins || 0;
    });

    totalUsersElem.textContent = totalUsers;
    totalCoinsElem.textContent = totalCoins;
    coinsToDollarsElem.textContent = `$${(totalCoins / COIN_TO_DOLLAR_RATE).toFixed(2)}`;
  });

  onValue(ref(db, "ads"), (snapshot) => {
    activeAdsElem.textContent = snapshot.size || 0;
  });

  onValue(ref(db, "transactions"), (snapshot) => {
    let totalEarnings = 0;

    snapshot.forEach((childSnapshot) => {
      const transaction = childSnapshot.val();
      totalEarnings += (transaction.amount || 0) * 0.0004;
    });

    totalEarningsElem.textContent = `$${totalEarnings.toFixed(2)}`;
  });
}

// ** User Management **
function loadUsers() {
  onValue(ref(db, "users"), (snapshot) => {
    usersTable.innerHTML = ""; // Clear table

    snapshot.forEach((childSnapshot) => {
      const userId = childSnapshot.key;
      const userData = childSnapshot.val();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${userData.email}</td>
        <td>${userData.coins || 0}</td>
        <td id="user-status-${userId}">${userData.status || "Active"}</td>
        <td>
          <button class="deactivate-btn" data-user-id="${userId}">Deactivate</button>
          <button class="reset-coins-btn" data-user-id="${userId}">Reset Coins</button>
        </td>
      `;
      usersTable.appendChild(row);
    });
  });
}

// ** Withdrawal Requests **
function loadWithdrawals() {
  onValue(ref(db, "withdrawals"), (snapshot) => {
    withdrawalsTable.innerHTML = ""; // Clear table

    snapshot.forEach((childSnapshot) => {
      const requestId = childSnapshot.key;
      const request = childSnapshot.val();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${request.userId}</td>
        <td>${request.amount}</td>
        <td>${request.bankName || ""} - ${request.accountNumber || ""}</td>
        <td id="withdrawal-status-${requestId}">${request.status || "Pending"}</td>
        <td>
          <button class="approve-btn" data-request-id="${requestId}">Approve</button>
          <button class="decline-btn" data-request-id="${requestId}">Decline</button>
        </td>
      `;
      withdrawalsTable.appendChild(row);
    });
  });
}

// ** Ad Management **
function loadAds() {
  onValue(ref(db, "ads"), (snapshot) => {
    adsList.innerHTML = ""; // Clear ads list

    snapshot.forEach((childSnapshot) => {
      const adId = childSnapshot.key;
      const ad = childSnapshot.val();

      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <span>${ad.adName} (${ad.adType})</span>
        <button class="edit-ad-btn" data-ad-id="${adId}">Edit</button>
        <button class="delete-ad-btn" data-ad-id="${adId}">Delete</button>
      `;
      adsList.appendChild(listItem);
    });
  });
}

// ** Event Listeners **
document.addEventListener("click", (event) => {
  const target = event.target;

  if (target.classList.contains("deactivate-btn")) {
    const userId = target.dataset.userId;
    update(ref(db, `users/${userId}`), { status: "Deactivated" });
  }

  if (target.classList.contains("reset-coins-btn")) {
    const userId = target.dataset.userId;
    update(ref(db, `users/${userId}`), { coins: 0 });
  }

  if (target.classList.contains("approve-btn")) {
    const requestId = target.dataset.requestId;
    update(ref(db, `withdrawals/${requestId}`), { status: "Approved" });
  }

  if (target.classList.contains("decline-btn")) {
    const requestId = target.dataset.requestId;
    update(ref(db, `withdrawals/${requestId}`), { status: "Declined" });
  }

  if (target.classList.contains("delete-ad-btn")) {
    const adId = target.dataset.adId;
    remove(ref(db, `ads/${adId}`));
  }
});

// ** Add Ad **
addAdForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const adName = adNameInput.value.trim();
  const adType = adTypeInput.value;
  const adUrl = adUrlInput.value.trim();

  if (adName && adUrl) {
    push(ref(db, "ads"), { adName, adType, adUrl });
    alert("Ad added successfully!");
    addAdForm.reset();
  }
});

// ** Load Initial Data **
loadStatistics();
loadUsers();
loadWithdrawals();
loadAds();
