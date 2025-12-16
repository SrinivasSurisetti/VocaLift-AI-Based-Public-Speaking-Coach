// practice.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyChJUq8k5x0XWCz6IK9cSMjVmabDrVKY-w",
  authDomain: "vocalift-auth.firebaseapp.com",
  projectId: "vocalift-auth",
  storageBucket: "vocalift-auth.appspot.com",
  messagingSenderId: "720243332182",
  appId: "1:720243332182:web:8b4713a173f767b1349790"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Load dynamic name/email in navbar
onAuthStateChanged(auth, (user) => {
  if (user) {
    const emailElem = document.getElementById("navbarUserEmail");
    const nameElem = document.getElementById("navbarUserName");

    if (emailElem) emailElem.textContent = user.email;
    if (nameElem) nameElem.textContent = user.displayName || "User";
  } else {
    window.location.href = "login.html";
  }
});

// Optional: ready for future interaction
console.log("Practice page ready!");