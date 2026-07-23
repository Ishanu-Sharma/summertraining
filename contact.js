/* THE QUAD — contact.js */
(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  (async () => {
    if (!Auth.isLoggedIn()) return;
    const user = await Auth.currentUser();
    if (!user) return;
    const nameInput = document.getElementById("cName");
    const emailInput = document.getElementById("cEmail");
    if (nameInput && !nameInput.value) nameInput.value = user.fullName;
    if (emailInput && !emailInput.value) emailInput.value = user.email;
  })();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    Validate.clearAllErrors(form);

    const name = document.getElementById("cName");
    const email = document.getElementById("cEmail");
    const subject = document.getElementById("cSubject");
    const message = document.getElementById("cMessage");
    let valid = true;

    if (!Validate.isRequired(name.value)) { Validate.showError(name, "Enter your name."); valid = false; }
    if (!Validate.isEmail(email.value)) { Validate.showError(email, "Enter a valid email address."); valid = false; }
    if (!subject.value) { Validate.showError(subject, "Select a topic."); valid = false; }
    if (!Validate.minLength(message.value, 10)) { Validate.showError(message, "Tell us a little more (10+ characters)."); valid = false; }
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.classList.add("is-loading");
    btn.textContent = "Sending...";

    setTimeout(() => {
      btn.classList.remove("is-loading");
      btn.textContent = "Message Sent ✓";
      form.reset();
      showToast("Thanks — the Alumni Office will get back to you within 2 business days.", "success");
      setTimeout(() => { btn.textContent = original; }, 2500);
    }, 700);
  });
})();