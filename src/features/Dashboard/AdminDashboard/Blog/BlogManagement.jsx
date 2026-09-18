import React, { useState, useEffect } from "react";
import { Form } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  fetchBlogDetail,
  createBlog,
  deleteBlog,
  uploadImage,
  fetchAllBlogs,
  fetchBlogsByStatus,
  updateBlog,
  approveBlog,
  rejectBlog,
  publishBlog,
} from "../../../blog/api/blogApi";
import { fetchBlogSummary } from "../../../blog/api/commentApi";
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  fetchBlogsByMultipleTags,
  fetchBlogsByTag,
} from "../../../blog/api/tagApi";
import {
  createBlogColumns,
  createTagColumns,
} from "../../../blog/components/BlogTableColumns";
import BlogListView from "../../../blog/components/BlogListView";
import BlogTagManagementView from "../../../blog/components/BlogTagManagementView";
import BLOG_MESSAGES from "../../../blog/constants/blogMessages";
import {
  BLOG_STATUS_CONFIG,
  DEFAULT_BLOG_STATUS_CONFIG,
} from "../../../blog/constants/blogStatusConstants";
import getApiErrorMessage from "../../../../shared/api/errors";
import "./BlogManagement.css";

const BlogManagement = ({ userId, selectedTab }) => {
  // Form instances
  const [createBlogForm] = Form.useForm();
  const [editBlogForm] = Form.useForm();
  const [tagForm] = Form.useForm();

  // State
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState({});
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateBlogModalVisible, setIsCreateBlogModalVisible] =
    useState(false);
  const [isEditBlogModalVisible, setIsEditBlogModalVisible] = useState(false);
  const [, setImageUploading] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [createBlogLoading, setCreateBlogLoading] = useState(false);

  // Tag state
  const [tagOptions, setTagOptions] = useState([]);
  const [tags, setTags] = useState([]);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  // Status filter state
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [commentCounts, setCommentCounts] = useState({});

  // Load comment counts
  const loadCommentCounts = async () => {
    try {
      const response = await fetchBlogSummary();
      const commentData = response.data || [];

      // Convert array to object for easy lookup
      const commentMap = {};
      commentData.forEach((blog) => {
        commentMap[blog.blog_id] = blog.commentCount || 0;
      });

      setCommentCounts(commentMap);
    } catch (error) {
      console.error("Error loading comment counts:", error);
      setCommentCounts({});
    }
  };

  // Load blogs - Admin xem tất cả blog (mọi trạng thái)
  const loadBlogs = async (page = 0, size = 10) => {
    setLoadingBlogs(true);
    try {
      // Sử dụng endpoint admin/all theo API documentation
      const res = await fetchAllBlogs(page, size);

      let blogData = [];
      if (res.data?.content && Array.isArray(res.data.content)) {
        blogData = res.data.content;
      } else if (Array.isArray(res.data)) {
        blogData = res.data;
      } else if (res.data && typeof res.data === "object") {
        blogData = [res.data];
      }

      const processedBlogs = blogData.map((blog) => {
        const cleanAuthor = blog.author
          ? {
              id: blog.author.id,
              fullname: blog.author.fullname || "Không có tác giả",
              email: blog.author.email,
              imageUrl: blog.author.imageUrl,
              role: blog.author.role,
            }
          : { fullname: "Không có tác giả" };

        return {
          id: blog.id || blog.blog_id,
          title: blog.title || "Không có tiêu đề",
          content: blog.content || "Không có nội dung",
          imgUrl: blog.imgUrl,
          viewCount: blog.viewCount || 0,
          likeCount: blog.likeCount || 0,
          status: blog.status,
          createdAt: blog.createdAt
            ? new Date(blog.createdAt).toLocaleString("vi-VN")
            : "Không có",
          updatedAt: blog.updatedAt
            ? new Date(blog.updatedAt).toLocaleString("vi-VN")
            : "Không có",
          author: cleanAuthor,
          tags: Array.isArray(blog.tags) ? blog.tags : [],
        };
      });
      setBlogs(processedBlogs);
    } catch (error) {
      console.error(" Load blogs error:", error);
      toast.error(
        BLOG_MESSAGES.TOAST.LOAD_FAILED(
          error.message || BLOG_MESSAGES.TOAST.UNKNOWN_ERROR
        )
      );
      setBlogs([]);
    } finally {
      setLoadingBlogs(false);
    }
  };

  // Load blogs by status (admin only)
  const loadBlogsByStatus = async (status, page = 0, size = 10) => {
    setLoadingBlogs(true);
    try {
      const res = await fetchBlogsByStatus(status, page, size);
      let blogData = [];
      if (res.data?.content && Array.isArray(res.data.content)) {
        blogData = res.data.content;
      } else if (Array.isArray(res.data)) {
        blogData = res.data;
      } else if (res.data && typeof res.data === "object") {
        blogData = [res.data];
      }
      const processedBlogs = blogData.map((blog) => {
        const cleanAuthor = blog.author
          ? {
              id: blog.author.id,
              fullname: blog.author.fullname || "Không có tác giả",
              email: blog.author.email,
              imageUrl: blog.author.imageUrl,
              role: blog.author.role,
            }
          : { fullname: "Không có tác giả" };

        return {
          id: blog.id || blog.blog_id,
          title: blog.title || "Không có tiêu đề",
          content: blog.content || "Không có nội dung",
          imgUrl: blog.imgUrl,
          viewCount: blog.viewCount || 0,
          likeCount: blog.likeCount || 0,
          status: blog.status,
          createdAt: blog.createdAt
            ? new Date(blog.createdAt).toLocaleString("vi-VN")
            : "Không có",
          updatedAt: blog.updatedAt
            ? new Date(blog.updatedAt).toLocaleString("vi-VN")
            : "Không có",
          author: cleanAuthor,
          tags: Array.isArray(blog.tags) ? blog.tags : [],
        };
      });
      setBlogs(processedBlogs);
    } catch (error) {
      toast.error(
        BLOG_MESSAGES.TOAST.STATUS_LOAD_FAILED(
          error.message || BLOG_MESSAGES.TOAST.UNKNOWN_ERROR
        )
      );
      setBlogs([]);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const loadTags = async () => {
    try {
      const res = await fetchTags();
      const activeTags = (res.data || []).filter(
        (tag) => !tag.deleted && !tag.deleted_at && tag.status !== "DELETED"
      );

      setTagOptions(
        activeTags.map((tag) => ({
          label: tag.name,
          value: tag.id,
        }))
      );
      setTags(activeTags);
    } catch (error) {
      console.error(" Load tags error:", error);
      setTagOptions([]);
      setTags([]);
    }
  };

  // Filter blogs by multiple tags
  const handleFilterByTags = async (tagIds) => {
    setSelectedTags(tagIds || []);
    if (!tagIds || tagIds.length === 0) {
      loadBlogs();
      return;
    }
    try {
      let res;
      if (tagIds.length === 1) {
        // Single tag - use existing API
        res = await fetchBlogsByTag(tagIds[0]);
      } else {
        // Multiple tags - use new API
        res = await fetchBlogsByMultipleTags(tagIds);
      }

      const blogData = res.data?.content || res.data || [];
      const processedBlogs = blogData.map((blog) => ({
        ...blog,
        id: blog.id || blog.blog_id,
        createdAt: blog.createdAt
          ? new Date(blog.createdAt).toLocaleString("vi-VN")
          : "Không có",
        updatedAt: blog.updatedAt
          ? new Date(blog.updatedAt).toLocaleString("vi-VN")
          : "Không có",
        author: blog.author || { fullname: "Không có tác giả" },
        tags: Array.isArray(blog.tags) ? blog.tags : [],
      }));
      setBlogs(processedBlogs);
    } catch (error) {
      console.error("Error filtering blogs by tags:", error);
      toast.error(BLOG_MESSAGES.TOAST.FILTER_FAILED);
      setBlogs([]);
    }
  };

  // Handle filter by status
  const handleFilterByStatus = (status) => {
    setSelectedStatus(status);
    if (status === "ALL") {
      loadBlogs();
    } else {
      loadBlogsByStatus(status);
    }
  };

  // Admin actions for blog approval
  const handleApproveBlog = async (id) => {
    try {
      await approveBlog(id);
      toast.success(BLOG_MESSAGES.TOAST.APPROVE_SUCCESS);

      // Refresh data ngay lập tức
      await loadBlogs();

    } catch (error) {
      console.error(" Error approving blog:", error);
      toast.error(BLOG_MESSAGES.TOAST.APPROVE_FAILED);
    }
  };

  const handleRejectBlog = async (id) => {
    try {
      await rejectBlog(id);
      toast.success(BLOG_MESSAGES.TOAST.REJECT_SUCCESS);
      loadBlogs();
    } catch (error) {
      console.error(" Error rejecting blog:", error);
      toast.error(BLOG_MESSAGES.TOAST.REJECT_FAILED);
    }
  };

  const handlePublishBlog = async (id) => {
    try {
      await publishBlog(id);
      toast.success(BLOG_MESSAGES.TOAST.PUBLISH_SUCCESS);

      await loadBlogs(); // Tải lại danh sách
    } catch (error) {
      console.error(" Error publishing blog:", error);
      toast.error(BLOG_MESSAGES.TOAST.PUBLISH_FAILED);
    }
  };

  // Fetch blog detail
  const handleFetchBlogDetail = async (id) => {
    if (!id) {
      toast.error(BLOG_MESSAGES.TOAST.INVALID_ID);
      return;
    }

    try {
      const res = await fetchBlogDetail(id);

      let blog = {};
      try {
        if (typeof res.data === "string") {
          blog = JSON.parse(res.data);
        } else {
          blog = res.data || {};
        }
      } catch {
        const responseText = String(res.data);
        const titleMatch = responseText.match(/"title":"([^"]*)"/);
        const contentMatch = responseText.match(/"content":"([^"]*?)"/);
        const idMatch = responseText.match(/"id":(\d+)/);
        const viewCountMatch = responseText.match(/"viewCount":(\d+)/);
        const likeCountMatch = responseText.match(/"likeCount":(\d+)/);
        const statusMatch = responseText.match(/"status":"([^"]*?)"/);
        const imgUrlMatch = responseText.match(/"imgUrl":"([^"]*?)"/);
        const authorNameMatch = responseText.match(/"fullname":"([^"]*?)"/);

        blog = {
          id: idMatch ? parseInt(idMatch[1]) : null,
          title: titleMatch ? titleMatch[1] : "Không thể tải tiêu đề",
          content: contentMatch ? contentMatch[1] : "Không thể tải nội dung",
          viewCount: viewCountMatch ? parseInt(viewCountMatch[1]) : 0,
          likeCount: likeCountMatch ? parseInt(likeCountMatch[1]) : 0,
          status: statusMatch ? statusMatch[1] : "UNKNOWN",
          imgUrl: imgUrlMatch ? imgUrlMatch[1] : "",
          author: {
            fullname: authorNameMatch
              ? authorNameMatch[1]
              : "Không thể tải thông tin tác giả",
            id: null,
            email: "",
            imageUrl: "",
            role: "",
          },
          tags: [],
        };
      }

      const processedBlog = {
        id: blog.id ?? "Không có",
        title: blog.title ?? "Không có tiêu đề",
        author: {
          fullname: blog.author?.fullname ?? "Không có tác giả",
          id: blog.author?.id ?? null,
          email: blog.author?.email ?? "",
          imageUrl: blog.author?.imageUrl ?? "",
          role: blog.author?.role ?? "",
        },
        createdAt: blog.createdAt
          ? new Date(blog.createdAt).toLocaleString("vi-VN")
          : "Không có",
        updatedAt: blog.updatedAt
          ? new Date(blog.updatedAt).toLocaleString("vi-VN")
          : "Không có",
        viewCount: blog.viewCount ?? 0,
        likeCount: blog.likeCount ?? 0,
        status: blog.status ?? "Không có",
        imgUrl: blog.imgUrl ?? "",
        content: blog.content ?? "Không có nội dung",
        tags: Array.isArray(blog.tags) ? blog.tags : [],
      };

      setSelectedBlog(processedBlog);
      setIsDetailModalVisible(true);
    } catch (error) {
      console.error(` [DEBUG] Error fetching blog detail:`, error);
      console.error(` [DEBUG] Error response:`, error.response?.data);
      console.error(` [DEBUG] Error status:`, error.response?.status);

      toast.error(
        `${BLOG_MESSAGES.TOAST.DETAIL_FAILED}: ${
          error.message || BLOG_MESSAGES.TOAST.UNKNOWN_ERROR
        }`
      );

      setSelectedBlog({
        id: "Không có",
        title: "Lỗi tải dữ liệu",
        author: { fullname: "Không có" },
        createdAt: "Không có",
        updatedAt: "Không có",
        viewCount: 0,
        likeCount: 0,
        status: "Không có",
        imgUrl: "",
        content: "Không thể tải nội dung blog",
        tags: [],
      });
      setIsDetailModalVisible(true);
    }
  };

  const handleCreateBlog = async () => {
    setCreateBlogLoading(true);

    try {
      const values = await createBlogForm.validateFields();

      const fileInput = document.getElementById("blog-image-input");
      const imgFile = fileInput?.files[0] || null;

      if (!values.title || values.title.trim().length < 10) {
        toast.error(BLOG_MESSAGES.TOAST.VALIDATION_TITLE);
        return;
      }

      if (!values.content || values.content.trim().length < 50) {
        toast.error(BLOG_MESSAGES.TOAST.VALIDATION_CONTENT);
        return;
      }

      let tagNames = [];
      if (values.tags && values.tags.length > 0) {
        tagNames = values.tags
          .map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            return tag ? tag.name : null;
          })
          .filter((name) => name !== null);
      }

      const blogData = {
        title: values.title.trim(),
        content: values.content.trim(),
        // Không cần truyền status - backend sẽ tự động set
        imgFile: imgFile,
        tagNames: tagNames,
      };
      try {
        const response = await createBlog(blogData);

        toast.success(BLOG_MESSAGES.TOAST.CREATE_SUCCESS);

        setIsCreateBlogModalVisible(false);
        createBlogForm.resetFields();

        if (response.data) {
          const newBlog = {
            ...response.data,
            createdAt: response.data.createdAt
              ? new Date(response.data.createdAt).toLocaleString("vi-VN")
              : "Vừa tạo",
            updatedAt: response.data.updatedAt
              ? new Date(response.data.updatedAt).toLocaleString("vi-VN")
              : "Vừa tạo",
            author: response.data.author || { fullname: "Bạn" },
            tags: Array.isArray(response.data.tags) ? response.data.tags : [],
          };

          setBlogs((prevBlogs) => [newBlog, ...prevBlogs]);
        }

        await loadBlogs(0, 20);
      } catch (error) {
        console.error(" Create blog failed:", error);
        console.error(" Error response:", error.response?.data);
        if (error.response?.status === 500 && blogData.tagNames.length > 0) {
          const blogDataNoTags = { ...blogData, tagNames: [] };
          const retryResponse = await createBlog(blogDataNoTags);

          toast.warning(
            BLOG_MESSAGES.TOAST.TAGS_RETRY_WARNING
          );
          setIsCreateBlogModalVisible(false);
          createBlogForm.resetFields();
          if (retryResponse.data) {
            const newBlog = {
              ...retryResponse.data,
              createdAt: retryResponse.data.createdAt
                ? new Date(retryResponse.data.createdAt).toLocaleString("vi-VN")
                : "Vừa tạo",
              updatedAt: retryResponse.data.updatedAt
                ? new Date(retryResponse.data.updatedAt).toLocaleString("vi-VN")
                : "Vừa tạo",
              author: retryResponse.data.author || { fullname: "Bạn" },
              tags: [],
            };

            setBlogs((prevBlogs) => [newBlog, ...prevBlogs]);
          }
          await loadBlogs(0, 20);
        } else {
          throw error;
        }
      }
      setIsCreateBlogModalVisible(false);
      createBlogForm.resetFields();
      if (fileInput) {
        fileInput.value = "";
      }
      await loadBlogs();

      toast.success(BLOG_MESSAGES.TOAST.CREATE_SUCCESS);
    } catch (error) {
      let errorMessage = BLOG_MESSAGES.TOAST.UNKNOWN_ERROR;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 500) {
        errorMessage = BLOG_MESSAGES.TOAST.SYSTEM_ERROR;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(BLOG_MESSAGES.TOAST.BLOG_ERROR(errorMessage));
    } finally {
      setCreateBlogLoading(false);
    }
  };
  const handleEditBlog = async () => {
    try {
      const values = await editBlogForm.validateFields();

      // Validate required fields
      if (!values.title || values.title.trim().length < 10) {
        toast.error(BLOG_MESSAGES.TOAST.VALIDATION_TITLE);
        return;
      }

      if (!values.content || values.content.trim().length < 50) {
        toast.error(BLOG_MESSAGES.TOAST.VALIDATION_CONTENT);
        return;
      }

      // Prepare query parameters as per API documentation
      const params = new URLSearchParams();
      params.append("title", values.title.trim());
      params.append("content", values.content.trim());

      // Handle tags - convert tag IDs to tag names
      if (values.tags && values.tags.length > 0) {
        const tagNames = values.tags
          .map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            return tag ? tag.name : null;
          })
          .filter((name) => name !== null);

        tagNames.forEach((tagName) => {
          params.append("tags", tagName);
        });
      }

      // Prepare request body with image (if provided)
      const formData = new FormData();

      // Check if new image is selected
      const fileInput = document.getElementById("edit-blog-image-input");
      const imgFile = fileInput?.files[0];

      if (imgFile) {
        formData.append("image", imgFile);
        console.log("🖼️ New image selected for blog update");
      }

      console.log(
        `🔧 Updating blog ${editingBlogId} with params:`,
        params.toString()
      );

      await updateBlog(editingBlogId, params, formData);

      setIsEditBlogModalVisible(false);
      editBlogForm.resetFields();

      // Clear file input
      if (fileInput) {
        fileInput.value = "";
      }

      await loadBlogs();
      toast.success(BLOG_MESSAGES.TOAST.UPDATE_SUCCESS);
    } catch (error) {
      console.error(" Edit blog error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message || BLOG_MESSAGES.TOAST.UNKNOWN_ERROR;
      toast.error(BLOG_MESSAGES.TOAST.UPDATE_ERROR(errorMessage));
    }
  };
  const handleDeleteBlog = async (blogId) => {
    if (!blogId) return;

    try {
      await deleteBlog(blogId);
      toast.success(BLOG_MESSAGES.TOAST.DELETE_SUCCESS);
      loadBlogs();
    } catch (error) {
      const errorMessage =
        error.message || BLOG_MESSAGES.TOAST.DELETE_FAILED;
      toast.error(errorMessage);
      if (errorMessage.includes("đăng nhập")) {
        setTimeout(() => {
          const shouldLogin = confirm(BLOG_MESSAGES.TOAST.LOGIN_RETRY_CONFIRM);
          if (shouldLogin) {
            window.location.href = "/login";
          }
        }, 2000);
      }
    }
  };
  const handleDeleteTag = async (tagId) => {
    try {
      await deleteTag(tagId);
      const updatedTags = tags.filter((tag) => tag.id !== tagId);
      setTags(updatedTags);
      setTagOptions(
        updatedTags.map((tag) => ({ label: tag.name, value: tag.id }))
      );
      toast.success(BLOG_MESSAGES.TAG.DELETE_SUCCESS);
    } catch (error) {
      toast.error(
        `${BLOG_MESSAGES.TAG.DELETE_FAILED}: ${getApiErrorMessage(
          error,
          BLOG_MESSAGES.TOAST.UNKNOWN_ERROR
        )}`
      );
    }
  };
  const handleEditTag = (record) => {
    setEditingTag(record);
    tagForm.setFieldsValue({
      name: record.name,
      description: record.description || "",
    });
    setIsTagModalVisible(true);
  };
  const handleOpenCreateTag = () => {
    setEditingTag(null);
    tagForm.resetFields();
    setIsTagModalVisible(true);
  };
  const handleSaveTag = async () => {
    try {
      const values = await tagForm.validateFields();
      const wasEditing = Boolean(editingTag);
      let updatedTags;

      if (wasEditing) {
        await updateTag(editingTag.id, values);
        updatedTags = tags.map((tag) =>
          tag.id === editingTag.id ? { ...tag, ...values } : tag
        );
      } else {
        const response = await createTag(values);
        const newTag = response.data || { ...values, id: Date.now() };
        updatedTags = [...tags, newTag];
      }

      setTags(updatedTags);
      setTagOptions(
        updatedTags.map((tag) => ({ label: tag.name, value: tag.id }))
      );
      setIsTagModalVisible(false);
      tagForm.resetFields();
      setEditingTag(null);
      await loadTags(true);
      toast.success(
        wasEditing
          ? BLOG_MESSAGES.TAG.UPDATE_SUCCESS
          : BLOG_MESSAGES.TAG.CREATE_SUCCESS
      );
    } catch (error) {
      const action = editingTag ? "Cập nhật" : "Tạo";
      toast.error(
        `${action} chủ đề thất bại: ${getApiErrorMessage(
          error,
          BLOG_MESSAGES.TOAST.UNKNOWN_ERROR
        )}`
      );
    }
  };
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const res = await uploadImage(file);
      createBlogForm.setFieldsValue({ imgUrl: res.data.secure_url });
      toast.success(BLOG_MESSAGES.TOAST.IMAGE_UPLOAD_SUCCESS);
    } catch {
      toast.error(BLOG_MESSAGES.TOAST.IMAGE_UPLOAD_FAILED);
    } finally {
      setImageUploading(false);
    }
  };
  const renderStatus = (status) => {
    const config = BLOG_STATUS_CONFIG[status] || {
      ...DEFAULT_BLOG_STATUS_CONFIG,
      text: status,
    };
    return (
      <span className={`blog-status ${status.toLowerCase()}`}>
        {config.icon} {config.text}
      </span>
    );
  };
  useEffect(() => {
    if (selectedTab === "write_blogs") {
      loadBlogs();
      loadTags();
      loadCommentCounts();
    } else if (selectedTab === "manage_tags") {
      loadTags();
    }
  }, [selectedTab, userId]);

  const blogColumns = createBlogColumns({
    commentCounts,
    renderStatus,
    onView: handleFetchBlogDetail,
    onEdit: (record) => {
      editBlogForm.setFieldsValue({
        title: record.title,
        content: record.content,
        tags: record.tags?.map((tag) => tag.id),
        status: record.status,
      });
      setIsEditBlogModalVisible(true);
      setEditingBlogId(record.id);
    },
    onDelete: handleDeleteBlog,
    onApprove: handleApproveBlog,
    onReject: handleRejectBlog,
    onPublish: handlePublishBlog,
    canModerate: true,
  });

  const tagColumns = createTagColumns({
    onEdit: handleEditTag,
    onDelete: handleDeleteTag,
  });

  if (selectedTab === "write_blogs") {
    return (
      <BlogListView
        blogs={blogs}
        commentCounts={commentCounts}
        loading={loadingBlogs}
        columns={blogColumns}
        selectedStatus={selectedStatus}
        onStatusChange={handleFilterByStatus}
        selectedTags={selectedTags}
        onTagsChange={handleFilterByTags}
        tagOptions={tagOptions}
        onRefresh={() => loadBlogs()}
        onCreate={() => setIsCreateBlogModalVisible(true)}
        createModal={{
          open: isCreateBlogModalVisible,
          form: createBlogForm,
          onOk: handleCreateBlog,
          onCancel: () => {
            if (!createBlogLoading) {
              setIsCreateBlogModalVisible(false);
              createBlogForm.resetFields();
            }
          },
          loading: createBlogLoading,
          onImageChange: handleImageChange,
        }}
        editModal={{
          open: isEditBlogModalVisible,
          form: editBlogForm,
          onOk: handleEditBlog,
          onCancel: () => {
            setIsEditBlogModalVisible(false);
            editBlogForm.resetFields();
            const fileInput = document.getElementById("edit-blog-image-input");
            if (fileInput) {
              fileInput.value = "";
            }
          },
        }}
        detailModal={{
          open: isDetailModalVisible,
          blog: selectedBlog,
          onCancel: () => setIsDetailModalVisible(false),
        }}
        renderStatus={renderStatus}
        includeStatus
      />
    );
  }
  if (selectedTab === "manage_tags") {
    return (
      <BlogTagManagementView
        tags={tags}
        columns={tagColumns}
        form={tagForm}
        editingTag={editingTag}
        open={isTagModalVisible}
        onCreate={handleOpenCreateTag}
        onOk={handleSaveTag}
        onCancel={() => setIsTagModalVisible(false)}
      />
    );
  }

  return <div>{BLOG_MESSAGES.LIST.EMPTY_TAB}</div>;
};

export default BlogManagement;
