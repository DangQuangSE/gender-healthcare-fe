import api, { upload } from "../configs/api";
import dayjs from "dayjs";
import authStorage from "../shared/storage/authStorage";

export const fetchBlogs = (page = 0, size = 10) => {
  return api.get(`/blog?page=${page}&size=${size}`);
};

export const fetchAllBlogs = (page = 0, size = 10) => {
  // Try with different parameters to get all status blogs
  return api.get(`/blog?page=${page}&size=${size}&includeAll=true&status=ALL`);
};

export const fetchMyBlogs = (page = 0, size = 10) => {
  // Try different endpoints for consultant's own blogs
  return api.get(`/blog/my-blogs?page=${page}&size=${size}`);
};

export const fetchBlogsByAuthor = (authorId, page = 0, size = 10) => {
  // Try to get blogs by author ID
  return api.get(`/blog/author/${authorId}?page=${page}&size=${size}`);
};

export const fetchBlogDetail = (id) => {
  // API này sẽ tự động tăng viewCount khi được gọi
  return api.get(`/blog/detail/${id}`);
};

// API để xem blog và tăng viewCount
export const viewBlogAndIncreaseCount = (id) => {
  // Endpoint: GET /blog/{id} - Xem blog và tự động tăng lượt xem
  return api.get(`/blog/${id}`);
};

// fetchBlogsByTag is imported from tagAPI below

export const fetchTagById = (tagId) => {
  return api.get(`/tags/${tagId}`);
};

// Import tag functions from tagAPI for consistency
export {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  fetchBlogsByMultipleTags,
  fetchBlogsByTag,
} from "./tagAPI";

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "unsigned_preset");
  return upload.post("", formData);
};

export const fetchConsultantSchedule = (userId) => {
  const today = dayjs().format("YYYY-MM-DD");
  const oneMonthLater = dayjs().add(30, "day").format("YYYY-MM-DD");
  // Use dynamic date range instead of hardcoded dates
  return api.get(
    `/schedules/view?consultant_id=${userId}&from=${today}&to=${oneMonthLater}`
  );
};

export const createBlog = (blogData) => {
  const formData = new FormData();

  // Required fields
  formData.append("title", blogData.title);
  formData.append("content", blogData.content);
  // Không cần truyền status nữa - backend sẽ tự động set

  // Optional image file
  if (blogData.imgFile) {
    formData.append("image", blogData.imgFile);
  }

  // Tags - backend expects tag names, not IDs
  if (blogData.tagNames && blogData.tagNames.length > 0) {
    blogData.tagNames.forEach((tagName) => {
      formData.append("tags", tagName);
    });
  }

  return api.post("/blog", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Toggle this to enable/disable simulation mode
const LIKE_API_SIMULATION_MODE = false;

export const likeBlog = async (id) => {
  const token = authStorage.getToken();

  if (LIKE_API_SIMULATION_MODE) {
    // Simulation mode for testing UI
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            message: `Blog ${id} liked successfully (simulated)`,
            blogId: id,
          },
        });
      }, 500);
    });
  }

  // Check if user is logged in
  if (!token) {
    throw new Error(`Bạn cần đăng nhập để thích bài viết`);
  }

  // REAL API CALL with authentication
  try {
    const response = await api.post(
      `/blog/${id}/like`,
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error(`Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.`);
    } else if (error.response?.status === 403) {
      throw new Error(`Bạn không có quyền thích bài viết này.`);
    } else if (error.response?.status === 404) {
      throw new Error(`Bài viết không tồn tại.`);
    } else {
      throw new Error(`Không thể thích bài viết. Vui lòng thử lại sau.`);
    }
  }
};

export const cancelSchedule = (scheduleData) => {
  return api.post("/schedules/cancel", scheduleData);
};

export const registerSchedule = (requestBody) => {
  return api.post("/schedules/register", requestBody);
};

// Get consultant schedules with date range
export const getConsultantSchedules = (consultantId, from, to) => {
  const params = new URLSearchParams();
  params.append("consultant_id", consultantId);
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  return api.get(`/schedules/view?${params.toString()}`);
};

export const deleteBlog = async (blogId) => {
  const token = authStorage.getToken();

  // Check if user is logged in
  if (!token) {
    throw new Error(`Bạn cần đăng nhập để xóa bài viết`);
  }

  try {
    const response = await api.delete(`/blog/${blogId}`);

    return response;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error(`Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.`);
    } else if (error.response?.status === 403) {
      throw new Error(`Bạn không có quyền xóa bài viết này.`);
    } else if (error.response?.status === 404) {
      throw new Error(`Bài viết không tồn tại hoặc đã bị xóa.`);
    } else {
      throw new Error(`Không thể xóa bài viết. Vui lòng thử lại sau.`);
    }
  }
};

export const fetchAvailableSlots = (serviceId, from, to) => {
  const params = { service_id: serviceId, from, to };
  return api.get("/schedules/slot-free-service", { params });
};

// Get my schedule (for current logged-in consultant)
export const getMySchedule = (date, status) => {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (status) params.append("status", status);

  return api.get(`/appointment/my-schedule?${params.toString()}`);
};

// Update appointment detail status
export const updateAppointmentDetailStatus = (appointmentDetailId, status) => {
  return api.patch(
    `/appointment/detail/${appointmentDetailId}/status?status=${status}`
  );
};
