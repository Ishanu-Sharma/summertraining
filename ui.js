/*
   THE QUAD — ui.js
*/

async function wireAppShell(user) {
  if (!user) return null;

  document.querySelectorAll("[data-user-name]").forEach(el => { el.textContent = user.fullName; });
  document.querySelectorAll("[data-user-avatar]").forEach(el => { el.src = user.avatar; el.alt = user.fullName; });
  document.querySelectorAll("[data-user-role]").forEach(el => {
    el.textContent = user.role === "admin" ? "Administrator" : "Class of " + user.gradYear;
  });

  if (user.role !== "admin") {
    document.querySelectorAll(".admin-nav-group").forEach(el => el.remove());
  }

  document.querySelectorAll("[data-logout]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      Auth.logout();
    });
  });

  document.querySelectorAll("[data-notif-bell]").forEach(btn => {
    btn.addEventListener("click", () => showToast("You're all caught up — no new notifications.", "info"));
  });

  try {
    const unread = await DB.getUnreadCount(user.id);
    document.querySelectorAll("[data-message-badge]").forEach(el => el.classList.toggle("hidden", unread === 0));
  } catch (e) { /* non-critical */ }

  return user;
}

/** Standard boot sequence for every protected page: guard, fetch user, wire shell. */
async function bootProtectedPage() {
  if (!Auth.requireAuth()) return null;
  const user = await Auth.currentUser();
  if (!user) { Auth.logout(); return null; }
  await wireAppShell(user);
  return user;
}