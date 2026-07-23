/* THE QUAD — login.js */
(function () {
  Auth.requireGuest();

  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    Validate.clearAllErrors(form);

    const email = document.getElementById("email");
    const password = document.getElementById("password");
    let valid = true;

    if (!Validate.isEmail(email.value)) { Validate.showError(email, "Enter a valid email address."); valid = false; }
    if (!Validate.isRequired(password.value)) { Validate.showError(password, "Enter your password."); valid = false; }
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    const originalLabel = btn.textContent;
    btn.classList.add("is-loading");
    btn.textContent = "Logging in...";

    try {
      await Auth.login(email.value, password.value);
      showToast("Welcome back!", "success");
      window.location.href = "dashboard.html";
    } catch (err) {
      btn.classList.remove("is-loading");
      btn.textContent = originalLabel;
      Validate.showError(password, err.message);
    }
  });

  document.querySelectorAll(".auth-card .btn-secondary").forEach(btn => {
    btn.addEventListener("click", () => showToast("Social login arrives with the Node.js backend phase.", "info"));
  });
})();