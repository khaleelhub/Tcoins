//  ***************************************************************************************************************
// Navigation Controller
const home = document.getElementById("home");
const notify = document.getElementById("Notification");
const chat = document.getElementById("chat");
const setting = document.getElementById("setting");
const dashboad = document.getElementById("dashboad");

home.addEventListener("click", () => {
  window.location.href = "home.html";
});
notify.addEventListener("click", () => {
  window.location.href = "Notification.html";
});

chat.addEventListener("click", () => {
  window.location.href = "chat.html";
});
setting.addEventListener("click", () => {
  window.location.href = "setting.html";
});
dashboad.addEventListener("click", () => {
  window.location.href = "dashboad.html";
});


