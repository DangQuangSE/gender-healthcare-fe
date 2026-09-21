import React from "react";
import { Modal } from "antd";
import { DETAIL_MESSAGES } from "./BlogDetailModal.constants";

const BlogDetailModal = ({
  open,
  blog,
  commentCount = 0,
  renderStatus,
  onCancel,
  showId = false,
}) => {
  const hasBlog = blog && Object.keys(blog).length > 0;

  return (
    <Modal
      title={blog?.title || DETAIL_MESSAGES.DETAIL_TITLE}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {hasBlog ? (
        <div>
          {showId && (
            <div className="blog-detail-item">
              <b>ID:</b> {blog.id}
            </div>
          )}
          <div className="blog-detail-item">
            <b>{DETAIL_MESSAGES.TITLE}:</b> {blog.title}
          </div>
          <div className="blog-detail-item">
            <b>{DETAIL_MESSAGES.AUTHOR}:</b> {blog.author?.fullname}
          </div>
          <div className="blog-detail-item">
            <b>{DETAIL_MESSAGES.CREATED_AT}:</b> {blog.createdAt}
          </div>
          <div className="blog-detail-item">
            <b>{DETAIL_MESSAGES.UPDATED_AT}:</b> {blog.updatedAt}
          </div>
          <div className="blog-detail-item">
            <b>{DETAIL_MESSAGES.VIEWS}:</b> {blog.viewCount} |{" "}
            <b>{DETAIL_MESSAGES.LIKES}:</b> {blog.likeCount} |{" "}
            <b>{DETAIL_MESSAGES.COMMENTS}:</b> {commentCount}
          </div>
          <div className="blog-detail-item">
            <b>{DETAIL_MESSAGES.STATUS}:</b> {renderStatus(blog.status)}
          </div>
          <div className="blog-detail-item">
            <b>{DETAIL_MESSAGES.TOPICS}:</b>{" "}
            {blog.tags && blog.tags.length
              ? blog.tags.map((tag) => tag.name || tag).join(", ")
              : DETAIL_MESSAGES.EMPTY_VALUE}
          </div>
          {blog.imgUrl ? (
            <div className="blog-detail-item">
              <b>{DETAIL_MESSAGES.BLOG_IMAGE}:</b>
              <br />
              <img src={blog.imgUrl} alt="blog" className="blog-image" />
            </div>
          ) : null}
          <div className="blog-detail-item">
            <b>{DETAIL_MESSAGES.CONTENT}:</b>
            <br />
            <div className="blog-content">{blog.content}</div>
          </div>
        </div>
      ) : (
        <div>{DETAIL_MESSAGES.NO_DATA}</div>
      )}
    </Modal>
  );
};

export default BlogDetailModal;
