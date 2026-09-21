import apiClient from "../../../shared/api/client";

export const fetchTags = () => apiClient.get("/v1/tags");

export const createTag = (tag) => apiClient.post("/v1/tags", tag);

export const updateTag = (tagId, tag) =>
  apiClient.put(`/v1/tags/${tagId}`, tag);

export const deleteTag = (tagId) => apiClient.delete(`/v1/tags/${tagId}`);

export const fetchTagById = (tagId) => apiClient.get(`/v1/tags/${tagId}`);

export const fetchBlogsByMultipleTags = (tagIds, page = 0, size = 10) =>
  apiClient.get("/v1/blogs/by-tags", {
    params: { tags: tagIds, page, size },
  });

export const fetchBlogsByTag = (tagId, page = 0, size = 10) =>
  apiClient.get(`/v1/blogs/by-tag/${tagId}`, { params: { page, size } });
