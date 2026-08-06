import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { api } from "../api/client";
import { buildUsersMap, timeAgo, resolveAvatar } from "../utils/format";

function dayLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Messages() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const withId = searchParams.get("with");

  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [chatInput, setChatInput] = useState("");
  const bodyRef = useRef(null);

  const usersById = useMemo(() => buildUsersMap(users), [users]);

  async function loadConversations() {
    const [{ conversations }, { users }] = await Promise.all([api.get("/conversations"), api.get("/users")]);
    setConversations(conversations);
    setUsers(users);
    return conversations;
  }

  useEffect(() => {
    (async () => {
      const convs = await loadConversations();
      if (withId && withId !== user.id) {
        const { conversation } = await api.post(`/conversations/with/${withId}`);
        setConversations(prev => (prev.some(c => c.id === conversation.id) ? prev : [conversation, ...prev]));
        setActiveId(conversation.id);
      } else if (convs.length) {
        setActiveId(convs[0].id);
      }
    })();
  }, []);

  useEffect(() => {
    if (!socket) return;
    function onMessage(message) {
      setConversations(prev => prev.map(c => {
        if (c.id !== message.conversationId) return c;
        if (c.messages.some(m => m.id === message.id)) return c;
        return { ...c, messages: [...c.messages, message] };
      }));
    }
    socket.on("message:new", onMessage);
    return () => socket.off("message:new", onMessage);
  }, [socket]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [activeId, conversations]);

  const activeConv = conversations.find(c => c.id === activeId);

  function otherUser(conv) {
    const otherIdVal = conv.participantIds.find(pid => pid !== user.id);
    return usersById[otherIdVal];
  }
  function unreadFor(conv) {
    const lastRead = (conv.lastReadAt && conv.lastReadAt[user.id]) || 0;
    return conv.messages.filter(m => m.senderId !== user.id && new Date(m.createdAt).getTime() > lastRead).length;
  }

  const filteredConvs = conversations.filter(c => {
    if (!search) return true;
    const ou = otherUser(c);
    return ou && ou.fullName.toLowerCase().includes(search.toLowerCase());
  });

  async function openConversation(id) {
    setActiveId(id);
    await api.post(`/conversations/${id}/read`);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, lastReadAt: { ...c.lastReadAt, [user.id]: Date.now() } } : c));
  }

  async function sendMessage(e) {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || !activeConv) return;
    setChatInput("");
    const { message } = await api.post(`/conversations/${activeConv.id}/messages`, { text });
    setConversations(prev => prev.map(c => c.id === activeConv.id
      ? (c.messages.some(m => m.id === message.id) ? c : { ...c, messages: [...c.messages, message] })
      : c));
  }

  return (
    <AppShell searchable={false}>
      <div className="messages-shell">
        <aside className="conv-list">
          <div className="conv-list__search">
            <div className="input-icon">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="search" placeholder="Search messages" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div>
            {filteredConvs.map(c => {
              const ou = otherUser(c);
              if (!ou) return null;
              const last = c.messages[c.messages.length - 1];
              const unread = unreadFor(c);
              return (
                <a href="#" key={c.id} className={"conv-item" + (c.id === activeId ? " active" : "")}
                   onClick={e => { e.preventDefault(); openConversation(c.id); }}>
                  <img src={resolveAvatar(ou.avatar)} alt="" />
                  <div className="info">
                    <div className="top-row"><span className="name">{ou.fullName}</span><span className="time">{last ? timeAgo(last.createdAt) : ""}</span></div>
                    <div className="snippet">{last ? last.text : "Say hello!"}</div>
                  </div>
                  {unread > 0 && <span className="unread-count">{unread}</span>}
                </a>
              );
            })}
            {!filteredConvs.length && (
              <div className="empty-state" style={{ padding: "40px 20px" }}><i className="fa-regular fa-comments"></i><h4>No conversations</h4></div>
            )}
          </div>
        </aside>

        <div className="chat-pane">
          {!activeConv && (
            <div className="empty-state" style={{ margin: "auto" }}>
              <i className="fa-regular fa-comments"></i>
              <h4>Select a conversation</h4>
              <p>Pick someone from the list to see your messages.</p>
            </div>
          )}
          {activeConv && (() => {
            const ou = otherUser(activeConv);
            if (!ou) return null;
            let lastDay = null;
            return (
              <>
                <div className="chat-header">
                  <img src={resolveAvatar(ou.avatar)} alt="" />
                  <div style={{ flex: 1 }}>
                    <div className="name">{ou.fullName}</div>
                    <div className="status"><span className="status-dot online"></span> {ou.role === "admin" ? "Official account" : "Class of " + ou.gradYear}</div>
                  </div>
                </div>
                <div className="chat-body" ref={bodyRef}>
                  {activeConv.messages.map(m => {
                    const day = new Date(m.createdAt).toDateString();
                    const showDivider = day !== lastDay;
                    lastDay = day;
                    const side = m.senderId === user.id ? "out" : "in";
                    const time = new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                    return (
                      <div key={m.id}>
                        {showDivider && <div className="chat-day-divider">{dayLabel(m.createdAt)}</div>}
                        <div className={"bubble " + side}>{m.text}<span className="time">{time}</span></div>
                      </div>
                    );
                  })}
                </div>
                <form className="chat-input" onSubmit={sendMessage}>
                  <button type="button" className="icon-btn" aria-label="Attach file"><i className="fa-solid fa-paperclip"></i></button>
                  <input type="text" placeholder="Write a message..." autoComplete="off" value={chatInput} onChange={e => setChatInput(e.target.value)} />
                  <button type="submit" className="btn btn-primary btn-icon" aria-label="Send message"><i className="fa-solid fa-paper-plane"></i></button>
                </form>
              </>
            );
          })()}
        </div>
      </div>
    </AppShell>
  );
}
