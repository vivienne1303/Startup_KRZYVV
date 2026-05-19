const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const revealElements = document.querySelectorAll(".reveal");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatLog = document.querySelector("#chatLog");
const promptButtons = document.querySelectorAll(".prompt-btn");

const replies = [
  "Great. Start by choosing one problem, one audience, and one tiny test you can finish this week.",
  "Try this structure: hook, problem, solution, proof, impact, ask. Keep it under 60 seconds.",
  "For opportunities, filter by age, deadline, and topic. Beginner-friendly programmes are best for your first win.",
  "For debate practice, make one claim, explain why it matters, then compare your impact against the other side."
];

let replyIndex = 0;

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};

const closeMenu = () => {
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
};

const addBubble = (text, type = "ai") => {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${type}`;
  bubble.textContent = text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
};

const sendMessage = (text) => {
  if (!text.trim()) return;

  addBubble(text.trim(), "user");
  setTimeout(() => {
    addBubble(replies[replyIndex % replies.length], "ai");
    replyIndex += 1;
  }, 350);
};

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("nav-open", isOpen);
});

navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(chatInput.value);
  chatInput.value = "";
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sendMessage(button.textContent);
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
