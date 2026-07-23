/*
   THE QUAD — validate.js
*/

const Validate = {
  isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim()); },
  isRequired(v) { return (v || "").toString().trim().length > 0; },
  minLength(v, n) { return (v || "").toString().trim().length >= n; },

  showError(input, message) {
    const field = input.closest(".field");
    if (!field) return;
    field.classList.add("has-error");
    let msg = field.querySelector(".field-error");
    if (!msg) {
      msg = document.createElement("span");
      msg.className = "field-error";
      field.appendChild(msg);
    }
    msg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + message;
  },
  clearError(input) {
    const field = input.closest(".field");
    if (!field) return;
    field.classList.remove("has-error");
    const msg = field.querySelector(".field-error");
    if (msg) msg.remove();
  },
  clearAllErrors(form) {
    form.querySelectorAll(".field.has-error").forEach(f => f.classList.remove("has-error"));
    form.querySelectorAll(".field-error").forEach(e => e.remove());
  }
};

/* ---------- Toasts ---------- */
function ensureToastStack() {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
}
function showToast(message, type) {
  const stack = ensureToastStack();
  const toast = document.createElement("div");
  toast.className = "toast" + (type ? " " + type : "");
  const icon = type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-exclamation" : "fa-circle-info";
  toast.innerHTML = '<i class="fa-solid ' + icon + '"></i><span></span>';
  toast.querySelector("span").textContent = message;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = "opacity .3s ease, transform .3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(6px)";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ---------- Formatting ---------- */
function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + "d ago";
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks + "w ago";
  const months = Math.floor(days / 30);
  if (months < 12) return months + "mo ago";
  return Math.floor(days / 365) + "y ago";
}
function formatEventDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return { mon: d.toLocaleDateString("en-US", { month: "short" }), day: d.toLocaleDateString("en-US", { day: "2-digit" }) };
}
function formatFullDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}
function initials(name) {
  return (name || "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}
function qsParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}