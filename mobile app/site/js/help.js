(function () {
  const button = document.querySelector("[data-copy-support-email]");
  const status = document.querySelector("[data-support-copy-status]");
  if (!button || !status) return;

  const email = "vivienne@teenlaunch.app";
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      button.textContent = "Email copied";
      status.textContent = `${email} is ready to paste into your email app.`;
    } catch (_) {
      status.textContent = `Copy this address: ${email}`;
    }
  });
})();
