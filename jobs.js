/* THE QUAD — jobs.js */
(async function () {
  const user = await bootProtectedPage();
  if (!user) return;

  const [jobs, allUsers, savedIds, appliedIds] = await Promise.all([
    DB.getJobs(), DB.getUsers(), DB.getSavedJobIds(user.id), DB.getAppliedJobIds(user.id)
  ]);
  const usersById = buildUsersMap(allUsers);
  const saved = new Set(savedIds);
  const applied = new Set(appliedIds);
  const approvedJobs = jobs.filter(j => j.status === "approved");

  const allList = document.getElementById("allJobsList");
  const savedList = document.getElementById("savedJobsList");
  const appliedList = document.getElementById("appliedJobsList");

  function emptyHtml(msg) {
    return `<div class="empty-state"><i class="fa-solid fa-briefcase"></i><h4>Nothing here</h4><p>${msg}</p></div>`;
  }

  function jobCardHtml(job, mode) {
    const referrer = usersById[job.postedBy];
    const isSaved = saved.has(job.id);
    const isApplied = applied.has(job.id);
    return `
      <div class="card job-card" data-job-id="${job.id}">
        <div class="job-card__logo">${initials(job.company)}</div>
        <div style="flex:1;">
          <div class="flex-between">
            <div>
              <h4>${escapeHtml(job.title)}</h4>
              <p class="text-soft" style="font-size:.9rem;">${escapeHtml(job.company)}</p>
            </div>
            ${mode === "applied"
              ? '<span class="status-pill approved">Applied</span>'
              : `<button type="button" class="icon-btn save-btn" aria-label="Save job"><i class="fa-${isSaved ? "solid" : "regular"} fa-bookmark"></i></button>`}
          </div>
          <div class="job-card__meta">
            <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(job.location)}</span>
            <span><i class="fa-solid fa-briefcase"></i> ${escapeHtml(job.type)}</span>
            <span><i class="fa-solid fa-clock"></i> Posted ${timeAgo(job.postedAt)}</span>
          </div>
          <div class="flex gap-sm">
            ${isApplied
              ? '<button type="button" class="btn btn-secondary btn-sm" disabled>Applied ✓</button>'
              : '<button type="button" class="btn btn-primary btn-sm apply-btn">Apply Now</button>'}
            <button type="button" class="btn btn-secondary btn-sm details-btn">View Details</button>
          </div>
          <p class="text-soft job-card__desc hidden" style="margin-top:14px; font-size:.88rem;">
            ${escapeHtml(job.description)}${job.referralNote ? " <strong>·</strong> " + escapeHtml(job.referralNote) : ""}
          </p>
          ${referrer ? `<div class="job-card__referrer"><img src="${referrer.avatar}" alt=""> Referred by ${escapeHtml(referrer.fullName)}, Class of ${referrer.gradYear}</div>` : ""}
        </div>
      </div>`;
  }

  function wireCards(container) {
    container.querySelectorAll(".save-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const jobId = btn.closest("[data-job-id]").dataset.jobId;
        const nowSaved = await DB.toggleSaveJob(user.id, jobId);
        if (nowSaved) saved.add(jobId); else saved.delete(jobId);
        showToast(nowSaved ? "Job saved!" : "Removed from saved jobs.", "success");
        renderAll();
      });
    });
    container.querySelectorAll(".apply-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const jobId = btn.closest("[data-job-id]").dataset.jobId;
        await DB.applyToJob(user.id, jobId);
        applied.add(jobId);
        showToast("Application sent! The referrer has been notified.", "success");
        renderAll();
      });
    });
    container.querySelectorAll(".details-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const card = btn.closest("[data-job-id]");
        const desc = card.querySelector(".job-card__desc");
        desc.classList.toggle("hidden");
        btn.textContent = desc.classList.contains("hidden") ? "View Details" : "Hide Details";
      });
    });
  }

  function getFilteredJobs() {
    const keyword = document.getElementById("jSearch").value.trim().toLowerCase();
    const location = document.getElementById("jLocation").value;
    const activeTypes = Array.from(document.querySelectorAll(".job-type-check:checked")).map(c => c.value);

    return approvedJobs.filter(j => {
      if (keyword && !(j.title.toLowerCase().includes(keyword) || j.company.toLowerCase().includes(keyword))) return false;
      if (location && j.location !== location) return false;
      if (activeTypes.length && !activeTypes.includes(j.type)) return false;
      return true;
    });
  }

  function renderAll() {
    const filtered = getFilteredJobs();
    allList.innerHTML = filtered.length ? filtered.map(j => jobCardHtml(j, "all")).join("") : emptyHtml("Try adjusting your filters.");
    wireCards(allList);

    const savedArr = jobs.filter(j => saved.has(j.id));
    savedList.innerHTML = savedArr.length ? savedArr.map(j => jobCardHtml(j, "saved")).join("")
      : '<div class="card" style="text-align:center; padding:60px 30px;"><i class="fa-regular fa-bookmark" style="font-size:2rem; color:var(--ink-faint); margin-bottom:16px;"></i><h4>No saved jobs yet</h4><p class="text-faint" style="margin-top:8px;">Tap the bookmark icon on any listing to save it here for later.</p></div>';
    wireCards(savedList);

    const appliedArr = jobs.filter(j => applied.has(j.id));
    appliedList.innerHTML = appliedArr.length ? appliedArr.map(j => jobCardHtml(j, "applied")).join("") : emptyHtml("You haven't applied to anything yet.");
    wireCards(appliedList);
  }

  document.getElementById("jobFilters").addEventListener("submit", (e) => { e.preventDefault(); renderAll(); });
  document.querySelectorAll(".job-type-check, #jLocation, #jReferredOnly").forEach(el => el.addEventListener("change", renderAll));

  renderAll();
})();