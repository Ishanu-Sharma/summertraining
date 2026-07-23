/*
   THE QUAD — auth.js
*/

const SESSION_KEY = "quad_session_user_id";

const Auth = {
  currentUserId() {
    return localStorage.getItem(SESSION_KEY);
  },
  isLoggedIn() {
    return !!this.currentUserId();
  },
  async currentUser() {
    const id = this.currentUserId();
    if (!id) return null;
    return await DB.getUser(id);
  },
  async login(email, password) {
    const user = await DB.getUserByEmail(email);
    if (!user || user.password !== password) {
      throw new Error("That email and password don't match our records.");
    }
    localStorage.setItem(SESSION_KEY, user.id);
    return user;
  },
  async register(data) {
    const existing = await DB.getUserByEmail(data.email);
    if (existing) throw new Error("An account with this email already exists.");
    const user = await DB.createUser(data);
    localStorage.setItem(SESSION_KEY, user.id);
    return user;
  },
  logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "index.html";
  },
  /** Call at the top of every protected page. Redirects to login if no session. */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  },
  /** Call at the top of login/register pages. Bounces already-logged-in users to their dashboard. */
  requireGuest() {
    if (this.isLoggedIn()) {
      window.location.href = "dashboard.html";
      return true;
    }
    return false;
  },
  /** Call at the top of admin.html. Resolves the user only if they're an admin. */
  async requireAdmin() {
    if (!this.requireAuth()) return null;
    const user = await this.currentUser();
    if (!user || user.role !== "admin") {
      window.location.href = "dashboard.html";
      return null;
    }
    return user;
  }
};