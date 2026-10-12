(function () {
  const updateDetailLinks = () => {
    document.querySelectorAll('.application-card a[href^="apply.html?id="]').forEach((link) => {
      const url = new URL(link.href, window.location.href);
      const opportunityId = url.searchParams.get("id");
      if (opportunityId) link.href = `opportunity-details.html?id=${encodeURIComponent(opportunityId)}`;
    });
  };

  const profileContent = document.querySelector("[data-profile-content]");
  if (profileContent) new MutationObserver(updateDetailLinks).observe(profileContent, { childList: true, subtree: true });
  updateDetailLinks();
})();
