// navbar.js

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyChJUq8k5x0XWCz6IK9cSMjVmabDrVKY-w",
  authDomain: "vocalift-auth.firebaseapp.com",
  projectId: "vocalift-auth",
  storageBucket: "vocalift-auth.appspot.com",
  messagingSenderId: "720243332182",
  appId: "1:720243332182:web:8b4713a173f767b1349790"
};

// ✅ Check if Firebase is already initialized
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
  fetch("navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-container").innerHTML = data;

      const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
      document.querySelectorAll(".nav-item").forEach((link) => {
        const hrefPage = link.getAttribute("href").split("/").pop();
        link.classList.toggle("active", hrefPage === currentPage);
      });

      onAuthStateChanged(auth, (user) => {
        if (user) {
          const name = user.displayName || user.email.split("@")[0];
          const email = user.email;
          document.getElementById("navbarUserName").textContent = name;
          document.getElementById("navbarUserEmail").textContent = email;
        } else {
          window.location.href = "login.html";
        }
      });

      document.addEventListener("click", function (e) {
        if (e.target.closest(".logout")) {
          signOut(auth)
            .then(() => window.location.href = "login.html")
            .catch((error) => console.error("Logout error:", error));
        }
      });
    })
    .catch((error) => console.error("Navbar load error:", error));
});
