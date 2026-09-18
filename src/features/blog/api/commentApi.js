import apiClient from "../../../shared/api/client";
import CONTENT_MESSAGES from "../../../shared/constants/contentMessages";
import { COMMENT_ERROR_MESSAGES_BY_STATUS } from "./commentApi.constants";

export const fetchComments = (blogId) =>
  apiClient.get(`/v1/comments/blogs/${blogId}`);

export const createComment = (comment) =>
  apiClient.post("/v1/comments", comment);

export const deleteComment = (commentId) =>
  apiClient.delete(`/v1/comments/${commentId}`);

export const fetchBlogSummary = async () => {
  try {
    return await apiClient.get("/v1/blogs/summary");
  } catch (error) {
    const status = error.response?.status;
    throw new Error(
      COMMENT_ERROR_MESSAGES_BY_STATUS[status] ||
        CONTENT_MESSAGES.BLOG_SUMMARY_LOAD_FAILED
    );
  }
};
