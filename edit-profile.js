/* THE QUAD — edit-profile.js */
(async function () {
  const user = await bootProtectedPage();
  if (!user) return;

  function setSelectValue(id, value) {
    const el = document.getElementById(id);
    if (!el || value == null) return;
    const found = Array.from(el.options).some(o => o.value === String(value));
    if (found) el.value = String(value);
  }

  /* ---- Pre-fill form from real user data ---- */
  document.getElementById("editPhotoPreview").src = user.avatar;
  document.getElementById("editName").value = user.fullName || "";
  document.getElementById("editHeadline").value = user.headline || (user.jobTitle ? `${user.jobTitle}${user.company ? " at " + user.company : ""}` : "");
  document.getElementById("editLocation").value = user.location || "";
  document.getElementById("editBio").value = user.bio || "";
  setSelectValue("editYear", user.gradYear);
  setSelectValue("editDept", user.department);
  document.getElementById("editCompany").value = user.company || "";
  document.getElementById("editTitle").value = user.jobTitle || "";
  setSelectValue("editIndustry", user.industry);
  document.getElementById("editLinkedin").value = user.linkedin || "";
  document.getElementById("editWebsite").value = user.website || "";
  document.getElementById("privShowEmail").checked = !!user.privacy.showEmail;
  document.getElementById("privShowInDirectory").checked = !!user.privacy.showInDirectory;
  document.getElementById("privAllowStudentMessages").checked = !!user.privacy.allowStudentMessages;
  document.getElementById("notifMessages").checked = !!user.notifications.messages;
  document.getElementById("notifEvents").checked = !!user.notifications.events;
  document.getElementById("notifJobs").checked = !!user.notifications.jobs;

  /* ---- Photo upload (stored as a data URL — fine at this scale, a real upload/CDN step comes later) ---- */
  let pendingAvatar = null;
  document.getElementById("editPhotoInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 900 * 1024) {
      showToast("Please choose an image under 900KB.", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      pendingAvatar = reader.result;
      document.getElementById("editPhotoPreview").src = pendingAvatar;
    };
    reader.readAsDataURL(file);
  });
  document.getElementById("editPhotoRemoveBtn").addEventListener("click", () => {
    pendingAvatar = "https://i.pravatar.cc/200?img=" + (10 + Math.floor(Math.random() * 60));
    document.getElementById("editPhotoPreview").src = pendingAvatar;
  });

  /* ---- Save ---- */
  const form = document.getElementById("editProfileForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    Validate.clearAllErrors(form);

    const name = document.getElementById("editName");
    const bio = document.getElementById("editBio");
    let valid = true;
    if (!Validate.isRequired(name.value)) { Validate.showError(name, "Your name can't be empty."); valid = false; }
    if (!Validate.minLength(bio.value, 0) || bio.value.length > 500) { Validate.showError(bio, "Keep your bio under 500 characters."); valid = false; }
    if (!valid) return;

    const patch = {
      fullName: name.value.trim(),
      headline: document.getElementById("editHeadline").value.trim(),
      location: document.getElementById("editLocation").value.trim(),
      bio: bio.value.trim(),
      gradYear: parseInt(document.getElementById("editYear").value, 10),
      department: document.getElementById("editDept").value,
      company: document.getElementById("editCompany").value.trim(),
      jobTitle: document.getElementById("editTitle").value.trim(),
      industry: document.getElementById("editIndustry").value,
      linkedin: document.getElementById("editLinkedin").value.trim(),
      website: document.getElementById("editWebsite").value.trim(),
      privacy: {
        showEmail: document.getElementById("privShowEmail").checked,
        showInDirectory: document.getElementById("privShowInDirectory").checked,
        allowStudentMessages: document.getElementById("privAllowStudentMessages").checked
      },
      notifications: {
        messages: document.getElementById("notifMessages").checked,
        events: document.getElementById("notifEvents").checked,
        jobs: document.getElementById("notifJobs").checked
      }
    };
    if (pendingAvatar) patch.avatar = pendingAvatar;

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.classList.add("is-loading");
    btn.textContent = "Saving...";

    await DB.updateUser(user.id, patch);

    btn.classList.remove("is-loading");
    btn.textContent = original;
    showToast("Profile updated!", "success");
    setTimeout(() => { window.location.href = "profile.html"; }, 700);
  });

  /* ---- Deactivate (demo only — flips a flag rather than deleting data) ---- */
  document.getElementById("deactivateBtn").addEventListener("click", async () => {
    const sure = window.confirm("Deactivate your profile? You can reactivate anytime by logging back in.");
    if (!sure) return;
    await DB.updateUser(user.id, { privacy: { ...user.privacy, showInDirectory: false }, deactivated: true });
    showToast("Your profile has been deactivated.", "info");
    Auth.logout();
  });
})();