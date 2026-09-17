import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import api from "../../configs/api";
import authStorage from "../../shared/storage/authStorage";
import { CONTENT_MESSAGES } from "../../shared/constants/contentMessages";
import { CommentIcon } from "../Icons/BlogIcons";
import "./CommentSection.css";

const CommentSection = ({
  blogId,
  onCommentAdded: onCommentAddedFromParent,
  onCommentDeleted: onCommentDeletedFromParent,
}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (authStorage.getToken()) {
      setUser(authStorage.getUser());
    }
  }, []);

  // Load comments when component mounts
  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/comment/blog/${blogId}`);
      const data = response.data;

      // Transform comments data
      const transformedComments = Array.isArray(data)
        ? data.map((comment) => ({
            id: comment.id,
            description: comment.description,
            userName: comment.commenterName || "Người dùng ẩn danh",
            userId: comment.commenterId, // Sửa lại lấy từ commenterId
            createdAt: comment.createAt,
            blogId: blogId,
            userAvatar: "/placeholder-user.jpg",
          }))
        : [];

      setComments(transformedComments);
    } catch {
      toast.error(CONTENT_MESSAGES.COMMENT_LOAD_FAILED);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blogId) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [newComment, ...prev]);

    // Notify parent component to update comment count
    if (typeof onCommentAddedFromParent === "function") {
      onCommentAddedFromParent();
    }
  };

  const handleCommentDeleted = (commentId) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));

    // Notify parent component to update comment count
    if (typeof onCommentDeletedFromParent === "function") {
      onCommentDeletedFromParent();
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h3 className="comment-title">
          <CommentIcon size={20} color="#333" /> Bình luận ({comments.length})
        </h3>
        <p className="comment-subtitle">
          Chia sẻ suy nghĩ của bạn về bài viết này
        </p>
      </div>

      {/* Comment Form - Only show if user is logged in */}
      {user ? (
        <CommentForm
          blogId={blogId}
          user={user}
          onCommentAdded={handleCommentAdded}
          onRefresh={loadComments}
        />
      ) : (
        <div className="login-prompt">
          <p>🔐 Bạn cần đăng nhập để có thể bình luận</p>
          <button
            className="login-btn"
            onClick={() => (window.location.href = "/login")}
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="comment-list">
        {loading ? (
          <div className="comments-loading">
            <span className="loading-spinner"></span>
            Đang tải bình luận...
          </div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>Chưa có bình luận nào</p>
            <p>Hãy là người đầu tiên chia sẻ ý kiến!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={user}
              onCommentDeleted={handleCommentDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
