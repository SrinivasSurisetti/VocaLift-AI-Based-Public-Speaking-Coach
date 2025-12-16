import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyChJUq8k5x0XWCz6IK9cSMjVmabDrVKY-w",
  authDomain: "vocalift-auth.firebaseapp.com",
  projectId: "vocalift-auth",
  storageBucket: "vocalift-auth.appspot.com",
  messagingSenderId: "720243332182",
  appId: "1:720243332182:web:8b4713a173f767b13497"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

onAuthStateChanged(auth, async user => {
  if (!user) {
    console.log("User not signed in.");
    return;
  }

  document.getElementById("welcomeName").textContent =
    user.displayName || user.email;

  /* ─────────────────────────────────────────────
     1️⃣  Get doc refs and common date helpers
  ───────────────────────────────────────────── */
  const metricsRef = doc(db, "users", user.uid, "progress", "metrics");
  const userRef    = doc(db, "users", user.uid);

  const now            = new Date();
  const todayDateStr   = now.toISOString().split("T")[0];
  const currentWeekKey = getWeekYearString(now);        // e.g. “2025-W30”

  /* ─────────────────────────────────────────────
     2️⃣  Read & update the main user doc
  ───────────────────────────────────────────── */
  let streakDays   = 0;   // declare outside so we can reuse later
  let totalSessions = 0;

  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const d = userSnap.data();

    const lastSession = d.lastSessionDate || null;
    streakDays        = d.streakDays     || 0;
    totalSessions     = d.totalSessions  || 0;

    // streak calculation
    if (lastSession) {
      const diff = getDateDiffInDays(new Date(lastSession), now);
      streakDays = diff === 1 ? streakDays + 1 : diff > 1 ? 1 : streakDays;
    } else {
      streakDays = 1;
    }

    // weekly achievements
    const weeklyAchievements = d.weeklyAchievements || {};
    weeklyAchievements[currentWeekKey] = [
      ...(weeklyAchievements[currentWeekKey] || []),
      `Completed Session ${totalSessions + 1}`
    ];

    await updateDoc(userRef, {
      totalSessions:     totalSessions + 1,
      streakDays,
      lastSessionDate:   todayDateStr,
      weeklyAchievements
    });

    totalSessions += 1;              // keep local value in‑sync
  } else {
    // first‑time user doc
    streakDays   = 1;
    totalSessions = 1;

    await setDoc(userRef, {
      totalSessions,
      streakDays,
      lastSessionDate: todayDateStr,
      weeklyAchievements: {
        [currentWeekKey]: ["Completed Session 1"]
      }
    });
  }

  /* ─────────────────────────────────────────────
     3️⃣  Sync / initialise the metrics document
  ───────────────────────────────────────────── */
  const metricsSnap = await getDoc(metricsRef); // fresh read

  if (metricsSnap.exists()) {
    await updateDoc(metricsRef, {
      totalSessions,
      streakDays,
      lastSessionDate: todayDateStr
    });
  } else {
    await setDoc(metricsRef, {
      totalSessions,
      streakDays,
      lastSessionDate: todayDateStr,
      averageScore: 0,
      improvement: 0,
      achievements: {},
      recentSessions: [],
      weeklyProgress: {}
    });
  }

  /* ─────────────────────────────────────────────
     4️⃣  Now pull the (just‑updated) metrics doc
        and render the dashboard
  ───────────────────────────────────────────── */
  const data = (await getDoc(metricsRef)).data();   // ← fresh values

  //   ▸ TOTAL STATS
  document.getElementById("totalSessions").textContent = data.totalSessions || 0;
  document.getElementById("averageScore").textContent  =
    data.averageScore?.toFixed(1) || "0.0";
  document.getElementById("improvement").textContent   =
    `+${data.improvement || 0}%`;
  document.getElementById("streakDays").textContent    = data.streakDays  || 0;

  //   ▸ RECENT SESSIONS
  const recentContainer = document.querySelector(".recent-sessions");
  recentContainer.innerHTML = "<h3>Recent Sessions</h3>";
  if (data.recentSessions?.length) {
    data.recentSessions.slice(0, 3).forEach(s => {
      recentContainer.innerHTML += `
        <div class="session-item">
          <div>
            <strong>${s.title}</strong><br><small>${s.date}</small>
          </div>
          <div>${s.score} · ${s.duration}</div>
        </div>`;
    });
  } else {
    recentContainer.innerHTML += "<p>No sessions yet.</p>";
  }

  //   ▸ ACHIEVEMENTS
  const achContainer = document.querySelector(".achievements");
  achContainer.innerHTML = "<h3>Achievements</h3>";
  const achievementMap = {
    firstSession:      "First Session",
    fiveDayStreak:     "5‑Day Streak",
    highScorer:        "High Scorer",
    confidenceBuilder: "Confidence Builder"
  };
  const achievements = data.achievements || {};
  Object.keys(achievementMap).forEach(key => {
    const unlocked = achievements[key];
    achContainer.innerHTML += `
      <div class="achievement ${unlocked ? "success" : "disabled"}">
        <i class="fas fa-bolt"></i> ${achievementMap[key]}<br>
        <small>${getAchievementDesc(key)}</small>
      </div>`;
  });

  //   ▸ WEEKLY PROGRESS (unchanged)
  const progressBarMap = {
    "Speech Clarity":   0,
    "Confidence Level": 0,
    "Body Language":    0,
    "Pace Control":     0
  };
  const weekly = data.weeklyProgress || {};
  const days   = Object.keys(weekly).length;
  Object.values(weekly).forEach(v => {
    progressBarMap["Speech Clarity"]   += v * 25;
    progressBarMap["Confidence Level"] += v * 20;
    progressBarMap["Body Language"]    += v * 30;
    progressBarMap["Pace Control"]     += v * 25;
  });
  const progressContainer = document.querySelector(".progress");
  progressContainer.innerHTML = "<h3>Weekly Progress</h3>";
  Object.entries(progressBarMap).forEach(([label, val], i) => {
    const percent    = days ? Math.round(val / days) : 0;
    const colorClass = ["orange", "green", "blue", "purple"][i];
    progressContainer.innerHTML += `
      <div class="progress-bar"><span>${label}</span><span>${percent}%</span></div>
      <div class="bar ${colorClass}-bar" style="width:${percent}%"></div>`;
  });
});

/*───────────────────────── Helpers ─────────────────────────*/
function getAchievementDesc(key) {
  switch (key) {
    case "firstSession":      return "Completed your first speaking session";
    case "fiveDayStreak":     return "Practiced for 5 consecutive days";
    case "highScorer":        return "Achieved a score above 8.5";
    case "confidenceBuilder": return "Completed 50 speaking sessions";
    default: return "";
  }
}

function getDateDiffInDays(a, b) {
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function getWeekYearString(date) {
  const jan1  = new Date(date.getFullYear(), 0, 1);
  const days  = Math.floor((date - jan1) / 864e5);
  const week  = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${week}`;
}
