// signup.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyChJUq8k5x0XWCz6IK9cSMjVmabDrVKY-w",
  authDomain: "vocalift-auth.firebaseapp.com",
  projectId: "vocalift-auth",
  storageBucket: "vocalift-auth.appspot.com",
  messagingSenderId: "720243332182",
  appId: "1:720243332182:web:8b4713a173f767b1349790",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to handle signup
window.handleSignup = function () {
  const name = document.getElementById("nameInput").value;
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  if (!name || !email || !password) {
    showMessage("Please fill in all the fields.", "red");
    return;
  }

  if (password.length < 6) {
    showMessage("Password should be at least 6 characters.", "red");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return updateProfile(userCredential.user, {
        displayName: name,
      });
    })
    .then(() => {
      showMessage("✅ Account created successfully! Redirecting...", "green");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    })
    .catch((error) => {
      const userFriendlyMessage = mapFirebaseError(error.code);
      showMessage("❌ " + userFriendlyMessage, "red");
    });
};

// Helper: Show message
function showMessage(message, color) {
  let msgBox = document.getElementById("signupMessage");
  if (!msgBox) {
    msgBox = document.createElement("p");
    msgBox.id = "signupMessage";
    msgBox.className = "status-message";
    document.querySelector(".right").appendChild(msgBox);
  }
  msgBox.textContent = message;
  msgBox.style.color = color;
}

// Map Firebase errors to clean messages
function mapFirebaseError(code) {
  const errorMessages = {
    "auth/email-already-in-use": "This email is already registered. Try logging in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    default: "An error occurred. Please try again.",
  };
  return errorMessages[code] || errorMessages.default;
}
