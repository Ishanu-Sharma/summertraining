import { useEffect, useState } from "react";
import { api } from "../api/client";
import { timeAgo, resolveAvatar, DEFAULT_AVATAR } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function FeedCard({ post, usersById }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [likedBy, setLikedBy] = useState(post.likedBy || []);
  const [replies, setReplies] = useState(post.replies || []);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { setLikedBy(post.likedBy || []); }, [post.likedBy]);
  useEffect(() => { setReplies(post.replies || []); }, [post.replies]);

  useEffect(() => {
    if (!socket) return;
    function onLike(payload) {
      if (payload.postId !== post.id) return;
      setLikedBy(prev => {
        const has = prev.includes(payload.userId);
        if (payload.liked && !has) return [...prev, payload.userId];
        if (!payload.liked && has) return prev.filter(id => id !== payload.userId);
        return prev;
      });
    }
    function onReply(payload) {
      if (payload.postId !== post.id) return;
      setReplies(prev => (prev.some(r => r.id === payload.reply.id) ? prev : [...prev, payload.reply]));
    }
    socket.on("post:like", onLike);
    socket.on("post:reply", onReply);
    return () => {
      socket.off("post:like", onLike);
      socket.off("post:reply", onReply);
    };
  }, [socket, post.id]);

  const author = usersById[post.authorId] || { fullName: "Former Member", avatar: DEFAULT_AVATAR, role: "alumni" };
  const liked = likedBy.includes(user.id);
  const subtitle = author.role === "admin" ? "Official" : [author.jobTitle, author.company].filter(Boolean).join(", ");

  async function toggleLike() {
    const { liked: nowLiked, count } = await api.post(`/posts/${post.id}/like`);
    setLikedBy(prev => {
      if (nowLiked) return prev.includes(user.id) ? prev : [...prev, user.id];
      return prev.filter(id => id !== user.id);
    });
  }

  async function submitReply(e) {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    const { reply } = await api.post(`/posts/${post.id}/replies`, { text });
    setReplies(prev => [...prev, reply]);
    setReplyText("");
  }

  async function sharePost() {
    const url = window.location.origin + "/dashboard#post-" + post.id;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  }

  return (
    <div className="card feed-card">
      <div className="feed-card__head">
        <img src={resolveAvatar(author.avatar)} alt={author.fullName} />
        <div style={{ flex: 1 }}>
          <div className="name">
            {author.fullName}
            {author.role !== "admin" && <span className="tag" style={{ marginLeft: 6 }}>Class of {author.gradYear}</span>}
          </div>
          <div className="meta">{subtitle} · {timeAgo(post.createdAt)}</div>
        </div>
        {post.tag && <span className="tag tag-orange">{post.tag}</span>}
      </div>
      <p className="body-text">{post.text}</p>
      <div className="feed-card__actions">
        <button type="button" onClick={toggleLike}>
          <i className={"fa-" + (liked ? "solid" : "regular") + " fa-thumbs-up"}></i> <span>{likedBy.length}</span> Likes
        </button>
        <button type="button" onClick={() => setShowReplies(v => !v)}>
          <i className="fa-regular fa-comment"></i> <span>{replies.length}</span> Comments
        </button>
        <button type="button" onClick={sharePost}>
          <i className="fa-solid fa-share"></i> {copied ? "Copied!" : "Share"}
        </button>
      </div>
      {showReplies && (
        <div className="replies-wrap">
          {replies.map(r => {
            const ru = usersById[r.userId] || { fullName: "Someone" };
            return <div className="reply-item" key={r.id}><strong>{ru.fullName}</strong> — {r.text}</div>;
          })}
          <form className="inline-reply" onSubmit={submitReply}>
            <input type="text" placeholder="Write a comment..." maxLength={240} value={replyText} onChange={e => setReplyText(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}
