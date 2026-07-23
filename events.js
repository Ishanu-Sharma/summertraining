/* THE QUAD — events.js */
(async function () {
  const user = await bootProtectedPage();
  if (!user) return;

  const [events, myRsvps] = await Promise.all([DB.getEvents(), DB.getRsvpsForUser(user.id)]);
  const rsvpByEvent = {};
  myRsvps.forEach(r => { rsvpByEvent[r.eventId] = r.status; });

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date + "T23:59:59") >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = events.filter(e => new Date(e.date + "T23:59:59") < now).sort((a, b) => new Date(b.date) - new Date(a.date));
  const mine = events.filter(e => rsvpByEvent[e.id] && rsvpByEvent[e.id] !== "not-going");

  /* ---- Featured banner ---- */
  const featured = events.find(e => e.featured) || upcoming[0];
  if (featured) {
    document.getElementById("featTitle").textContent = featured.title;
    document.getElementById("featCohortLine").textContent = `${featured.cohort || "All batches"} · ${featured.location}`;
    document.getElementById("featDateTag").innerHTML = `<i class="fa-solid fa-calendar-day"></i> ${formatFullDate(featured.date)} · ${escapeHtml(featured.time)}`;
    document.getElementById("featDescription").textContent = featured.description;
    document.getElementById("featDetailsLink").href = "event-details.html?id=" + featured.id;

    const avatarsWrap = document.getElementById("featAvatars");
    const shown = (featured.attendeeIds || []).slice(0, 3);
    const remaining = Math.max(0, (featured.attendeeIds || []).length - shown.length);
    DB.getUsers().then(users => {
      const map = buildUsersMap(users);
      avatarsWrap.innerHTML = shown.map(id => map[id] ? `<img src="${map[id].avatar}" alt="">` : "").join("")
        + (remaining > 0 ? `<span class="more">${remaining}+</span>` : "");
    });
  }

  /* ---- Grids ---- */
  function eventCardHtml(e, mode) {
    const d = formatEventDate(e.date);
    if (mode === "past") {
      return `<div class="card event-card" style="opacity:.85;">
        <div class="event-card__banner" style="background:linear-gradient(135deg, var(--ink-faint), var(--ink-soft));"><div class="event-card__date"><div class="mon">${d.mon}</div><div class="day">${d.day}</div></div></div>
        <div class="event-card__body">
          <span class="tag tag-outline" style="margin-bottom:10px;">Ended</span>
          <h4>${escapeHtml(e.title)}</h4>
          <p class="text-faint" style="font-size:.85rem; margin:8px 0 16px;">${(e.attendeeIds || []).length} alumni attended</p>
          <button type="button" class="btn btn-secondary btn-block btn-sm" data-recap>View Recap</button>
        </div>
      </div>`;
    }
    if (mode === "mine") {
      const status = rsvpByEvent[e.id];
      const label = status === "going" ? '<i class="fa-solid fa-check"></i> Going' : '<i class="fa-solid fa-star"></i> Interested';
      return `<div class="card event-card">
        <div class="event-card__banner"><div class="event-card__date"><div class="mon">${d.mon}</div><div class="day">${d.day}</div></div></div>
        <div class="event-card__body">
          <span class="tag ${status === "interested" ? "tag-orange" : ""}" style="margin-bottom:10px;">${label}</span>
          <h4>${escapeHtml(e.title)}</h4>
          <p class="text-faint" style="font-size:.85rem; margin:8px 0 16px;"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(e.location)}</p>
          <a href="event-details.html?id=${e.id}" class="btn btn-secondary btn-block btn-sm">View Details</a>
        </div>
      </div>`;
    }
    const typeTag = e.featured
      ? '<span class="tag tag-orange" style="margin-bottom:10px;">Featured</span>'
      : `<span class="tag" style="margin-bottom:10px;">${e.type === "online" ? "Online" : "In-person"}</span>`;
    const locIcon = e.type === "online" ? "fa-video" : "fa-location-dot";
    const btnClass = e.featured ? "btn btn-primary btn-block btn-sm" : "btn btn-secondary btn-block btn-sm";
    const rsvpLabel = rsvpByEvent[e.id] ? "Update RSVP" : "RSVP";
    return `<div class="card event-card">
      <div class="event-card__banner"><div class="event-card__date"><div class="mon">${d.mon}</div><div class="day">${d.day}</div></div></div>
      <div class="event-card__body">
        ${typeTag}
        <h4>${escapeHtml(e.title)}</h4>
        <p class="text-faint" style="font-size:.85rem; margin:8px 0 16px;"><i class="fa-solid ${locIcon}"></i> ${escapeHtml(e.location)}</p>
        <a href="event-details.html?id=${e.id}" class="${btnClass}">${rsvpLabel}</a>
      </div>
    </div>`;
  }

  function renderGrid(containerId, list, mode, emptyMsg) {
    const el = document.getElementById(containerId);
    if (!list.length) {
      el.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><i class="fa-solid fa-calendar-xmark"></i><h4>Nothing here yet</h4><p>${emptyMsg}</p></div>`;
      return;
    }
    el.innerHTML = list.map(e => eventCardHtml(e, mode)).join("");
    el.querySelectorAll("[data-recap]").forEach(btn => btn.addEventListener("click", () => showToast("Recap photos are still being uploaded — check back soon!", "info")));
  }

  renderGrid("upcomingGrid", upcoming, "upcoming", "Check back soon for what's next.");
  renderGrid("pastGrid", past, "past", "Past events will show up here.");
  renderGrid("rsvpGrid", mine, "mine", "RSVP to an event and it'll show up here.");
})();