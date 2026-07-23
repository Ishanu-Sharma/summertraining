/* THE QUAD — directory.js */
(async function () {
  const user = await bootProtectedPage();
  if (!user) return;

  const [allUsers, connections] = await Promise.all([DB.getUsers(), DB.getConnectionsFor(user.id)]);
  const alumni = allUsers.filter(u => u.role === "alumni" && u.privacy.showInDirectory);

  document.getElementById("directorySubtitle").textContent =
    alumni.length + " graduates and counting — find someone worth reconnecting with.";

  const grid = document.getElementById("alumniGrid");
  const resultCount = document.getElementById("resultCount");
  const paginationWrap = document.getElementById("paginationWrap");
  const form = document.getElementById("directoryFilters");
  const sortSelect = document.getElementById("sortSelect");
  const PAGE_SIZE = 6;
  let currentPage = 1;
  let filtered = alumni.slice();

  /* populate filter dropdowns from real data, so every option actually returns results */
  function populateSelect(select, values, placeholder) {
    select.innerHTML = '<option value="">' + placeholder + '</option>' +
      values.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
  }
  populateSelect(document.getElementById("fYear"), [...new Set(alumni.map(u => u.gradYear))].sort((a, b) => b - a), "Any year");
  populateSelect(document.getElementById("fDept"), [...new Set(alumni.map(u => u.department))].sort(), "Any department");
  populateSelect(document.getElementById("fIndustry"), [...new Set(alumni.map(u => u.industry).filter(Boolean))].sort(), "Any industry");
  populateSelect(document.getElementById("fLocation"), [...new Set(alumni.map(u => u.location.split(",")[0].split("·")[0].trim()))].sort(), "Anywhere");

  function applySort() {
    const mode = sortSelect.value;
    if (mode === "recent") filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (mode === "year") filtered.sort((a, b) => b.gradYear - a.gradYear);
    else filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  function applyFilters() {
    const name = document.getElementById("fName").value.trim().toLowerCase();
    const year = document.getElementById("fYear").value;
    const dept = document.getElementById("fDept").value;
    const industry = document.getElementById("fIndustry").value;
    const location = document.getElementById("fLocation").value;

    filtered = alumni.filter(u => {
      if (name && !u.fullName.toLowerCase().includes(name)) return false;
      if (year && String(u.gradYear) !== year) return false;
      if (dept && u.department !== dept) return false;
      if (industry && u.industry !== industry) return false;
      if (location && u.location.split(",")[0].split("·")[0].trim() !== location) return false;
      return true;
    });

    applySort();
    currentPage = 1;
    render();
  }

  function cardHtml(u) {
    const yearShort = "'" + String(u.gradYear).slice(-2);
    const connected = connections.includes(u.id);
    return `
      <div class="card alumni-card" data-user-id="${u.id}">
        <div class="class-ring"><div class="class-ring__gem">${yearShort}</div></div>
        <h4>${escapeHtml(u.fullName)}</h4>
        <div class="role">${escapeHtml(u.jobTitle || "")}${u.company ? ", " + escapeHtml(u.company) : ""}</div>
        <div class="loc"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(u.location)}</div>
        <div class="actions">
          <a href="profile.html?id=${u.id}" class="btn btn-secondary btn-sm">View Profile</a>
          ${connected
            ? `<a href="messages.html?with=${u.id}" class="btn btn-primary btn-sm">Message</a>`
            : `<button type="button" class="btn btn-primary btn-sm connect-btn">Connect</button>`}
        </div>
      </div>`;
  }

  function wireCardButtons() {
    grid.querySelectorAll(".connect-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const card = btn.closest("[data-user-id]");
        const id = card.dataset.userId;
        await DB.connectUsers(user.id, id);
        connections.push(id);
        btn.outerHTML = `<a href="messages.html?with=${id}" class="btn btn-primary btn-sm">Message</a>`;
        showToast("You're now connected!", "success");
      });
    });
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) { paginationWrap.innerHTML = ""; return; }
    let html = "";
    for (let p = 1; p <= totalPages; p++) {
      html += p === currentPage ? `<span class="current">${p}</span>` : `<a href="#" data-page="${p}">${p}</a>`;
    }
    if (currentPage < totalPages) html += `<a href="#" data-page="${currentPage + 1}"><i class="fa-solid fa-chevron-right"></i></a>`;
    paginationWrap.innerHTML = html;
    paginationWrap.querySelectorAll("a[data-page]").forEach(a => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = parseInt(a.dataset.page, 10);
        render();
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function render() {
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    resultCount.textContent = `Showing ${pageItems.length} of ${total} alumni`;

    grid.innerHTML = pageItems.length
      ? pageItems.map(cardHtml).join("")
      : '<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-magnifying-glass"></i><h4>No alumni match those filters</h4><p>Try widening your search.</p></div>';

    wireCardButtons();
    renderPagination(totalPages);
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); applyFilters(); });
  form.addEventListener("reset", () => { setTimeout(applyFilters, 0); });
  sortSelect.addEventListener("change", () => { applySort(); currentPage = 1; render(); });

  applyFilters();
})();