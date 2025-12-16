document.addEventListener("DOMContentLoaded", () => {
  const feedback = JSON.parse(localStorage.getItem("feedback") || "{}");

  if (!feedback || Object.keys(feedback).length === 0) {
    document.getElementById("score-message").textContent = "No feedback available.";
    return;
  }

  // Set session details
  const today = new Date();
  document.getElementById("session-date").textContent = today.toISOString().split('T')[0];
  document.getElementById("overall-score").textContent = feedback.overallScore || "--";
  document.getElementById("overall-score-big").textContent = feedback.overallScore || "--";
  document.getElementById("score-message").textContent = "Your AI-generated feedback";

  // Metrics
  document.getElementById("clarity-score").textContent = feedback.clarity || "--";
  document.getElementById("confidence-score").textContent = feedback.confidence || "--";
  document.getElementById("body-score").textContent = feedback.bodyPosture || "--";
  document.getElementById("pace-score").textContent = feedback.pace || "--";

  // Detailed Analysis
  const fillerCount = feedback.fillerWords || 0;
  document.getElementById("filler-count").textContent = fillerCount;
  document.getElementById("filler-details").textContent =
    fillerCount > 0 ? `${fillerCount} filler words detected` : "No filler words detected.";

  document.getElementById("eye-contact-score").textContent =
    typeof feedback.eyeContact === "number" ? `${feedback.eyeContact}%` : "--";

  document.getElementById("posture-detail").textContent =
    feedback.postureDetails || "No posture feedback.";

  document.getElementById("pace-value").textContent = feedback.wpm || "--";

  // Key Insights
  const insightsList = document.getElementById("insights-list");
  insightsList.innerHTML = "";
  if (Array.isArray(feedback.suggestions) && feedback.suggestions.length > 0) {
    feedback.suggestions.forEach(s => {
      const li = document.createElement("li");
      li.textContent = s;
      insightsList.appendChild(li);
    });
  } else {
    insightsList.innerHTML = "<li>No major issues detected.</li>";
  }

  // Transcript
  const transcriptText = document.getElementById("transcript-text");
  transcriptText.textContent = feedback.transcript?.slice(0, 200) || "No transcript available.";

  // Record again button
  const recordAgainBtn = document.getElementById("record-again-btn");
  if (recordAgainBtn) {
    recordAgainBtn.addEventListener("click", () => {
      window.location.href = "record.html";
    });
  }
});
