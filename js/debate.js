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
const quizOptions = document.querySelectorAll(".quiz-option");
const quizResult = document.querySelector("#quizResult");

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
  modeLabel.textContent = `${roundSelect.value} practice is running.`;
  timerId = setInterval(() => {
    remainingSeconds -= 1;
    renderTimer();

    if (remainingSeconds <= 0) {
      clearInterval(timerId);
      timerId = null;
      remainingSeconds = 0;
      modeLabel.textContent = "Time. Reset for another round.";
      renderTimer();
    }
  }, 1000);
});

pauseTimer.addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;
  modeLabel.textContent = "Paused. Breathe, then continue.";
});

resetTimer.addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;
  resetTimeFromInput();
  modeLabel.textContent = "Practice mode ready.";
});

minutesInput.addEventListener("change", resetTimeFromInput);
roundSelect.addEventListener("change", () => {
  modeLabel.textContent = `${roundSelect.value} selected.`;
});

newMotion.addEventListener("click", () => {
  const currentMotion = motionText.textContent;
  const options = motions.filter((motion) => motion !== currentMotion);
  motionText.textContent = options[Math.floor(Math.random() * options.length)];
});

quizOptions.forEach((option, index) => {
  option.addEventListener("click", () => {
    quizOptions.forEach((item) => item.classList.remove("correct", "wrong"));
    option.classList.add(index === 0 ? "correct" : "wrong");
    quizResult.textContent = index === 0 ? "Correct. Strong arguments need structure and impact." : "Try again. Judges need reasoning, proof, and impact.";
  });
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
