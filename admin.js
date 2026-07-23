/* THE QUAD — admin.js */
(async function () {
  const user = await Auth.requireAdmin();
  if (!user) return;
  await wireAppShell(user);

  const [users, events, jobs] = await Promise.all([DB.getUsers(), DB.getEvents(), DB.getJobs()]);
  const alumni = users.filter(u => u.role === "alumni");
  const usersById = buildUsersMap(users);

  function refreshStats() {
    document.getElementById("statTotalAlumni").textContent = alumni.length.toLocaleString();
    document.getElementById("statPendingVerifications").textContent = alumni.filter(u => !u.verified).length;
    const now = new Date();
    document.getElementById("statActiveEvents").textContent = events.filter(e => new Date(e.date + "T23:59:59") >= now).length;
    document.getElementById("statJobPostings").textContent = jobs.length;
  }

  /* ---- Overview: Recent Signups ---- */
  function renderRecentSignups() {
    const recent = alumni.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
    document.getElementById("recentSignupsBody").innerHTML = recent.map(u => `
      <tr>
        <td class="cell-user"><img src="${u.avatar}" alt=""> ${escapeHtml(u.fullName)}</td>
        <td>${u.gradYear || "—"}</td><td>${escapeHtml(u.department || "—")}</td>
        <td>${new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
        <td><span class="status-pill ${u.verified ? "approved" : "pending"}">${u.verified ? "Verified" : "Pending"}</span></td>
      </tr>`).join("") || '<tr><td colspan="5"><p class="text-faint" style="padding:20px 0;">No alumni yet.</p></td></tr>';
  }

  /* ---- Manage Alumni ---- */
  const alumniBody = document.getElementById("alumniTableBody");
  function renderAlumniTable() {
    const search = document.getElementById("alumniSearchInput").value.trim().toLowerCase();
    const status = document.getElementById("alumniStatusFilter").value;
    const list = alumni.filter(u => {
      if (search && !(u.fullName.toLowerCase().includes(search) || u.email.toLowerCase().includes(search))) return false;
      if (status === "verified" && !u.verified) return false;
      if (status === "pending" && u.verified) return false;
      return true;
    });

    alumniBody.innerHTML = list.map(u => `
      <tr data-user-id="${u.id}">
        <td class="cell-user"><img src="${u.avatar}" alt=""> ${escapeHtml(u.fullName)}</td>
        <td>${u.gradYear || "—"}</td><td>${escapeHtml(u.email)}</td>
        <td><span class="status-pill ${u.verified ? "approved" : "pending"}">${u.verified ? "Verified" : "Pending"}</span></td>
        <td class="table-actions">
          ${!u.verified ? '<button type="button" class="approve-user-btn" title="Approve"><i class="fa-solid fa-check"></i></button>' : ""}
          <button type="button" class="view-user-btn" title="View"><i class="fa-solid fa-eye"></i></button>
        </td>
      </tr>`).join("") || '<tr><td colspan="5"><p class="text-faint" style="padding:20px 0;">No alumni match your search.</p></td></tr>';

    alumniBody.querySelectorAll(".approve-user-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.closest("[data-user-id]").dataset.userId;
        const updated = await DB.updateUser(id, { verified: true });
        const idx = alumni.findIndex(a => a.id === id);
        if (idx > -1) alumni[idx] = updated;
        showToast("Alumni verified!", "success");
        refreshStats();
        renderRecentSignups();
        renderAlumniTable();
      });
    });
    alumniBody.querySelectorAll(".view-user-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.closest("[data-user-id]").dataset.userId;
        window.location.href = "profile.html?id=" + id;
      });
    });
  }
  document.getElementById("alumniSearchInput").addEventListener("input", renderAlumniTable);
  document.getElementById("alumniStatusFilter").addEventListener("change", renderAlumniTable);

  /* ---- Manage Events ---- */
  function renderEventsTable() {
    const body = document.getElementById("eventsTableBody");
    body.innerHTML = events.map(e => `
      <tr data-event-id="${e.id}">
        <td>${escapeHtml(e.title)}</td>
        <td>${formatFullDate(e.date)}</td>
        <td>${(e.attendeeIds || []).length}</td>
        <td><span class="status-pill approved">Published</span></td>
        <td class="table-actions">
          <button type="button" class="view-event-btn" title="View"><i class="fa-solid fa-eye"></i></button>
          <button type="button" class="delete-event-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`).join("") || '<tr><td colspan="5"><p class="text-faint" style="padding:20px 0;">No events yet.</p></td></tr>';

    body.querySelectorAll(".view-event-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.closest("[data-event-id]").dataset.eventId;
        window.location.href = "event-details.html?id=" + id;
      });
    });
    body.querySelectorAll(".delete-event-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const row = btn.closest("[data-event-id]");
        const id = row.dataset.eventId;
        if (!window.confirm("Delete this event? This can't be undone.")) return;
        await DB.deleteEvent(id);
        const idx = events.findIndex(e => e.id === id);
        if (idx > -1) events.splice(idx, 1);
        showToast("Event deleted.", "success");
        refreshStats();
        renderEventsTable();
      });
    });
  }

  /* ---- Manage Jobs ---- */
  function renderJobsTable() {
    const body = document.getElementById("jobsTableBody");
    body.innerHTML = jobs.map(j => {
      const poster = usersById[j.postedBy];
      const statusLabel = j.status === "approved" ? "Approved" : "Pending Review";
      return `<tr data-job-id="${j.id}">
        <td>${escapeHtml(j.title)}</td>
        <td>${escapeHtml(j.company)}</td>
        <td>${poster ? escapeHtml(poster.fullName) : "—"}</td>
        <td><span class="status-pill ${j.status === "approved" ? "approved" : "pending"}">${statusLabel}</span></td>
        <td class="table-actions">
          ${j.status !== "approved" ? '<button type="button" class="approve-job-btn" title="Approve"><i class="fa-solid fa-check"></i></button>' : ""}
          <button type="button" class="remove-job-btn" title="Remove"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`;
    }).join("") || '<tr><td colspan="5"><p class="text-faint" style="padding:20px 0;">No jobs yet.</p></td></tr>';

    body.querySelectorAll(".approve-job-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.closest("[data-job-id]").dataset.jobId;
        const updated = await DB.updateJobStatus(id, "approved");
        const idx = jobs.findIndex(j => j.id === id);
        if (idx > -1) jobs[idx] = updated;
        showToast("Job approved and now live on the board!", "success");
        refreshStats();
        renderJobsTable();
      });
    });
    body.querySelectorAll(".remove-job-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const row = btn.closest("[data-job-id]");
        const id = row.dataset.jobId;
        if (!window.confirm("Remove this job posting?")) return;
        await DB.deleteJob(id);
        const idx = jobs.findIndex(j => j.id === id);
        if (idx > -1) jobs.splice(idx, 1);
        showToast("Job removed.", "success");
        refreshStats();
        renderJobsTable();
      });
    });
  }

  /* ---- Settings ---- */
  async function loadSettings() {
    const settings = await DB.getSettings();
    document.getElementById("sSiteName").value = settings.platformName;
    document.getElementById("sSupportEmail").value = settings.supportEmail;
    document.getElementById("sRequireUnivEmail").checked = !!settings.requireUniversityEmail;
    document.getElementById("sAutoApproveJobs").checked = !!settings.autoApproveJobs;
    document.getElementById("sAllowStudentDirectory").checked = !!settings.allowStudentDirectoryView;
  }
  await loadSettings();

  document.getElementById("saveSettingsBtn").addEventListener("click", async () => {
    await DB.updateSettings({
      platformName: document.getElementById("sSiteName").value.trim() || "The Quad",
      supportEmail: document.getElementById("sSupportEmail").value.trim(),
      requireUniversityEmail: document.getElementById("sRequireUnivEmail").checked,
      autoApproveJobs: document.getElementById("sAutoApproveJobs").checked,
      allowStudentDirectoryView: document.getElementById("sAllowStudentDirectory").checked
    });
    showToast("Settings saved!", "success");
  });

  /* ---- Initial render ---- */
  refreshStats();
  renderRecentSignups();
  renderAlumniTable();
  renderEventsTable();
  renderJobsTable();
})();