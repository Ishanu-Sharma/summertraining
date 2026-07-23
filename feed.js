/*
   THE QUAD — feed.js
*/

function buildUsersMap(users) {
  const map = {};
  users.forEach(u => { map[u.id] = u; });
  return map;
}

function renderFeedCard(post, usersById, currentUser) {
  const author = usersById[post.authorId] || { fullName: "Former Member", avatar: "https://i.pravatar.cc/80?img=1", role: "alumni" };
  const liked = (post.likedBy || []).includes(currentUser.id);

  const el = document.createElement("div");
  el.className = "card feed-card";
  el.dataset.postId = post.id;

  const subtitle = author.role === "admin" ? "Official" : escapeHtml((author.jobTitle || "") + (author.company ? ", " + author.company : ""));
  const batchTag = author.role === "admin" ? "" : `<span class="tag" style="margin-left:6px;">Class of ${author.gradYear}</span>`;

  el.innerHTML = `
    <div class="feed-card__head">
      <img src="${author.avatar}" alt="${escapeHtml(author.fullName)}">
      <div style="flex:1;">
        <div class="name">${escapeHtml(author.fullName)}${batchTag}</div>
        <div class="meta">${subtitle} · ${timeAgo(post.createdAt)}</div>
      </div>
      ${post.tag ? `<span class="tag tag-orange">${escapeHtml(post.tag)}</span>` : ""}
    </div>
    <p class="body-text">${escapeHtml(post.text)}</p>
    <div class="feed-card__actions">
      <button type="button" class="like-btn"><i class="fa-${liked ? "solid" : "regular"} fa-thumbs-up"></i> <span class="like-count">${(post.likedBy || []).length}</span> Likes</button>
      <button type="button" class="reply-toggle-btn"><i class="fa-regular fa-comment"></i> <span class="reply-count">${(post.replies || []).length}</span> Comments</button>
      <button type="button" class="share-btn"><i class="fa-solid fa-share"></i> Share</button>
    </div>
    <div class="replies-wrap hidden"></div>
  `;

  const likeBtn = el.querySelector(".like-btn");
  likeBtn.addEventListener("click", async () => {
    const res = await DB.toggleLike(post.id, currentUser.id, 60);
    likeBtn.querySelector("i").className = "fa-" + (res.liked ? "solid" : "regular") + " fa-thumbs-up";
    likeBtn.querySelector(".like-count").textContent = res.count;
  });

  const repliesWrap = el.querySelector(".replies-wrap");
  const replyToggle = el.querySelector(".reply-toggle-btn");

  function renderReplies() {
    const list = (post.replies || []).map(r => {
      const ru = usersById[r.userId] || { fullName: "Someone" };
      return `<div class="reply-item"><strong>${escapeHtml(ru.fullName)}</strong> — ${escapeHtml(r.text)}</div>`;
    }).join("");
    repliesWrap.innerHTML = list + `
      <form class="inline-reply">
        <input type="text" placeholder="Write a comment..." maxlength="240">
        <button type="submit" class="btn btn-primary btn-sm">Post</button>
      </form>`;
    repliesWrap.querySelector(".inline-reply").addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = e.target.querySelector("input");
      const text = input.value.trim();
      if (!text) return;
      const reply = await DB.addReply(post.id, currentUser.id, text);
      post.replies = post.replies || [];
      post.replies.push(reply);
      el.querySelector(".reply-count").textContent = post.replies.length;
      renderReplies();
    });
  }

  replyToggle.addEventListener("click", () => {
    repliesWrap.classList.toggle("hidden");
    if (!repliesWrap.dataset.built) {
      repliesWrap.dataset.built = "1";
      renderReplies();
    }
  });

  el.querySelector(".share-btn").addEventListener("click", async () => {
    const url = window.location.href.split("#")[0] + "#post-" + post.id;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!", "success");
    } catch (err) {
      showToast("Couldn't copy the link in this browser.", "error");
    }
  });

  return el;
}