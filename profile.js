/* THE QUAD — profile.js */
(async function () {
  const currentUser = await bootProtectedPage();
  if (!currentUser) return;

  const viewedId = qsParam("id") || currentUser.id;
  const isOwn = viewedId === currentUser.id;

  const [viewedUser, allUsers, myConnections] = await Promise.all([
    DB.getUser(viewedId), DB.getUsers(), DB.getConnectionsFor(currentUser.id)
  ]);

  if (!viewedUser) {
    document.querySelector(".app-content").innerHTML =
      '<div class="empty-state"><i class="fa-solid fa-user-slash"></i><h4>Profile not found</h4><p>This alumni profile doesn\'t exist.</p></div>';
    return;
  }

  document.title = viewedUser.fullName + " — Profile — The Quad";

  /* ---- Banner ---- */
  document.getElementById("profAvatar").src = viewedUser.avatar;
  document.getElementById("profName").textContent = viewedUser.fullName;
  document.getElementById("profRingGem").textContent = viewedUser.gradYear ? "'" + String(viewedUser.gradYear).slice(-2) : "•";
  document.getElementById("profHeadline").textContent = viewedUser.headline || (viewedUser.role === "admin"
    ? "Assam Downtown University Alumni Relations Office"
    : `${viewedUser.jobTitle || "Alum"}${viewedUser.company ? " at " + viewedUser.company : ""}`);
  document.getElementById("profLocation").textContent = viewedUser.location || "—";
  document.getElementById("profEducationLine").textContent = viewedUser.role === "admin"
    ? "University Administration"
    : `${viewedUser.department || "—"}, Class of ${viewedUser.gradYear || "—"}`;
  document.getElementById("profCompany").textContent = viewedUser.company || "—";
  document.getElementById("profJoined").textContent = "Joined The Quad in " + new Date(viewedUser.createdAt).getFullYear();

  const skillsWrap = document.getElementById("profSkills");
  skillsWrap.innerHTML = (viewedUser.skills || []).map(s => `<span class="tag">${escapeHtml(s)}</span>`).join("")
    || '<span class="text-faint" style="font-size:.85rem;">No skills listed yet.</span>';

  /* ---- Actions ---- */
  const editBtn = document.getElementById("profEditBtn");
  const connectBtn = document.getElementById("profConnectBtn");
  const messageBtn = document.getElementById("profMessageBtn");
  const shareBtn = document.getElementById("profShareBtn");

  if (isOwn) {
    connectBtn.classList.add("hidden");
    messageBtn.classList.add("hidden");
  } else {
    editBtn.classList.add("hidden");
    const alreadyConnected = myConnections.includes(viewedId);
    connectBtn.classList.toggle("hidden", alreadyConnected);
    messageBtn.classList.toggle("hidden", !alreadyConnected);
    messageBtn.href = "messages.html?with=" + viewedId;

    connectBtn.addEventListener("click", async () => {
      await DB.connectUsers(currentUser.id, viewedId);
      connectBtn.classList.add("hidden");
      messageBtn.classList.remove("hidden");
      showToast("You're now connected with " + viewedUser.fullName.split(" ")[0] + "!", "success");
    });
  }

  shareBtn.addEventListener("click", async () => {
    const url = window.location.origin + window.location.pathname + "?id=" + viewedId;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Profile link copied to clipboard!", "success");
    } catch (err) {
      showToast("Couldn't copy the link in this browser.", "error");
    }
  });

  /* ---- About tab ---- */
  document.getElementById("profBio").textContent = viewedUser.bio || "This alum hasn't written a bio yet.";
  const emailRow = document.getElementById("profEmailRow");
  if (isOwn || viewedUser.privacy.showEmail) {
    document.getElementById("profEmail").textContent = viewedUser.email;
    emailRow.classList.remove("hidden");
  } else {
    emailRow.classList.add("hidden");
  }
  const linkedinRow = document.getElementById("profLinkedinRow");
  if (viewedUser.linkedin) {
    document.getElementById("profLinkedin").textContent = viewedUser.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com/, "");
    linkedinRow.classList.remove("hidden");
  } else {
    linkedinRow.classList.add("hidden");
  }

  /* ---- Experience tab ---- */
  const expWrap = document.getElementById("profExperience");
  expWrap.innerHTML = (viewedUser.experience || []).map(x => `
    <div class="thread-item">
      <h4>${escapeHtml(x.title)}</h4>
      <p class="text-soft">${escapeHtml(x.company)} · ${escapeHtml(x.period)}${x.location ? " · " + escapeHtml(x.location) : ""}</p>
      ${x.desc ? `<p style="margin-top:8px;">${escapeHtml(x.desc)}</p>` : ""}
    </div>`).join("") || '<p class="text-faint">No experience listed yet.</p>';

  /* ---- Education tab ---- */
  const eduWrap = document.getElementById("profEducation");
  eduWrap.innerHTML = (viewedUser.education || []).map(x => `
    <div class="thread-item">
      <h4>${escapeHtml(x.degree)}</h4>
      <p class="text-soft">${escapeHtml(x.school)} · ${escapeHtml(x.period)}</p>
    </div>`).join("") || '<p class="text-faint">No education listed yet.</p>';

  /* ---- Posts tab ---- */
  const usersById = buildUsersMap(allUsers);
  const posts = await DB.getPostsByAuthor(viewedId);
  const postsWrap = document.getElementById("profPosts");
  if (posts.length) {
    posts.forEach(p => postsWrap.appendChild(renderFeedCard(p, usersById, currentUser)));
  } else {
    postsWrap.innerHTML = '<div class="empty-state"><i class="fa-regular fa-comment-dots"></i><h4>No posts yet</h4><p>Updates this alum shares will show up here.</p></div>';
  }

  /* ---- Batchmates widget ---- */
  document.getElementById("profBatchmatesTitle").textContent = "Batchmates · Class of " + (viewedUser.gradYear || "—");
  const batchmates = allUsers.filter(u => u.id !== viewedId && u.role === "alumni" && u.gradYear === viewedUser.gradYear).slice(0, 4);
  document.getElementById("profBatchmatesList").innerHTML = batchmates.map(u => `
    <a href="profile.html?id=${u.id}" class="widget-list-item" style="text-decoration:none;">
      <img src="${u.avatar}" alt="">
      <div class="info"><div class="name">${escapeHtml(u.fullName)}</div><div class="sub">${escapeHtml(u.department || "")}${u.company ? ", " + escapeHtml(u.company) : ""}</div></div>
    </a>`).join("") || '<p class="text-faint" style="font-size:.85rem;">No other batchmates on The Quad yet.</p>';

  /* ---- Mutual connections widget ---- */
  const mutualWidgetTitle = document.querySelector('[id="mutualAvatars"]').closest(".widget").querySelector("h4");
  const mutualAvatars = document.getElementById("mutualAvatars");
  const mutualText = document.getElementById("mutualText");

  if (isOwn) {
    mutualWidgetTitle.textContent = "Your Connections";
    const mine = myConnections.map(id => usersById[id]).filter(Boolean).slice(0, 4);
    mutualAvatars.innerHTML = mine.map(u => `<img src="${u.avatar}" alt="${escapeHtml(u.fullName)}">`).join("");
    mutualText.textContent = myConnections.length
      ? `Connected with ${myConnections.length} alum${myConnections.length === 1 ? "" : "i"}.`
      : "You haven't connected with anyone yet — try the Directory.";
  } else {
    const theirConnections = await DB.getConnectionsFor(viewedId);
    const mutualIds = myConnections.filter(id => theirConnections.includes(id) && id !== currentUser.id && id !== viewedId);
    const mutualUsers = mutualIds.map(id => usersById[id]).filter(Boolean);
    mutualAvatars.innerHTML = mutualUsers.slice(0, 4).map(u => `<img src="${u.avatar}" alt="${escapeHtml(u.fullName)}">`).join("");
    mutualText.textContent = mutualUsers.length
      ? `Including ${mutualUsers.slice(0, 2).map(u => u.fullName).join(" and ")}${mutualUsers.length > 2 ? `, and ${mutualUsers.length - 2} more` : ""}.`
      : "No mutual connections yet.";
  }
})();