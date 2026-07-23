/* THE QUAD — index.js */
(async function () {
  if (!Auth.isLoggedIn()) return;
  const user = await Auth.currentUser();
  if (!user) return;
  const actions = document.querySelector(".header-actions");
  if (actions) {
    actions.innerHTML = '<a href="dashboard.html" class="btn btn-primary btn-sm">Go to Dashboard</a>';
  }
})();