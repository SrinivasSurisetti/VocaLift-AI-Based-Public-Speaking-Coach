import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyChJUq8k5x0XWCz6IK9cSMjVmabDrVKY-w",
  authDomain: "vocalift-auth.firebaseapp.com",
  projectId: "vocalift-auth",
  storageBucket: "vocalift-auth.appspot.com",
  messagingSenderId: "720243332182",
  appId: "1:720243332182:web:8b4713a173f767b1349790"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Navbar user
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("navbarUserName").textContent = user.displayName || "User";
    document.getElementById("navbarUserEmail").textContent = user.email;
  } else {
    window.location.href = "login.html";
  }
});

// Video recording
let mediaRecorder;
let recordedChunks = [];
let seconds = 0;
let timerInterval;

const previewVideo = document.getElementById('previewVideo');
const startBtn = document.getElementById('startRecordBtn');
const stopBtn = document.getElementById('stopRecordBtn');
const uploadRecordedBtn = document.getElementById('uploadRecordedBtn');
const timerElem = document.getElementById('timer');

startBtn.addEventListener('click', async () => {
  recordedChunks = [];
  seconds = 0;
  timerElem.textContent = "00:00";

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  previewVideo.srcObject = stream;

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.start();
  startBtn.style.display = 'none';
  stopBtn.style.display = 'inline-block';

  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timerElem.textContent = `${mins}:${secs}`;
  }, 1000);
});

stopBtn.addEventListener('click', () => {
  mediaRecorder.stop();
  clearInterval(timerInterval);

  startBtn.style.display = 'inline-block';
  stopBtn.style.display = 'none';
  uploadRecordedBtn.style.display = 'inline-block';

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/mp4' });
    previewVideo.src = URL.createObjectURL(blob);
    previewVideo.controls = true;
  };
});

uploadRecordedBtn.addEventListener('click', () => {
  const blob = new Blob(recordedChunks, { type: 'video/mp4' });
  uploadVideoToServer(blob, 'recorded_video.mp4');
});

// File Upload
const uploadInput = document.getElementById('uploadInput');
const chooseFileBtn = document.getElementById('chooseFileBtn');
const uploadFileBtn = document.getElementById('uploadFileBtn');
let selectedFile = null;

chooseFileBtn.addEventListener('click', () => uploadInput.click());

uploadInput.addEventListener('change', () => {
  selectedFile = uploadInput.files[0];
  if (selectedFile) {
    uploadFileBtn.style.display = 'inline-block';
    chooseFileBtn.textContent = `Selected: ${selectedFile.name}`;
  }
});

uploadFileBtn.addEventListener('click', () => {
  if (selectedFile) uploadVideoToServer(selectedFile, selectedFile.name);
});

// Upload helper
const loadingOverlay = document.getElementById('loadingOverlay');

async function uploadVideoToServer(file, filename) {
  const formData = new FormData();
  formData.append('video', file, filename);

  try {
    loadingOverlay.style.display = 'flex';

    const response = await fetch('https://vocalift-backend-1.onrender.com/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      console.error("Upload failed response:", await response.text());
      loadingOverlay.style.display = 'none';
      return;
    }

    const result = await response.json();
    if (!result.feedback) {
      console.error('No feedback received from backend');
      loadingOverlay.style.display = 'none';
      return;
    }

    localStorage.setItem('feedback', JSON.stringify(result.feedback));
    window.location.href = 'analysis.html';
  } catch (err) {
    console.error('Upload error:', err);
    loadingOverlay.style.display = 'none';
  }
}
