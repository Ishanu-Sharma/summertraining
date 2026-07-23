/* THE QUAD — register.js */
(function () {
  Auth.requireGuest();

  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    Validate.clearAllErrors(form);

    const fullName = document.getElementById("fullName");
    const gradYear = document.getElementById("gradYear");
    const email = document.getElementById("regEmail");
    const department = document.getElementById("department");
    const password = document.getElementById("regPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const terms = form.querySelector('input[name="terms"]');

    let valid = true;
    if (!Validate.isRequired(fullName.value)) { Validate.showError(fullName, "Enter your full name."); valid = false; }
    if (!gradYear.value) { Validate.showError(gradYear, "Select your graduation year."); valid = false; }
    if (!Validate.isEmail(email.value)) { Validate.showError(email, "Enter a valid email address."); valid = false; }
    if (!department.value) { Validate.showError(department, "Select your department."); valid = false; }
    if (!Validate.minLength(password.value, 6)) { Validate.showError(password, "Use at least 6 characters."); valid = false; }
    if (!confirmPassword.value || confirmPassword.value !== password.value) { Validate.showError(confirmPassword, "Passwords don't match."); valid = false; }
    if (!terms.checked) { showToast("Please accept the Terms of Service to continue.", "error"); valid = false; }
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    const originalLabel = btn.textContent;
    btn.classList.add("is-loading");
    btn.textContent = "Creating account...";

    try {
      await Auth.register({
        fullName: fullName.value.trim(),
        email: email.value.trim(),
        gradYear: parseInt(gradYear.value, 10),
        department: department.value,
        password: password.value,
        jobTitle: "", company: "", industry: "", location: "", bio: ""
      });
      showToast("Welcome to The Quad! Your profile is pending verification.", "success");
      window.location.href = "dashboard.html";
    } catch (err) {
      btn.classList.remove("is-loading");
      btn.textContent = originalLabel;
      Validate.showError(email, err.message);
    }
  });
})();