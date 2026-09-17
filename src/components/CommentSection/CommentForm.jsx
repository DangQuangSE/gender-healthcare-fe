import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../configs/api";
import authStorage from "../../shared/storage/authStorage";
import { CONTENT_MESSAGES } from "../../shared/constants/contentMessages";
const CommentForm = ({ blogId, user, onCommentAdded, onRefresh }) => {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error(CONTENT_MESSAGES.COMMENT_REQUIRED);
      return;
    }

    if (content.length > 1000) {
      toast.error(CONTENT_MESSAGES.COMMENT_TOO_LONG);
      return;
    }

    try {
      setSubmitting(true);
      const token = authStorage.getToken();
      if (!token) {
        toast.error(CONTENT_MESSAGES.LOGIN_REQUIRED);
        return;
      }

      const requestBody = {
        blogId: parseInt(blogId),
        description: content.trim(),
      };

      const response = await api.post("/comment", requestBody);
      const newComment = response.data;

      // Transform the response to match our comment structure
      const transformedComment = {
        id: newComment.id,
        description: newComment.description,
        userName:
          newComment.userName || user.fullname || user.name || "Người dùng",
        createdAt: newComment.createdAt || new Date().toISOString(),
        blogId: parseInt(blogId),
      };

      setContent("");
      onCommentAdded(transformedComment);
      if (typeof onRefresh === "function") onRefresh();
      toast.success(CONTENT_MESSAGES.COMMENT_CREATE_SUCCESS);
    } catch (error) {
      const status = error.response?.status;
      let errorMessage = CONTENT_MESSAGES.COMMENT_CREATE_FAILED;
      if (status === 401) {
        errorMessage = CONTENT_MESSAGES.SESSION_EXPIRED;
      } else if (status === 400) {
        errorMessage = CONTENT_MESSAGES.INVALID_DATA;
      } else if (status === 403) {
        errorMessage = CONTENT_MESSAGES.FORBIDDEN;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div className="comment-form-header">
        <img
          src={user.imageUrl || "/placeholder-user.jpg"}
          alt={user.fullname || user.name || "User"}
          className="comment-form-avatar"
        />
        <div className="comment-form-user">
          <span className="comment-form-username">
            {user.fullname || user.name || "Người dùng"}
          </span>
          <span className="comment-form-prompt">Viết bình luận của bạn...</span>
        </div>
      </div>

      <div className="comment-input-group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
          rows={4}
          maxLength={1000}
          required
          disabled={submitting}
          className="comment-textarea"
        />

        <div className="comment-form-footer">
          <div className="char-count">
            <span className={content.length > 900 ? "char-warning" : ""}>
              {content.length}/1000
            </span>
          </div>

          <div className="comment-form-actions">
            {content.trim() && (
              <button
                type="button"
                onClick={() => setContent("")}
                className="cancel-btn"
                disabled={submitting}
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className="submit-btn"
            >
              {submitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Đang gửi...
                </>
              ) : (
                "Đăng bình luận"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
