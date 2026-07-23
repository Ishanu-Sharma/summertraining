/* THE QUAD — dashboard.js */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

(async function () {
  const user = await bootProtectedPage();
  if (!user) return;

  document.getElementById("welcomeUserName").textContent = user.fullName.split(" ")[0];

  if (!user.verified) {
    document.getElementById("welcomeBanner").insertAdjacentHTML("beforebegin",
      '<div class="notice-banner"><i class="fa-solid fa-hourglass-half"></i><div>Your profile is pending verification by the Alumni Office. You can still use The Quad while you wait.</div></div>');
  }

  DB.getUnreadCount(user.id).then(n => { document.getElementById("statUnread").textContent = n; });

  const [users, events, jobs, connections] = await Promise.all([
    DB.getUsers(), DB.getEvents(), DB.getJobs(), DB.getConnectionsFor(user.id)
  ]);
  const usersById = buildUsersMap(users);

  /* ---- FEED ---- */
  const feedList = document.getElementById("feedList");
  async function loadFeed() {
    const posts = await DB.getPosts();
    feedList.innerHTML = "";
    posts.forEach(p => feedList.appendChild(renderFeedCard(p, usersById, user)));
  }
  await loadFeed();

  document.getElementById("dashComposerBtn").addEventListener("click", async () => {
    const textarea = document.getElementById("dashComposerText");
    const text = textarea.value.trim();
    if (!text) { showToast("Write something before posting.", "error"); return; }
    await DB.createPost(user.id, text);
    textarea.value = "";
    showToast("Posted to your network!", "success");
    await loadFeed();
  });

  /* ---- UPCOMING EVENTS WIDGET ---- */
  const now = new Date();
  const upcoming = events
    .filter(e => new Date(e.date + "T23:59:59") >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);
  const upcomingWrap = document.getElementById("widgetUpcomingEvents");
  upcomingWrap.innerHTML = upcoming.map(e => {
    const d = formatEventDate(e.date);
    return `<a href="event-details.html?id=${e.id}" class="widget-list-item" style="text-decoration:none;">
      <div class="class-ring class-ring--sm"><div class="class-ring__gem">${d.day}</div></div>
      <div class="info"><div class="name">${escapeHtml(e.title)}</div><div class="sub">${d.mon} ${d.day} · ${escapeHtml(e.location)}</div></div>
    </a>`;
  }).join("") || '<p class="text-faint" style="font-size:.85rem;">No upcoming events right now.</p>';

  /* ---- PEOPLE YOU MAY KNOW WIDGET ---- */
  const notConnected = users.filter(u => u.role === "alumni" && u.id !== user.id && !connections.includes(u.id));
  const suggestions = shuffleArray(notConnected).slice(0, 3);
  const peopleWrap = document.getElementById("widgetPeopleYouMayKnow");
  peopleWrap.innerHTML = suggestions.map(u => `
    <div class="widget-list-item" data-suggest-id="${u.id}">
      <img src="${u.avatar}" alt="">
      <div class="info"><div class="name">${escapeHtml(u.fullName)}</div><div class="sub">Class of ${u.gradYear} · ${escapeHtml(u.department || "")}</div></div>
      <button type="button" class="btn btn-secondary btn-sm connect-btn">Connect</button>
    </div>`).join("") || '<p class="text-faint" style="font-size:.85rem;">You\'re connected with everyone so far!</p>';

  peopleWrap.querySelectorAll(".connect-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const row = btn.closest("[data-suggest-id]");
      await DB.connectUsers(user.id, row.dataset.suggestId);
      btn.textContent = "Connected ✓";
      btn.disabled = true;
      showToast("You're now connected!", "success");
    });
  });

  /* ---- TRENDING JOBS WIDGET ---- */
  const approvedJobs = jobs.filter(j => j.status === "approved")
    .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt)).slice(0, 3);
  const jobsWrap = document.getElementById("widgetTrendingJobs");
  jobsWrap.innerHTML = approvedJobs.map(j => `
    <a href="jobs.html" class="widget-list-item" style="text-decoration:none;">
      <div class="job-card__logo" style="width:40px; height:40px; font-size:.9rem;">${initials(j.company)}</div>
      <div class="info"><div class="name">${escapeHtml(j.title)}</div><div class="sub">${escapeHtml(j.company)} · ${escapeHtml(j.location)}</div></div>
    </a>`).join("") || '<p class="text-faint" style="font-size:.85rem;">No job postings yet.</p>';
})();