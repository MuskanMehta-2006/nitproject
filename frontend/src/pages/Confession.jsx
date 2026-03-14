import React, { useEffect, useState, useRef } from "react";
import "./Confession.css";
import EmojiPicker from "emoji-picker-react";
import { fetchAPI } from "../api";

function Confession() {
  const [confessions, setConfessions] = useState([]);
  const [newConfession, setNewConfession] = useState("");
  const [category, setCategory] = useState("General");
  const [commentInputs, setCommentInputs] = useState({});
  const [showEmoji, setShowEmoji] = useState(null);
  const [visibleComments, setVisibleComments] = useState({});
  const emojiRef = useRef(null);

  const userId = localStorage.getItem("userId") || crypto.randomUUID();

  useEffect(() => {
    localStorage.setItem("userId", userId);
  }, [userId]);

  // ✅ FETCH CONFESSIONS
  useEffect(() => {
    fetchAPI("/api/confessions")
      .then((data) => setConfessions(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // Close emoji picker
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ POST CONFESSION
  const handlePost = async () => {
    if (!newConfession.trim()) return;

    try {
      const data = await fetchAPI("/api/confessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: newConfession,
          category,
          confessorId: userId
        })
      });

      setConfessions((prev) => [data, ...prev]);
      setNewConfession("");
      setCategory("General");

    } catch (err) {
      console.error("Post error:", err);
    }
  };

  // ✅ LIKE
  const handleLike = async (id) => {
    try {
      const updated = await fetchAPI(`/api/confessions/${id}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      setConfessions((prev) =>
        prev.map((c) => (c._id === id ? updated : c))
      );

    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // ✅ COMMENT
  const handleComment = async (id) => {
    const text = commentInputs[id];
    if (!text?.trim()) return;

    try {
      const updated = await fetchAPI(`/api/confessions/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, userId })
      });

      setConfessions((prev) =>
        prev.map((c) => (c._id === id ? updated : c))
      );

      setCommentInputs((prev) => ({
        ...prev,
        [id]: ""
      }));

    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  // ✅ DELETE COMMENT
  const handleDeleteComment = async (confessionId, commentId) => {
    try {

      const updated = await fetchAPI(
        `/api/confessions/${confessionId}/comment/${commentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        }
      );

      setConfessions((prev) =>
        prev.map((c) => (c._id === confessionId ? updated : c))
      );

    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  const toggleComments = (id) => {
    setVisibleComments((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
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

          <button
            className="post-btn"
            onClick={handlePost}
          >
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
            <span className="badge">{c.category}</span>
          </div>

          <p className="confession-text">{c.message}</p>

          <div className="actions">

            <button
              className={c.likedBy?.includes(userId) ? "liked-btn" : ""}
              onClick={() => handleLike(c._id)}
            >
              ❤️ {c.likes}
            </button>

          </div>

          <div className="comments">

            {(visibleComments[c._id]
              ? c.comments
              : c.comments?.slice(0, 2)
            )?.map((com, i) => (

              <div key={i} className="comment">

                💬 {com.text}

                {com.userId === userId && (
                  <span
                    className="delete-comment"
                    onClick={() =>
                      handleDeleteComment(c._id, com._id)
                    }
                  >
                    ❌
                  </span>
                )}

              </div>

            ))}

            {c.comments?.length > 2 && (
              <p
                className="view-more"
                onClick={() => toggleComments(c._id)}
              >
                {visibleComments[c._id]
                  ? "Hide comments"
                  : `View all ${c.comments.length} comments`}
              </p>
            )}

            <div className="add-comment">

              <input
                type="text"
                placeholder="Add comment..."
                value={commentInputs[c._id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [c._id]: e.target.value
                  }))
                }
              />

              <button onClick={() => setShowEmoji(c._id)}>
                😊
              </button>

              <button onClick={() => handleComment(c._id)}>
                Add
              </button>

            </div>

            {showEmoji === c._id && (
              <div className="emoji-container" ref={emojiRef}>
                <EmojiPicker
                  onEmojiClick={(emoji) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [c._id]:
                        (prev[c._id] || "") + emoji.emoji
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