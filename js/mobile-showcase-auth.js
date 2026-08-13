(function () {
  if (!localStorage.getItem("teenlaunch_token")) return;

  document.querySelectorAll("[data-member-cta]").forEach((link) => {
    link.href = "pages/profile.html";
    link.innerHTML = 'My Profile <span aria-hidden="true">&rarr;</span>';
  });
})();
