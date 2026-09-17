import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Table,
  Space,
  Popconfirm,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import api from "../../../../shared/api/client";
import {
  fetchBlogs,
  fetchBlogDetail,
  createBlog,
  deleteBlog,
  uploadImage,
} from "../../../../api/consultantAPI";
import { fetchBlogSummary } from "../../../../api/commentAPI";
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  fetchBlogsByMultipleTags,
} from "../../../../api/tagAPI";
import {
  EyeIcon,
  HeartIcon,
  CommentIcon,
} from "../../../../components/Icons/BlogIcons";
import "./WriteBlogs.css";

const WriteBlogs = ({ userId, selectedTab }) => {
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
  const [imageUploading, setImageUploading] = useState(false);
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

  // Load blogs
  const loadBlogs = async (page = 0, size = 10) => {
    setLoadingBlogs(true);
    try {
      // Consultant: lấy tất cả blog của mình (mọi trạng thái)
      const res = await api.get("/blog/my-blogs", { params: { page, size } });
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
        `Không thể tải danh sách blog: ${error.message || "Lỗi không xác định"}`
      );
      setBlogs([]);
    } finally {
      setLoadingBlogs(false);
    }
  };

  // Load blogs by status (consultant only)
  const loadBlogsByStatus = async (status, page = 0, size = 10) => {
    setLoadingBlogs(true);
    try {
      const res = await api.get("/blog/my-blogs/by-status", {
        params: { status, page, size },
      });
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
        `Không thể tải blog theo trạng thái: ${
          error.message || "Lỗi không xác định"
        }`
      );
      setBlogs([]);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const loadTags = async (forceRefresh = false) => {
    try {
      console.log("🏷️ Loading tags using tagAPI");

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
        res = await api.get(`/blog/by-tag/${tagIds[0]}`);
      } else {
        // Multiple tags - use new API
        console.log("🏷️ Filter blogs by multiple tags:", tagIds);
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
      toast.error("Không thể lọc blog theo chủ đề");
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

  // Fetch blog detail
  const handleFetchBlogDetail = async (id) => {
    if (!id) {
      toast.error("ID blog không hợp lệ");
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
      } catch (parseError) {
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
      toast.error(
        `Không thể tải chi tiết blog: ${error.message || "Lỗi không xác định"}`
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

    const testUserId = userId || 1;
    console.log(" Using userId (test mode):", testUserId);

    console.log(" UserId found:", userId);

    try {
      const values = await createBlogForm.validateFields();

      const fileInput = document.getElementById("blog-image-input");
      const imgFile = fileInput?.files[0] || null;

      console.log(" Validating title:", values.title?.length);
      if (!values.title || values.title.trim().length < 10) {
        console.error(" Title validation failed");
        toast.error("Tiêu đề phải có ít nhất 10 ký tự!");
        return;
      }

      console.log(" Validating content:", values.content?.length);
      if (!values.content || values.content.trim().length < 50) {
        console.error(" Content validation failed");
        toast.error("Nội dung phải có ít nhất 50 ký tự!");
        return;
      }

      let tagNames = [];
      if (values.tags && values.tags.length > 0) {
        console.log(" Selected tag IDs:", values.tags);
        console.log(" Available tags:", tags);

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
        status: values.status,
        imgFile: imgFile,
        tagNames: tagNames,
      };
      console.log("Submitting blog data:", blogData);
      try {
        const response = await createBlog(blogData);
        toast.success("Tạo blog thành công!");

        // Gửi blog để admin duyệt nếu tạo thành công
        if (response.data && response.data.id) {
          try {
            await api.post(`/blog/${response.data.id}/submit`);
            toast.success("Đã gửi blog để admin duyệt!");
          } catch (submitError) {
            toast.error(
              "Không thể gửi blog để duyệt: " +
                (submitError.response?.data?.message || submitError.message)
            );
          }
        }

        setIsCreateBlogModalVisible(false);
        createBlogForm.resetFields();

        console.log(" Reloading blogs after create...");
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

          console.log(" Adding new blog to state immediately:", newBlog);
          setBlogs((prevBlogs) => [newBlog, ...prevBlogs]);
        }

        await loadBlogs(0, 20);
      } catch (error) {
        console.error(" Create blog failed:", error);
        console.error(" Error response:", error.response?.data);
        if (error.response?.status === 500 && blogData.tagNames.length > 0) {
          console.log(" Retrying without tags...");
          const blogDataNoTags = { ...blogData, tagNames: [] };
          const retryResponse = await createBlog(blogDataNoTags);
          console.log(" Blog created without tags:", retryResponse.data);

          toast.warning(
            "Blog được tạo thành công nhưng không có tags do hạn chế hệ thống"
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

            console.log(" Adding new blog (no tags) to state:", newBlog);
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

      toast.success("Tạo blog thành công!");
    } catch (error) {
      let errorMessage = "Lỗi không xác định";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 500) {
        errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(`Tạo blog thất bại: ${errorMessage}`);
    } finally {
      setCreateBlogLoading(false);
    }
  };
  const handleEditBlog = async () => {
    try {
      const values = await editBlogForm.validateFields();

      // Validate required fields
      if (!values.title || values.title.trim().length < 10) {
        toast.error("Tiêu đề phải có ít nhất 10 ký tự!");
        return;
      }

      if (!values.content || values.content.trim().length < 50) {
        toast.error("Nội dung phải có ít nhất 50 ký tự!");
        return;
      }

      // Prepare query parameters as per API documentation (không có status)
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

      await api.put(`/blog/${editingBlogId}?${params.toString()}`, formData, {
        headers: imgFile ? { "Content-Type": "multipart/form-data" } : {},
      });

      setIsEditBlogModalVisible(false);
      editBlogForm.resetFields();

      // Clear file input
      if (fileInput) {
        fileInput.value = "";
      }

      // Reload blogs theo filter hiện tại
      if (selectedStatus === "ALL") {
        await loadBlogs();
      } else {
        await loadBlogsByStatus(selectedStatus);
      }

      toast.success("Cập nhật blog thành công!");
    } catch (error) {
      console.error(" Edit blog error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Lỗi không xác định";
      toast.error(`Cập nhật blog thất bại: ${errorMessage}`);
    }
  };
  const handleDeleteBlog = async (blogId) => {
    if (!blogId) return;

    try {
      await api.delete(`/blog/${blogId}`);

      toast.success("Xóa blog thành công!");

      // Reload blogs theo filter hiện tại
      if (selectedStatus === "ALL") {
        await loadBlogs();
      } else {
        await loadBlogsByStatus(selectedStatus);
      }
    } catch (error) {
      console.error(" Delete blog error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Không thể xóa blog. Vui lòng thử lại sau.";
      toast.error(errorMessage);

      if (
        errorMessage.includes("đăng nhập") ||
        error.response?.status === 401
      ) {
        setTimeout(() => {
          const shouldLogin = confirm(`🔑 Bạn có muốn đăng nhập lại không?`);
          if (shouldLogin) {
            window.location.href = "/login";
          }
        }, 2000);
      }
    }
  };
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const res = await uploadImage(file);
      createBlogForm.setFieldsValue({ imgUrl: res.data.secure_url });
      toast.success("Upload ảnh thành công!");
    } catch {
      toast.error("Upload ảnh thất bại");
    } finally {
      setImageUploading(false);
    }
  };
  const renderStatus = (status) => {
    const statusConfig = {
      DRAFT: { color: "#8c8c8c", text: "Bản nháp" },
      PENDING: { color: "#faad14", text: "Chờ duyệt" },
      APPROVED: { color: "#52c41a", icon: "", text: "Đã duyệt" },
      PUBLISHED: { color: "#1890ff", text: "Đã đăng" },
      REJECTED: { color: "#ff4d4f", text: "Bị từ chối" },
      ARCHIVED: { color: "#722ed1", text: "Đã lưu trữ" },
    };
    const config = statusConfig[status] || {
      color: "#8c8c8c",
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
  const blogColumns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (title, record) => (
        <div>
          <div className="blog-title-cell">{title || "Không có tiêu đề"}</div>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "12%",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
      render: (createdAt) => (
        <div className="blog-date-cell">{createdAt || "Không có"}</div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status) => renderStatus(status),
    },
    {
      title: "Thống kê",
      key: "stats",
      width: "12%",
      sorter: (a, b) => (a.viewCount || 0) - (b.viewCount || 0),
      render: (_, record) => (
        <div>
          <div className="blog-stats-cell">
            <EyeIcon size={14} color="#666" /> {record.viewCount || 0} lượt xem
          </div>
          <div className="blog-stats-likes">
            <HeartIcon size={14} color="#ff4757" /> {record.likeCount || 0} lượt
            thích
          </div>
          <div className="blog-stats-comments">
            <CommentIcon size={14} color="#666" />{" "}
            {commentCounts[record.id] || 0} bình luận
          </div>
        </div>
      ),
    },
    {
      title: "Chủ đề",
      dataIndex: "tags",
      key: "tags",
      width: "15%",
      render: (tags) => (
        <div>
          {tags && tags.length ? (
            <Tag color="blue" className="blog-tag-primary">
              {tags[0]?.name || tags[0]}
            </Tag>
          ) : (
            <span className="blog-tag-empty">Không có</span>
          )}
          {tags && tags.length > 1 && (
            <div className="blog-tag-count">+{tags.length - 1}</div>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: "13%",
      render: (_, record) => {
        const actions = [];

        // Always show View Detail
        actions.push(
          <Button
            key="detail"
            onClick={() => handleFetchBlogDetail(record.id)}
            size="small"
            type="default"
            block
          >
            Xem chi tiết
          </Button>
        );

        // Show Edit for DRAFT and REJECTED blogs

        actions.push(
          <Button
            key="edit"
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              editBlogForm.setFieldsValue({
                title: record.title,
                content: record.content,
                tags: record.tags?.map((tag) => tag.id),
              });
              setIsEditBlogModalVisible(true);
              setEditingBlogId(record.id);
            }}
            block
          >
            Sửa
          </Button>
        );

        // Show Delete for DRAFT and REJECTED blogs (consultant can delete their own blogs)

        actions.push(
          <Popconfirm
            key="delete"
            title="Xóa blog"
            description={`Bạn có chắc chắn muốn xóa blog "${record.title}"?`}
            onConfirm={() => handleDeleteBlog(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} block>
              Xóa
            </Button>
          </Popconfirm>
        );

        return (
          <Space direction="vertical" size="small">
            {actions}
          </Space>
        );
      },
    },
  ];

  // Tag columns for table
  const tagColumns = [
    { title: "Tên chủ đề", dataIndex: "name", key: "name" },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => {
              setEditingTag(record);
              tagForm.setFieldsValue({
                name: record.name,
                description: record.description || "",
              });
              setIsTagModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa chủ đề này?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={async () => {
              try {
                console.log("🗑️ Delete tag ID:", record.id);
                await deleteTag(record.id);

                const updatedTags = tags.filter((tag) => tag.id !== record.id);
                setTags(updatedTags);
                setTagOptions(
                  updatedTags.map((tag) => ({
                    label: tag.name,
                    value: tag.id,
                  }))
                );
                toast.success("Xóa chủ đề thành công!");
              } catch (error) {
                toast.error(
                  `Xóa chủ đề thất bại: ${
                    error.response?.data?.message ||
                    error.message ||
                    "Lỗi không xác định"
                  }`
                );
              }
            }}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  if (selectedTab === "write_blogs") {
    // Calculate statistics
    const totalBlogs = blogs.length;
    const publishedBlogs = blogs.filter(
      (blog) => blog.status === "PUBLISHED"
    ).length;
    const rejectBlogs = blogs.filter(
      (blog) => blog.status === "REJECTED"
    ).length;
    const totalViews = blogs.reduce(
      (sum, blog) => sum + (blog.viewCount || 0),
      0
    );
    const totalLikes = blogs.reduce(
      (sum, blog) => sum + (blog.likeCount || 0),
      0
    );
    const totalComments = blogs.reduce(
      (sum, blog) => sum + (commentCounts[blog.id] || 0),
      0
    );

    return (
      <div>
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stats-card total">
            <div className="stats-label">Tổng số bài viết</div>
            <div className="stats-number total">{totalBlogs}</div>
          </div>

          <div className="stats-card published">
            <div className="stats-label">Đã xuất bản</div>
            <div className="stats-number published">{publishedBlogs}</div>
          </div>

          <div className="stats-card draft">
            <div className="stats-label">Từ chối</div>
            <div className="stats-number draft">{rejectBlogs}</div>
          </div>

          <div className="stats-card views">
            <div className="stats-label">Tổng lượt xem</div>
            <div className="stats-number views">{totalViews}</div>
          </div>

          <div className="stats-card likes">
            <div className="stats-label">Tổng lượt thích</div>
            <div className="stats-number likes">{totalLikes}</div>
          </div>

          <div className="stats-card comments">
            <div className="stats-label">Tổng bình luận</div>
            <div className="stats-number comments">{totalComments}</div>
          </div>
        </div>

        {/* Filter and Actions */}
        <div className="filter-actions">
          <div style={{ display: "flex", gap: "16px" }}>
            <Select
              placeholder="Lọc theo trạng thái"
              className="filter-select"
              value={selectedStatus}
              onChange={handleFilterByStatus}
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "PENDING", label: "Chờ duyệt" },
                { value: "PUBLISHED", label: "Đã đăng" },
                { value: "REJECTED", label: "Bị từ chối" },
              ]}
            />
            <Select
              mode="multiple"
              allowClear
              placeholder="Lọc theo chủ đề"
              className="filter-select"
              options={tagOptions}
              value={selectedTags}
              onChange={handleFilterByTags}
              style={{ minWidth: 200 }}
              maxTagCount="responsive"
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateBlogModalVisible(true)}
          >
            Tạo Blog mới
          </Button>
        </div>
        <Table
          columns={blogColumns}
          dataSource={blogs}
          loading={loadingBlogs}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} bài viết`,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          size="middle"
        />

        {/* Modal tạo blog mới */}
        <Modal
          title="Tạo bài đăng mới"
          open={isCreateBlogModalVisible}
          onOk={handleCreateBlog}
          onCancel={() => {
            if (!createBlogLoading) {
              setIsCreateBlogModalVisible(false);
              createBlogForm.resetFields();
            }
          }}
          okText="Tạo bài đăng"
          cancelText="Hủy"
          width={800}
          confirmLoading={createBlogLoading}
          maskClosable={!createBlogLoading}
        >
          <Form form={createBlogForm} layout="vertical">
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề!" },
                { min: 10, message: "Tiêu đề phải có ít nhất 10 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tiêu đề bài viết" />
            </Form.Item>

            <Form.Item
              name="content"
              label="Nội dung"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung!" },
                { min: 50, message: "Nội dung phải có ít nhất 50 ký tự!" },
              ]}
            >
              <Input.TextArea
                rows={8}
                placeholder="Nhập nội dung bài viết..."
              />
            </Form.Item>

            <Form.Item name="tags" label="Chủ đề">
              <Select
                mode="multiple"
                placeholder="Chọn chủ đề"
                options={tagOptions}
                allowClear
              />
            </Form.Item>

            <Form.Item label="Ảnh đại diện">
              <input
                id="blog-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-upload-input"
                disabled={createBlogLoading}
              />
              {createBlogLoading && <div>Đang xử lý...</div>}
              <div className="image-upload-hint">
                Chọn ảnh đại diện cho bài viết (tùy chọn)
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal chỉnh sửa blog */}
        <Modal
          title="Chỉnh sửa bài đăng"
          open={isEditBlogModalVisible}
          onOk={handleEditBlog}
          onCancel={() => {
            setIsEditBlogModalVisible(false);
            editBlogForm.resetFields();
            // Clear file input
            const fileInput = document.getElementById("edit-blog-image-input");
            if (fileInput) {
              fileInput.value = "";
            }
          }}
          okText="Cập nhật"
          cancelText="Hủy"
          width={800}
        >
          <Form form={editBlogForm} layout="vertical">
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề!" },
                { min: 10, message: "Tiêu đề phải có ít nhất 10 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tiêu đề bài viết" />
            </Form.Item>

            <Form.Item
              name="content"
              label="Nội dung"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung!" },
                { min: 50, message: "Nội dung phải có ít nhất 50 ký tự!" },
              ]}
            >
              <Input.TextArea
                rows={8}
                placeholder="Nhập nội dung bài viết..."
              />
            </Form.Item>

            <Form.Item name="tags" label="Chủ đề">
              <Select
                mode="multiple"
                placeholder="Chọn chủ đề"
                options={tagOptions}
                allowClear
              />
            </Form.Item>

            <Form.Item label="Ảnh đại diện">
              <input
                id="edit-blog-image-input"
                type="file"
                accept="image/*"
                className="image-upload-input"
              />
              <div className="image-upload-hint">
                Chọn ảnh đại diện mới cho bài viết (tùy chọn)
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal chi tiết blog */}
        <Modal
          title={selectedBlog?.title || "Chi tiết bài viết"}
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedBlog && Object.keys(selectedBlog).length > 0 ? (
            <div>
              <div className="blog-detail-item">
                <b>ID:</b> {selectedBlog.id}
              </div>
              <div className="blog-detail-item">
                <b>Tiêu đề:</b> {selectedBlog.title}
              </div>
              <div className="blog-detail-item">
                <b>Tác giả:</b> {selectedBlog.author?.fullname}
              </div>
              <div className="blog-detail-item">
                <b>Ngày tạo:</b> {selectedBlog.createdAt}
              </div>
              <div className="blog-detail-item">
                <b>Ngày cập nhật:</b> {selectedBlog.updatedAt}
              </div>
              <div className="blog-detail-item">
                <b>Lượt xem:</b> {selectedBlog.viewCount} | <b>Lượt thích:</b>{" "}
                {selectedBlog.likeCount} | <b>Bình luận:</b>{" "}
                {commentCounts[selectedBlog.id] || 0}
              </div>
              <div className="blog-detail-item">
                <b>Trạng thái:</b> {renderStatus(selectedBlog.status)}
              </div>
              <div className="blog-detail-item">
                <b>Chủ đề:</b>{" "}
                {selectedBlog.tags && selectedBlog.tags.length
                  ? selectedBlog.tags.map((tag) => tag.name || tag).join(", ")
                  : "Không có"}
              </div>
              {selectedBlog.imgUrl ? (
                <div className="blog-detail-item">
                  <b>Ảnh blog:</b>
                  <br />
                  <img
                    src={selectedBlog.imgUrl}
                    alt="blog"
                    className="blog-image"
                  />
                </div>
              ) : null}
              <div className="blog-detail-item">
                <b>Nội dung:</b>
                <br />
                <div className="blog-content">{selectedBlog.content}</div>
              </div>
            </div>
          ) : (
            <div>Không có dữ liệu</div>
          )}
        </Modal>
      </div>
    );
  }

  if (selectedTab === "manage_tags") {
    return (
      <div>
        <Button
          type="primary"
          className="tag-create-button"
          onClick={() => {
            setEditingTag(null);
            tagForm.resetFields();
            setIsTagModalVisible(true);
          }}
        >
          Thêm chủ đề
        </Button>
        <Table
          dataSource={tags}
          rowKey="id"
          columns={tagColumns}
          pagination={false}
        />

        {/* Modal quản lý tag */}
        <Modal
          title={editingTag ? "Sửa chủ đề" : "Thêm chủ đề"}
          open={isTagModalVisible}
          onOk={async () => {
            try {
              const values = await tagForm.validateFields();

              if (editingTag) {
                console.log("✏️ Update tag ID:", editingTag.id);
                await updateTag(editingTag.id, values);

                const updatedTags = tags.map((tag) =>
                  tag.id === editingTag.id ? { ...tag, ...values } : tag
                );
                setTags(updatedTags);
                setTagOptions(
                  updatedTags.map((tag) => ({
                    label: tag.name,
                    value: tag.id,
                  }))
                );
              } else {
                console.log("➕ Create tag:", values);
                const response = await createTag(values);

                const newTag = response.data || { ...values, id: Date.now() };
                const updatedTags = [...tags, newTag];
                setTags(updatedTags);
                setTagOptions(
                  updatedTags.map((tag) => ({
                    label: tag.name,
                    value: tag.id,
                  }))
                );
              }

              setIsTagModalVisible(false);
              tagForm.resetFields();
              setEditingTag(null);

              await loadTags(true);

              toast.success(
                editingTag
                  ? "Cập nhật chủ đề thành công!"
                  : "Thêm chủ đề thành công!"
              );
            } catch (error) {
              toast.error(
                `${editingTag ? "Cập nhật" : "Tạo"} chủ đề thất bại: ${
                  error.response?.data?.message ||
                  error.message ||
                  "Lỗi không xác định"
                }`
              );
            }
          }}
          onCancel={() => setIsTagModalVisible(false)}
        >
          <Form
            form={tagForm}
            layout="vertical"
            initialValues={editingTag || {}}
          >
            <Form.Item
              name="name"
              label="Tên chủ đề"
              rules={[
                { required: true, message: "Vui lòng nhập tên chủ đề!" },
                { min: 2, message: "Tên chủ đề phải có ít nhất 2 ký tự!" },
                { max: 50, message: "Tên chủ đề không được quá 50 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập tên chủ đề..." />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ max: 200, message: "Mô tả không được quá 200 ký tự!" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Nhập mô tả cho chủ đề (tùy chọn)..."
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  return <div>Chọn tab để bắt đầu</div>;
};

export default WriteBlogs;
