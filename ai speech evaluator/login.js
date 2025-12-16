// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyChJUq8k5x0XWCz6IK9cSMjVmabDrVKY-w",
  authDomain: "vocalift-auth.firebaseapp.com",
  projectId: "vocalift-auth",
  storageBucket: "vocalift-auth.appspot.com",
  messagingSenderId: "720243332182",
  appId: "1:720243332182:web:8b4713a173f767b1349790",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle email/password login
window.handleLogin = function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const status = document.getElementById("loginStatus");

  if (!email || !password) {
    status.textContent = "❗ Please enter both email and password.";
    status.style.color = "red";
    return;
  }

  if (password.length < 6) {
    status.textContent = "⚠️ Password must be at least 6 characters.";
    status.style.color = "red";
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      status.textContent = `✅ Login successful!`;
      status.style.color = "green";
      showLoginSuccessTransition();
    })
    .catch((error) => {
      status.textContent = "❌ " + error.message;
      status.style.color = "red";
    });
};

// Handle Google Sign-In
window.handleGoogleLogin = function () {
  const provider = new GoogleAuthProvider();
  const status = document.getElementById("loginStatus");

  signInWithPopup(auth, provider)
    .then(() => {
      status.textContent = `✅ Login successful!`;
      status.style.color = "green";
      showLoginSuccessTransition();
    })
    .catch((error) => {
      status.textContent = "❌ " + error.message;
      status.style.color = "red";
    });
};

// Optional: Auto greet already logged-in user
onAuthStateChanged(auth, (user) => {
  const status = document.getElementById("loginStatus");
  if (user) {
    status.textContent = `👋 You're already signed in.`;
    status.style.color = "green";
  }
});

// Transition effect before redirect
function showLoginSuccessTransition() {
  const container = document.querySelector(".container");
  container.classList.add("login-success");

  setTimeout(() => {
    window.location.href = "dashboard.html"; // Or any home page
  }, 1200);
}
