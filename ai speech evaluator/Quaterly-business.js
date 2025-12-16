const questions = [
  "Present the key metrics and performance highlightsfrom this quarter.",
  "What are the Main challenges and how did you address them?",
  "Which intiaties Exceeded Expectations and why?",
  "What are you priorities and goals for next quarter.",
  "How will you allocate resources to achieve goals?"
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
