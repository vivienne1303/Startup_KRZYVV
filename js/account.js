(function () {
  const API_BASE = window.TEENLAUNCH_API_BASE;
  const token = localStorage.getItem("teenlaunch_token");
  const form = document.querySelector("[data-account-form]");
  const message = document.querySelector("[data-account-message]");
  const nameTarget = document.querySelector("[data-account-name]");
  const emailTarget = document.querySelector("[data-account-email]");
  const roleTarget = document.querySelector("[data-account-role]");
  const initialsTarget = document.querySelector("[data-account-initials]");
  const previewTarget = document.querySelector("[data-profile-preview]");
  const pictureInput = form.elements.profile_picture;
  const params = new URLSearchParams(window.location.search);
  const isCareerDnaOnboarding = params.get("from") === "career-dna";
  let selectedPicture = null;

  const setMessage = (text, type) => {
    message.textContent = text || "";
    message.classList.toggle("error", type === "error");
    message.classList.toggle("success", type === "success");
  };

  const parseError = async (response) => {
    try {
      const data = await response.json();
      return data?.error?.message || data?.message || "Something went wrong. Please try again.";
    } catch (error) {
      return "Something went wrong. Please try again.";
    }
  };

  const authFetch = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    return response.json();
  };

  const getInitials = (name, email) => {
    const source = String(name || email || "TeenLaunch").trim();
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return source.slice(0, 2).toUpperCase();
  };

  const fillProfile = ({ user, profile }) => {
    const displayName = profile?.full_name || user?.email || "TeenLaunch user";

    nameTarget.textContent = displayName;
    emailTarget.textContent = user?.email || "";
    roleTarget.textContent = profile?.role ? `Role: ${profile.role}` : "";
    initialsTarget.textContent = getInitials(profile?.full_name, user?.email);

    form.elements.full_name.value = profile?.full_name || "";
    form.elements.username.value = profile?.username || "";
    form.elements.age.value = profile?.age || "";
    form.elements.education_level.value = profile?.education_level || "";
    form.elements.school_name.value = profile?.school_name || "";
    form.elements.country.value = profile?.country || "";
    form.elements.bio.value = profile?.bio || "";
    form.elements.phone_number.value = profile?.phone_number || "";
    form.elements.portfolio_url.value = profile?.portfolio_url || "";
    const picture = profile?.profile_picture_url || profile?.avatar_url;
    selectedPicture = picture || null;
    previewTarget.hidden = !picture;
    if (picture) previewTarget.src = picture;

    localStorage.setItem("teenlaunch_user", JSON.stringify(user || {}));
    localStorage.setItem("teenlaunch_profile", JSON.stringify(profile || {}));
  };

  const loadProfile = async () => {
    setMessage("Loading your profile...", "");

    try {
      const data = await authFetch("/auth/me");
      fillProfile(data);
      if (isCareerDnaOnboarding) {
        const fields = ["full_name", "username", "age", "education_level", "school_name", "country", "bio", "phone_number", "portfolio_url"];
        const missing = fields.filter((name) => !String(form.elements[name]?.value || "").trim());
        missing.forEach((name) => form.elements[name]?.closest("label")?.classList.add("profile-field-missing"));
        setMessage(missing.length
          ? "Career DNA complete! Please fill in the highlighted profile details so we can personalise your opportunities."
          : "Career DNA complete! Your profile is already up to date. Save to view your results.", "success");
        form.elements[missing[0]]?.focus({ preventScroll: true });
      } else {
        setMessage("", "");
      }
    } catch (error) {
      setMessage(error.message, "error");
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const age = Number(formData.get("age"));

    if (!Number.isInteger(age) || age < 10 || age > 19) {
      setMessage("Age must be a whole number between 10 and 19.", "error");
      return;
    }

    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    setMessage("Saving your profile...", "");

    try {
      const data = await authFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({
          full_name: String(formData.get("full_name") || "").trim(),
          username: String(formData.get("username") || "").trim(),
          age,
          education_level: formData.get("education_level"),
          school_name: String(formData.get("school_name") || "").trim() || null,
          country: String(formData.get("country") || "").trim() || null,
          bio: String(formData.get("bio") || "").trim() || null,
          phone_number: String(formData.get("phone_number") || "").trim() || null,
          portfolio_url: String(formData.get("portfolio_url") || "").trim() || null,
          profile_picture_url: selectedPicture,
        }),
      });

      const currentUser = JSON.parse(localStorage.getItem("teenlaunch_user") || "{}");
      fillProfile({ user: currentUser, profile: data.profile });
      setMessage("Profile saved successfully.", "success");
      form.querySelectorAll(".profile-field-missing").forEach((field) => field.classList.remove("profile-field-missing"));
      if (isCareerDnaOnboarding) {
        window.setTimeout(() => window.location.replace("career_dna_result.html"), 700);
      }
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  pictureInput.addEventListener("change", () => {
    const file = pictureInput.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 1024 * 1024) {
      pictureInput.value = "";
      setMessage("Choose a JPG, PNG or WebP image no larger than 1 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      selectedPicture = String(reader.result || "");
      previewTarget.src = selectedPicture;
      previewTarget.hidden = false;
      setMessage("Picture ready. Save changes to update your profile.", "success");
    });
    reader.readAsDataURL(file);
  });

  loadProfile();
})();
