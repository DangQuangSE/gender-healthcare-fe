import apiClient from "../../../shared/api/client";

export const fetchComments = (blogId) =>
  apiClient.get(`/v1/comments/blogs/${blogId}`);

export const createComment = (comment) =>
  apiClient.post("/v1/comments", comment);

export const deleteComment = (commentId) =>
  apiClient.delete(`/v1/comments/${commentId}`);

export const fetchBlogSummary = () => apiClient.get("/v1/blogs/summary");
