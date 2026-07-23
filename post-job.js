/* THE QUAD — post-job.js */
(async function () {
  const user = await bootProtectedPage();
  if (!user) return;

  const form = document.getElementById("postJobForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    Validate.clearAllErrors(form);

    const title = document.getElementById("pjTitle");
    const company = document.getElementById("pjCompany");
    const location = document.getElementById("pjLocation");
    const type = document.getElementById("pjType");
    const description = document.getElementById("pjDescription");
    const link = document.getElementById("pjLink");

    let valid = true;
    if (!Validate.isRequired(title.value)) { Validate.showError(title, "Enter a job title."); valid = false; }
    if (!Validate.isRequired(company.value)) { Validate.showError(company, "Enter a company name."); valid = false; }
    if (!Validate.isRequired(location.value)) { Validate.showError(location, "Enter a location."); valid = false; }
    if (!type.value) { Validate.showError(type, "Select a job type."); valid = false; }
    if (!Validate.minLength(description.value, 20)) { Validate.showError(description, "Add a bit more detail (20+ characters)."); valid = false; }
    if (!Validate.isRequired(link.value)) { Validate.showError(link, "Add an application link or email."); valid = false; }
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.classList.add("is-loading");
    btn.textContent = "Posting...";

    const settings = await DB.getSettings();

    await DB.createJob({
      title: title.value.trim(),
      company: company.value.trim(),
      location: location.value.trim(),
      type: type.value,
      experience: document.getElementById("pjExperience").value,
      salary: document.getElementById("pjSalary").value.trim(),
      description: description.value.trim(),
      applyLink: link.value.trim(),
      referralNote: document.getElementById("pjNote").value.trim(),
      postedBy: user.id,
      status: settings.autoApproveJobs ? "approved" : "pending"
    });

    btn.classList.remove("is-loading");
    btn.textContent = original;
    showToast(settings.autoApproveJobs ? "Job posted!" : "Job submitted for review by the Alumni Office.", "success");
    setTimeout(() => { window.location.href = "jobs.html"; }, 700);
  });
})();