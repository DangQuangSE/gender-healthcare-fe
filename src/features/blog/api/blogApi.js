import dayjs from "dayjs";
import apiClient, { uploadClient } from "../../../shared/api/client";
import authStorage from "../../../shared/storage/authStorage";
import { CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from "../../../shared/config/env";
import CONTENT_MESSAGES from "../../../shared/constants/contentMessages";
import {
  BLOG_ERROR_MESSAGES_BY_STATUS,
  CONSULTANT_SCHEDULE_RANGE_DAYS,
} from "./blogApi.constants";

export const fetchBlogs = (page = 0, size = 10) =>
  apiClient.get("/v1/blogs", { params: { page, size } });

export const fetchAllBlogs = (page = 0, size = 10) =>
  apiClient.get("/v1/blogs/admin/all", { params: { page, size } });

export const fetchMyBlogs = (page = 0, size = 10) =>
  apiClient.get("/v1/blogs/me", { params: { page, size } });

export const fetchBlogsByStatus = (status, page = 0, size = 10) =>
  apiClient.get("/v1/blogs/admin/by-status", {
    params: { status, page, size },
  });

export const fetchMyBlogsByStatus = (status, page = 0, size = 10) =>
  apiClient.get("/v1/blogs/me/by-status", {
    params: { status, page, size },
  });

export const fetchBlogDetail = (blogId) =>
  apiClient.get(`/v1/blogs/${blogId}/detail`);

export const viewBlogAndIncreaseCount = (blogId) =>
  apiClient.get(`/v1/blogs/${blogId}`);

export const uploadImage = (file) => {
  if (!CLOUDINARY_UPLOAD_URL || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(CONTENT_MESSAGES.IMAGE_UPLOAD_NOT_CONFIGURED);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  return uploadClient.post("", formData);
};

export const createBlog = ({ title, content, imgFile, tagNames = [] }) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);

  if (imgFile) {
    formData.append("image", imgFile);
  }

  tagNames.forEach((tagName) => formData.append("tags", tagName));
  return apiClient.post("/v1/blogs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const likeBlog = async (blogId) => {
  if (!authStorage.getToken()) {
    throw new Error(CONTENT_MESSAGES.BLOG_LOGIN_REQUIRED);
  }

  try {
    return await apiClient.post(`/v1/blogs/${blogId}/like`);
  } catch (error) {
    const status = error.response?.status;
    throw new Error(
      BLOG_ERROR_MESSAGES_BY_STATUS.like[status] ||
        CONTENT_MESSAGES.BLOG_LIKE_FAILED
    );
  }
};

export const deleteBlog = async (blogId) => {
  if (!authStorage.getToken()) {
    throw new Error(CONTENT_MESSAGES.BLOG_LOGIN_REQUIRED);
  }

  try {
    return await apiClient.delete(`/v1/blogs/${blogId}`);
  } catch (error) {
    const status = error.response?.status;
    throw new Error(
      BLOG_ERROR_MESSAGES_BY_STATUS.delete[status] ||
        CONTENT_MESSAGES.BLOG_DELETE_FAILED
    );
  }
};

export const submitBlog = (blogId) =>
  apiClient.post(`/v1/blogs/${blogId}/submit`);

export const updateBlog = (blogId, params, formData) =>
  apiClient.put(`/v1/blogs/${blogId}`, formData, {
    params,
    headers: formData?.has("image")
      ? { "Content-Type": "multipart/form-data" }
      : {},
  });

export const approveBlog = (blogId) =>
  apiClient.post(`/v1/blogs/admin/${blogId}/approve`);

export const rejectBlog = (blogId) =>
  apiClient.post(`/v1/blogs/admin/${blogId}/reject`);

export const publishBlog = (blogId) =>
  apiClient.post(`/v1/blogs/admin/${blogId}/publish`);

export const getConsultantSchedule = (userId) => {
  const from = dayjs().format("YYYY-MM-DD");
  const to = dayjs()
    .add(CONSULTANT_SCHEDULE_RANGE_DAYS, "day")
    .format("YYYY-MM-DD");
  return apiClient.get(`/v1/schedules/consultants/${userId}`, {
    params: { from, to },
  });
};
