const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const revealElements = document.querySelectorAll(".reveal");
const timerDisplay = document.querySelector("#timerDisplay");
const minutesInput = document.querySelector("#minutesInput");
const roundSelect = document.querySelector("#roundSelect");
const startTimer = document.querySelector("#startTimer");
const pauseTimer = document.querySelector("#pauseTimer");
const resetTimer = document.querySelector("#resetTimer");
const modeLabel = document.querySelector("#modeLabel");
const motionText = document.querySelector("#motionText");
const newMotion = document.querySelector("#newMotion");
const practiceStopwatch = document.querySelector("#practiceStopwatch");
const recorderStatus = document.querySelector("#recorderStatus");
const startRecording = document.querySelector("#startRecording");
const saveRecording = document.querySelector("#saveRecording");
const resetRecording = document.querySelector("#resetRecording");
const todayPractice = document.querySelector("#todayPractice");
const recordedSessions = document.querySelector("#recordedSessions");
const t = (key) => window.TeenLaunchI18n?.translate(key) || key;

const motions = [
  "This house believes schools should teach entrepreneurship.",
  "This house would ban homework for students under 14.",
  "This house believes AI should be allowed in classrooms.",
  "This house would make public speaking a core school subject.",
  "This house believes teenagers should vote in local elections.",
  "This house would prioritize climate innovation over fast fashion."
];

let remainingSeconds = Number(minutesInput.value) * 60;
let timerId = null;
let recordedSeconds = 0;
let recorderId = null;
const practiceStorageKey = "teenlaunch_debate_practice_sessions";
const todayKey = () => new Date().toLocaleDateString("en-CA");
const readPracticeSessions = () => {
  try { return JSON.parse(localStorage.getItem(practiceStorageKey) || "[]").filter((item) => item && Number(item.seconds) > 0); }
  catch (_) { return []; }
};
const formatRecordedTime = (seconds) => {
  const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${remainder}`;
};
const renderPracticeRecorder = () => {
  practiceStopwatch.textContent = formatRecordedTime(recordedSeconds);
  const sessions = readPracticeSessions();
  const todaySessions = sessions.filter((item) => item.date === todayKey());
  const todaySeconds = todaySessions.reduce((total, item) => total + Number(item.seconds), 0);
  todayPractice.textContent = todaySeconds < 60 ? `${todaySeconds} sec` : `${Math.round(todaySeconds / 60)} min`;
  recordedSessions.textContent = String(sessions.length);
};

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};

const closeMenu = () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
};

const renderTimer = () => {
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
};

const resetTimeFromInput = () => {
  remainingSeconds = Number(minutesInput.value) * 60;
  renderTimer();
};

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("nav-open", isOpen);
});

navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

startTimer.addEventListener("click", () => {
  if (timerId) return;
  const round = roundSelect.selectedOptions[0]?.dataset.i18n || roundSelect.value;
  modeLabel.textContent = window.TeenLaunchI18n?.getLanguage() === "zh"
    ? `${t(round)}练习进行中。`
    : `${round} practice is running.`;
  timerId = setInterval(() => {
    remainingSeconds -= 1;
    renderTimer();

    if (remainingSeconds <= 0) {
      clearInterval(timerId);
      timerId = null;
      remainingSeconds = 0;
      modeLabel.textContent = t("Time. Reset for another round.");
      renderTimer();
    }
  }, 1000);
});

pauseTimer.addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;
  modeLabel.textContent = t("Paused. Breathe, then continue.");
});

resetTimer.addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;
  resetTimeFromInput();
  modeLabel.textContent = t("Practice mode ready.");
});

startRecording.addEventListener("click", () => {
  if (recorderId) return;
  recorderStatus.textContent = t(recordedSeconds ? "Recording resumed." : "Recording practice time.");
  startRecording.disabled = true;
  recorderId = window.setInterval(() => { recordedSeconds += 1; renderPracticeRecorder(); }, 1000);
});

saveRecording.addEventListener("click", () => {
  if (recorderId) window.clearInterval(recorderId);
  recorderId = null;
  startRecording.disabled = false;
  if (!recordedSeconds) { recorderStatus.textContent = t("Start the recorder before saving."); return; }
  const sessions = readPracticeSessions();
  sessions.push({ date: todayKey(), seconds: recordedSeconds, savedAt: new Date().toISOString() });
  localStorage.setItem(practiceStorageKey, JSON.stringify(sessions));
  recorderStatus.textContent = t("Practice session saved.");
  recordedSeconds = 0;
  renderPracticeRecorder();
});

resetRecording.addEventListener("click", () => {
  if (recorderId) window.clearInterval(recorderId);
  recorderId = null;
  recordedSeconds = 0;
  startRecording.disabled = false;
  recorderStatus.textContent = t("Ready to record.");
  renderPracticeRecorder();
});

minutesInput.addEventListener("change", resetTimeFromInput);
roundSelect.addEventListener("change", () => {
  const round = roundSelect.selectedOptions[0]?.dataset.i18n || roundSelect.value;
  modeLabel.textContent = window.TeenLaunchI18n?.getLanguage() === "zh"
    ? `已选择${t(round)}。`
    : `${round} selected.`;
});

newMotion.addEventListener("click", () => {
  const currentMotion = motionText.textContent;
  const options = motions.filter((motion) => motion !== currentMotion);
  motionText.dataset.i18n = options[Math.floor(Math.random() * options.length)];
  motionText.textContent = t(motionText.dataset.i18n);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealElements.forEach((element) => revealObserver.observe(element));
window.addEventListener("scroll", updateHeader);
updateHeader();
renderTimer();
renderPracticeRecorder();
