// ✅ auth.js — Firebase + UI logic
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyChJUq8k5x0XWCz6IK9cSMjVmabDrVKY-w",
  authDomain: "vocalift-auth.firebaseapp.com",
  projectId: "vocalift-auth",
  storageBucket: "vocalift-auth.appspot.com",
  messagingSenderId: "720243332182",
  appId: "1:720243332182:web:8b4713a173f767b1349790"
};

// 🔧 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Load User Stats from Firestore
async function loadUserStats(uid) {
  const progressRef = doc(db, "users", uid); // 🔥 Direct document under users collection
 // 👈 subcollection
  const progressSnap = await getDoc(progressRef);

  if (progressSnap.exists()) {
    const data = progressSnap.data();
    document.getElementById("total-sessions").textContent = data.totalSessions ?? "0";

    // 🔁 Convert totalMinutesPracticed to hours
    const totalMinutes = data.totalMinutesPracticed ?? 0;
    const hours = (totalMinutes / 60).toFixed(1);
    document.getElementById("hours-practiced").textContent = hours;

    document.getElementById("avg-score").textContent = data.avgScore ?? "0";
    document.getElementById("streak-days").textContent = data.streakDays ?? "0";
  } else {
    console.warn("⚠️ Progress data not found.");
  }
}


// ✅ Show user info in navbar
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("userName").textContent = user.displayName || "User";
    loadUserStats(user.uid); // 👈 Load stats for this user
  } else {
    // 🔒 Redirect to login if not authenticated
    window.location.href = "login.html";
  }
});

// 🚪 Logout handler
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}

// ✅ UI Logic (unchanged)
document.addEventListener('DOMContentLoaded', () => {
  // TAB SWITCH
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tabId)?.classList.add('active');
    });
  });

  // REMINDER
  const reminderForm = document.getElementById('reminderModal');
  const reminderBtn = document.querySelector('.set-reminder');
  const cancelBtn = document.getElementById('cancelReminder');
  const confirmBtn = document.getElementById('confirmReminder');
  const statusMsg = document.getElementById('reminderStatus');

  reminderBtn?.addEventListener('click', () => {
    reminderForm?.classList.remove('hidden');
    reminderForm?.scrollIntoView({ behavior: 'smooth' });
  });

  cancelBtn?.addEventListener('click', () => {
    reminderForm?.classList.add('hidden');
    if (statusMsg) statusMsg.textContent = '';
  });

  confirmBtn?.addEventListener('click', () => {
    const dateTimeInput = document.getElementById('reminderDateTime');
    const dateTime = dateTimeInput?.value;
    if (!dateTime) {
      statusMsg.textContent = 'Please select a valid date and time.';
      statusMsg.style.color = 'red';
      return;
    }
    statusMsg.textContent = `✅ Reminder set for ${new Date(dateTime).toLocaleString()}`;
    statusMsg.style.color = 'green';
    setTimeout(() => {
      reminderForm?.classList.add('hidden');
      statusMsg.textContent = '';
    }, 3000);
  });

  // STATUS MESSAGE
  function showActionStatus(message, isSuccess = true) {
    const actionStatus = document.getElementById('actionStatus');
    if (!actionStatus) return;
    actionStatus.textContent = message;
    actionStatus.className = `action-status ${isSuccess ? 'success' : 'error'}`;
    actionStatus.style.display = 'block';
    setTimeout(() => {
      actionStatus.style.display = 'none';
    }, 4000);
  }

  // EXPORT REPORT
  const exportBtn = document.querySelector('.export-report');
  exportBtn?.addEventListener('click', () => {
    const report = `
VocaLift Progress Report

Total Sessions: ${document.getElementById('total-sessions')?.textContent || 'N/A'}
Hours Practiced: ${document.getElementById('hours-practiced')?.textContent || 'N/A'}
Average Score: ${document.getElementById('avg-score')?.textContent || 'N/A'}
Streak Days: ${document.getElementById('streak-days')?.textContent || 'N/A'}

Generated on ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'VocaLift_Progress_Report.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showActionStatus('✅ Progress report downloaded.');
  });

  // SHARE PANEL
  const shareBtn = document.querySelector('.share-achievement');
  const sharePanel = document.getElementById('sharePanel');
  const closeSharePanel = document.getElementById('closeSharePanel');
  const whatsappBtn = document.getElementById('whatsappShare');
  const linkedinBtn = document.getElementById('linkedinShare');
  const twitterBtn = document.getElementById('twitterShare');
  const copyBtn = document.getElementById('copyShare');

  const shareText = encodeURIComponent("🎉 I just unlocked new achievements on VocaLift! Track your voice progress at https://vocalift.com");

  shareBtn?.addEventListener('click', () => {
    if (!sharePanel) return;
    sharePanel.classList.toggle('hidden');
    whatsappBtn.href = `https://wa.me/?text=${shareText}`;
    linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=https://vocalift.com`;
    twitterBtn.href = `https://twitter.com/intent/tweet?text=${shareText}`;
  });

  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(decodeURIComponent(shareText));
      showActionStatus('✅ Achievement message copied!');
      sharePanel?.classList.add('hidden');
    } catch {
      showActionStatus('❌ Could not copy to clipboard.', false);
    }
  });

  closeSharePanel?.addEventListener('click', () => {
    sharePanel?.classList.add('hidden');
  });
});
