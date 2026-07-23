/* THE QUAD — messages.js */
(async function () {
  const user = await bootProtectedPage();
  if (!user) return;

  const [conversations, allUsers] = await Promise.all([
    DB.getConversationsFor(user.id), DB.getUsers()
  ]);
  const usersById = buildUsersMap(allUsers);

  const convListEl = document.getElementById("convListItems");
  const chatPane = document.getElementById("chatPane");
  let activeConvId = null;

  function otherUser(conv) {
    const otherId = conv.participantIds.find(id => id !== user.id);
    return usersById[otherId];
  }
  function unreadFor(conv) {
    const lastRead = (conv.lastReadAt && conv.lastReadAt[user.id]) || 0;
    return conv.messages.filter(m => m.senderId !== user.id && new Date(m.createdAt).getTime() > lastRead).length;
  }
  function lastMessage(conv) {
    return conv.messages[conv.messages.length - 1];
  }

  function renderConvList(filterText) {
    const list = conversations.filter(c => {
      if (!filterText) return true;
      const ou = otherUser(c);
      return ou && ou.fullName.toLowerCase().includes(filterText.toLowerCase());
    });

    if (!list.length) {
      convListEl.innerHTML = '<div class="empty-state" style="padding:40px 20px;"><i class="fa-regular fa-comments"></i><h4>No conversations</h4></div>';
      return;
    }

    convListEl.innerHTML = list.map(c => {
      const ou = otherUser(c);
      if (!ou) return "";
      const last = lastMessage(c);
      const unread = unreadFor(c);
      return `<a href="#" class="conv-item${c.id === activeConvId ? " active" : ""}" data-conv-id="${c.id}">
        <img src="${ou.avatar}" alt="">
        <div class="info">
          <div class="top-row"><span class="name">${escapeHtml(ou.fullName)}</span><span class="time">${last ? timeAgo(last.createdAt) : ""}</span></div>
          <div class="snippet">${last ? escapeHtml(last.text) : "Say hello!"}</div>
        </div>
        ${unread ? `<span class="unread-count">${unread}</span>` : ""}
      </a>`;
    }).join("");

    convListEl.querySelectorAll("[data-conv-id]").forEach(a => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        openConversation(a.dataset.convId);
      });
    });
  }

  function dayLabel(iso) {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function renderMessages(conv) {
    const body = document.getElementById("chatBody");
    if (!body) return;
    let lastDay = null;
    let html = "";
    conv.messages.forEach(m => {
      const day = new Date(m.createdAt).toDateString();
      if (day !== lastDay) {
        html += `<div class="chat-day-divider">${dayLabel(m.createdAt)}</div>`;
        lastDay = day;
      }
      const side = m.senderId === user.id ? "out" : "in";
      const time = new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      html += `<div class="bubble ${side}">${escapeHtml(m.text)}<span class="time">${time}</span></div>`;
    });
    body.innerHTML = html;
    body.scrollTop = body.scrollHeight;
  }

  async function openConversation(convId) {
    activeConvId = convId;
    const conv = conversations.find(c => c.id === convId);
    const ou = otherUser(conv);
    if (!ou) return;

    await DB.markConversationRead(convId, user.id);
    conv.lastReadAt = conv.lastReadAt || {};
    conv.lastReadAt[user.id] = Date.now();
    renderConvList(document.getElementById("convSearch").value);

    document.querySelectorAll("[data-message-badge]").forEach(async (el) => {
      const unread = await DB.getUnreadCount(user.id);
      el.classList.toggle("hidden", unread === 0);
    });

    chatPane.innerHTML = `
      <div class="chat-header">
        <img src="${ou.avatar}" alt="">
        <div style="flex:1;">
          <div class="name">${escapeHtml(ou.fullName)}</div>
          <div class="status"><span class="status-dot online"></span> ${ou.role === "admin" ? "Official account" : "Class of " + ou.gradYear}</div>
        </div>
        <button type="button" class="icon-btn" aria-label="More options"><i class="fa-solid fa-ellipsis"></i></button>
      </div>
      <div class="chat-body" id="chatBody"></div>
      <form class="chat-input" id="chatForm">
        <button type="button" class="icon-btn" aria-label="Attach file"><i class="fa-solid fa-paperclip"></i></button>
        <input type="text" id="chatInput" placeholder="Write a message..." autocomplete="off">
        <button type="submit" class="btn btn-primary btn-icon" aria-label="Send message"><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    `;
    renderMessages(conv);

    document.getElementById("chatForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("chatInput");
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      const msg = await DB.sendMessage(conv.id, user.id, text);
      conv.messages.push(msg);
      renderMessages(conv);
      renderConvList(document.getElementById("convSearch").value);

      setTimeout(async () => {
        const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        const replyMsg = await DB.sendMessage(conv.id, ou.id, reply);
        conv.messages.push(replyMsg);
        if (activeConvId === conv.id) renderMessages(conv);
        renderConvList(document.getElementById("convSearch").value);
      }, 1300 + Math.random() * 900);
    });
  }

  document.getElementById("convSearch").addEventListener("input", (e) => renderConvList(e.target.value));

  const withId = qsParam("with");
  let initialConvId = null;
  if (withId && withId !== user.id) {
    const conv = await DB.getOrCreateConversation(user.id, withId);
    if (!conversations.find(c => c.id === conv.id)) conversations.unshift(conv);
    initialConvId = conv.id;
  } else if (conversations.length) {
    initialConvId = conversations[0].id;
  }

  renderConvList("");
  if (initialConvId) openConversation(initialConvId);
})();