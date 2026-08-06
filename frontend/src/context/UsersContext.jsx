import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

// Caches the full /users directory in memory so switching between pages
// (Dashboard, Directory, Jobs, Messages, Profile, Admin...) doesn't refetch
// and re-render the entire user list from scratch every time. Pages that
// need something else alongside it (posts, events, etc.) can still fire
// those requests in parallel — only /users itself is deduplicated.
const UsersContext = createContext(null);

export function UsersProvider({ children }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const inFlight = useRef(null);

  const refresh = useCallback(async () => {
    if (!inFlight.current) {
      inFlight.current = api.get("/users")
        .then(({ users }) => { setUsers(users); setLoaded(true); return users; })
        .finally(() => { inFlight.current = null; });
    }
    return inFlight.current;
  }, []);

  useEffect(() => {
    if (currentUser) refresh();
    else { setUsers([]); setLoaded(false); }
  }, [currentUser, refresh]);

  return (
    <UsersContext.Provider value={{ users, loaded, refresh }}>
      {children}
    </UsersContext.Provider>
  );
}

// Returns the cached users list immediately (empty array on first ever
// load until the initial fetch resolves) plus a refresh() to call after
// something changes it (e.g. a socket "admin:user-updated" event).
export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
}
