const questions = [
  "Why do you want to work for our company?",
  "Why are you leaving your current job?",
  "what do you know about our comapny culture?",
  "How does this position align with your career goals?",
  "What attracts you to this specific role?"
];

let currentQuestion = 0;

const questionText = document.getElementById("questionText");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const dots = document.querySelectorAll(".dot");
const recordBtn = document.getElementById("recordBtn");
const timerDisplay = document.getElementById("timer");

let mediaRecorder;
let chunks = [];
let timerInterval;
let seconds = 0;

// Update question and buttons
function updateUI() {
  questionText.textContent = questions[currentQuestion];

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentQuestion);
  });

  prevBtn.disabled = currentQuestion === 0;

  if (currentQuestion === questions.length - 1) {
    nextBtn.textContent = "Finish Practice";
  } else {
    nextBtn.textContent = "Next →";
  }
}

// Timer functions
function startTimer() {
  seconds = 0;
  timerDisplay.textContent = "00:00";
  timerInterval = setInterval(() => {
    seconds++;
    let mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    let secs = String(seconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Navigation Buttons
nextBtn.addEventListener("click", () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    updateUI();
  } else {
    // Last question, navigate to Practice page
    window.location.href = "practice.html";
  }
});

prevBtn.addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    updateUI();
  }
});

// 🎤 Recording Button
recordBtn.addEventListener("click", async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      stopTimer();
      const blob = new Blob(chunks, { type: "audio/webm" });
      const audioURL = URL.createObjectURL(blob);
      const audio = new Audio(audioURL);
      audio.controls = true;
      document.body.appendChild(audio);
    };

    mediaRecorder.start();
    startTimer();
    recordBtn.textContent = "⏹ Stop Recording";
  } else if (mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordBtn.textContent = "🎤 Start Recording Answer";
  }
});

// Initial UI setup
updateUI();
