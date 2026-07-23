/* THE QUAD — event-details.js */
(async function () {
  const currentUser = await bootProtectedPage();
  if (!currentUser) return;

  const eventId = qsParam("id") || "e1";
  const [event, allUsers, myStatus] = await Promise.all([
    DB.getEvent(eventId), DB.getUsers(), DB.getRsvp(currentUser.id, eventId)
  ]);

  if (!event) {
    document.querySelector(".app-content").innerHTML =
      '<div class="empty-state"><i class="fa-solid fa-calendar-xmark"></i><h4>Event not found</h4><p>It may have been removed.</p></div>';
    return;
  }

  const usersById = buildUsersMap(allUsers);
  document.title = event.title + " — The Quad";

  document.getElementById("edCategoryTag").innerHTML = `<i class="fa-solid fa-calendar-day"></i> ${event.type === "online" ? "Online" : "In-person"}`;
  document.getElementById("edTitle").textContent = event.title;
  document.getElementById("edSummary").textContent = event.description;
  document.getElementById("edMetaDate").textContent = formatFullDate(event.date) + " · " + event.time;
  document.getElementById("edMetaLocation").textContent = event.location;
  document.getElementById("edAbout").textContent = event.description;

  function renderAttendeeMeta() {
    const count = (event.attendeeIds || []).length;
    document.getElementById("edMetaAttendees").textContent = count + " alumni going";
    document.getElementById("edGoingCount").textContent = count + " alumni going";
    const shown = (event.attendeeIds || []).slice(0, 4).map(id => usersById[id]).filter(Boolean);
    const remaining = Math.max(0, count - shown.length);
    document.getElementById("edAttendeeAvatars").innerHTML =
      shown.map(u => `<img src="${u.avatar}" alt="${escapeHtml(u.fullName)}">`).join("") +
      (remaining > 0 ? `<span class="more">${remaining}+</span>` : "");
  }
  renderAttendeeMeta();

  /* ---- Agenda ---- */
  document.getElementById("edAgenda").innerHTML = (event.agenda || []).map(a => `
    <div class="agenda-item">
      <div class="time">${escapeHtml(a.time)}</div>
      <div><h4 style="font-size:1rem;">${escapeHtml(a.title)}</h4>${a.note ? `<p class="text-faint" style="font-size:.85rem;">${escapeHtml(a.note)}</p>` : ""}</div>
    </div>`).join("") || '<p class="text-faint">Agenda hasn\'t been published yet.</p>';

  /* ---- Hosts ---- */
  document.getElementById("edHosts").innerHTML = (event.hosts || []).map(h => {
    const u = usersById[h.userId];
    if (!u) return "";
    return `<div class="widget-list-item" style="border:none; flex:1;">
      <img src="${u.avatar}" alt="">
      <div class="info"><div class="name">${escapeHtml(u.fullName)}</div><div class="sub">${escapeHtml(h.label)}</div></div>
    </div>`;
  }).join("") || '<p class="text-faint">No hosts listed.</p>';

  /* ---- Comments ---- */
  const commentsWrap = document.getElementById("edComments");
  function renderComments() {
    const list = event.comments || [];
    document.getElementById("edCommentCount").textContent = `· ${list.length} comment${list.length === 1 ? "" : "s"}`;
    commentsWrap.innerHTML = list.map(c => {
      const u = usersById[c.userId] || { fullName: "Someone", avatar: "https://i.pravatar.cc/80?img=1" };
      return `<div class="comment">
        <img src="${u.avatar}" alt="">
        <div class="comment__bubble"><div class="name">${escapeHtml(u.fullName)}</div>${escapeHtml(c.text)}</div>
      </div>`;
    }).join("") || '<p class="text-faint" style="margin-bottom:16px;">No comments yet — be the first.</p>';
  }
  renderComments();

  document.getElementById("edCommentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("edCommentInput");
    const text = input.value.trim();
    if (!text) return;
    const comment = await DB.addEventComment(event.id, currentUser.id, text);
    event.comments = event.comments || [];
    event.comments.push(comment);
    input.value = "";
    renderComments();
  });

  /* ---- RSVP ---- */
  const rsvpOptions = document.getElementById("edRsvpOptions");
  if (myStatus) {
    const radio = rsvpOptions.querySelector(`input[value="${myStatus}"]`);
    if (radio) radio.checked = true;
  }
  document.getElementById("edConfirmRsvpBtn").addEventListener("click", async () => {
    const checked = rsvpOptions.querySelector('input[name="rsvp"]:checked');
    if (!checked) { showToast("Choose an option first.", "error"); return; }
    await DB.setRsvp(currentUser.id, event.id, checked.value);
    const fresh = await DB.getEvent(event.id);
    event.attendeeIds = fresh.attendeeIds;
    renderAttendeeMeta();
    const msg = checked.value === "going" ? "You're going! See you there."
      : checked.value === "interested" ? "Marked as interested." : "No worries — maybe next time.";
    showToast(msg, "success");
  });

  document.getElementById("edCalendarBtn").addEventListener("click", () => {
    showToast("Calendar sync arrives with the Node.js backend phase.", "info");
  });
})();