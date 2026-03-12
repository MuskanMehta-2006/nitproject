import React, { useEffect, useState, useRef } from "react";
import "./Confession.css";
import EmojiPicker from "emoji-picker-react";

function Confession() {
  const [confessions, setConfessions] = useState([]);
  const [newConfession, setNewConfession] = useState("");
  const [category, setCategory] = useState("General"); // ✅ category state
  const [commentInputs, setCommentInputs] = useState({});
  const [showEmoji, setShowEmoji] = useState(null);
  const [visibleComments, setVisibleComments] = useState({});
  const emojiRef = useRef(null);

  // Generate / store unique user id
  const userId = localStorage.getItem("userId") || crypto.randomUUID();

  useEffect(() => {
    localStorage.setItem("userId", userId);
  }, [userId]);

  // Fetch confessions
  useEffect(() => {
    fetch("http://localhost:5000/api/confessions")
      .then((res) => res.json())
      .then((data) => setConfessions(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Post confession
  const handlePost = async () => {
    if (!newConfession.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/confessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newConfession,
          category, // ✅ include category
          confessorId: userId
        })
      });

      const data = await res.json();
      setConfessions((prev) => [data, ...prev]);
      setNewConfession("");
      setCategory("General"); // reset category
    } catch (err) {
      console.error("Post error:", err);
    }
  };

  // Like / Unlike toggle
  const handleLike = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/confessions/${id}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      const updated = await res.json();
      setConfessions((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // Add comment
  const handleComment = async (id) => {
    const text = commentInputs[id];
    if (!text?.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/confessions/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, userId }) // ✅ send userId to track comment owner
      });

      const updated = await res.json();
      setConfessions((prev) => prev.map((c) => (c._id === id ? updated : c)));
      setCommentInputs((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  // Delete comment
  const handleDeleteComment = async (confessionId, commentId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/confessions/${confessionId}/comment/${commentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }) // ✅ only owner can delete
        }
      );

      const updated = await res.json();
      setConfessions((prev) =>
        prev.map((c) => (c._id === confessionId ? updated : c))
      );
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  // Toggle comments (View / Hide)
  const toggleComments = (id) => {
    setVisibleComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="confession-page">
      <h1 className="page-title">💌 Confession Room</h1>

      {/* WRITE BOX */}
   <div className="write-box">
  <textarea
    placeholder="Write your confession anonymously..."
    value={newConfession}
    onChange={(e) => setNewConfession(e.target.value)}
  />

  <div className="write-actions">

    {/* LEFT SIDE (Emoji + Dropdown) */}
    <div className="left-actions">
      <button
        className="emoji-btn"
        onClick={() => setShowEmoji("post")}
      >
        😊
      </button>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="category-dropdown"
      >
        <option value="General">General</option>
        <option value="Serious Issue">Serious Issue</option>
        <option value="Feedback">Feedback</option>
        <option value="Crush">Crush/Love</option>
      </select>
    </div>

    {/* RIGHT SIDE (Post Button) */}
    <button className="post-btn" onClick={handlePost}>
      Post
    </button>

  </div>

  {showEmoji === "post" && (
    <div className="emoji-container" ref={emojiRef}>
      <EmojiPicker
        onEmojiClick={(emoji) =>
          setNewConfession((prev) => prev + emoji.emoji)
        }
      />
    </div>
  )}
</div>

      {/* CONFESSION LIST */}
      {confessions.map((c) => (
        <div key={c._id} className="confession-card">
          <div className="card-header">
            <span className="badge">{c.category}</span> {/* show category */}
          </div>
          <p className="confession-text">{c.message}</p>

          {/* LIKE BUTTON */}
          <div className="actions">
            <button
              className={c.likedBy?.includes(userId) ? "liked-btn" : ""}
              onClick={() => handleLike(c._id)}
            >
              ❤️ {c.likes}
            </button>
          </div>

          <div className="comments">
            {/* COMMENTS LIST */}
            {(visibleComments[c._id] ? c.comments : c.comments?.slice(0, 2))?.map(
              (com, i) => (
                <div key={i} className="comment">
                  💬 {com.text}

                  {/* ✅ DELETE BUTTON */}
                  {com.userId === userId && (
                    <span
                      className="delete-comment"
                      onClick={() => handleDeleteComment(c._id, com._id)}
                    >
                      ❌
                    </span>
                  )}
                </div>
              )
            )}

            {/* VIEW/HIDE COMMENTS */}
            {c.comments?.length > 2 && (
              <p
                className="view-more"
                onClick={() => toggleComments(c._id)}
                style={{ cursor: "pointer" }}
              >
                {visibleComments[c._id]
                  ? "Hide comments"
                  : `View all ${c.comments.length} comments`}
              </p>
            )}

            {/* ADD COMMENT */}
            <div className="add-comment">
              <input
                type="text"
                placeholder="Add comment..."
                value={commentInputs[c._id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({ ...prev, [c._id]: e.target.value }))
                }
              />

              <button onClick={() => setShowEmoji(c._id)}>😊</button>
              <button onClick={() => handleComment(c._id)}>Add</button>
            </div>

            {/* Emoji Picker */}
            {showEmoji === c._id && (
              <div className="emoji-container" ref={emojiRef}>
                <EmojiPicker
                  onEmojiClick={(emoji) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [c._id]: (prev[c._id] || "") + emoji.emoji
                    }))
                  }
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Confession;