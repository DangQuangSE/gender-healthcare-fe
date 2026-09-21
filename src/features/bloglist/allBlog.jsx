"use client";

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Select, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "./allBlog.css";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { unwrapApiResponse } from "../../shared/api/response";
import { fetchBlogs as fetchAllBlogs } from "../blog/api/blogApi";
import {
  fetchBlogsByMultipleTags,
  fetchBlogsByTag,
  fetchTags,
} from "../blog/api/tagApi";

const { Search } = Input;

const getResponseData = (response) => unwrapApiResponse(response?.data);

const getBlogsFromResponse = (response) => {
  const data = getResponseData(response);
  return data?.content || (Array.isArray(data) ? data : []);
};

const AllBlog = () => {
  const [loading, setLoading] = useState(true);
  const [allBlogs, setAllBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [serviceArticles, setServiceArticles] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Lấy tất cả tag
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await fetchTags();
        const data = getResponseData(response);
        setTags(Array.isArray(data) ? data : []);
      } catch {
        setTags([]);
      }
    };

    loadTags();
  }, []);

  // Lấy blog theo tag hoặc tất cả
  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      try {
        let blogs = [];
        if (selectedTags.length === 0) {
          // Không có tag nào được chọn - lấy tất cả blog
          const response = await fetchAllBlogs(0, 50);
          blogs = getBlogsFromResponse(response).filter(
            (blog) => blog.status === "PUBLISHED"
          );
        } else {
          // Có tag được chọn - tìm theo multiple tags
          try {
            const response = await fetchBlogsByMultipleTags(
              selectedTags,
              0,
              50
            );
            const data = response.data;
            blogs = (data?.content || data || []).filter(
              (blog) => blog.status === "PUBLISHED"
            );
    } catch {
            // Fallback: nếu API multiple tags không hoạt động, dùng API single tag cho tag đầu tiên
            if (selectedTags.length > 0) {
              const response = await fetchBlogsByTag(selectedTags[0], 0, 50);
              blogs = getBlogsFromResponse(response).filter(
                (blog) => blog.status === "PUBLISHED"
              );
            }
          }
        }
        setAllBlogs(blogs);
        setFilteredBlogs(blogs); // Initialize filtered blogs

        // Lọc các blog có tag "tin dịch vụ" (id = 2)
        const serviceBlogs = blogs.filter(
          (blog) =>
            blog.tags &&
            blog.tags.some((tag) => tag.id === 2 || tag.name === "tin dịch vụ")
        );
        setServiceArticles(serviceBlogs);
      } catch {
        setAllBlogs([]);
        setFilteredBlogs([]);
        setServiceArticles([]);
      }
      setLoading(false);
    };
    loadBlogs();
  }, [selectedTags]);

  // Filter blogs by search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredBlogs(allBlogs);
    } else {
      const filtered = allBlogs.filter(
        (blog) =>
          blog.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          blog.content?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
  }, [searchText, allBlogs]);

  // Xử lý chọn multiple tags
  const handleTagsChange = (tagIds) => {
    setSelectedTags(tagIds || []);
  };

  if (loading) {
    return (
      <div className="medpro-all-blog-wrapper">
        <header className="medpro-all-blog-header">
          <div className="medpro-all-blog-container">
            <div className="medpro-all-blog-header-content">
              <Link to="/blog" className="medpro-all-blog-logo">
                <span className="medpro-all-blog-logo-text">
                  TIN TỨC Y KHOA
                </span>
              </Link>
            </div>
          </div>
        </header>
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "18px", marginBottom: "10px" }}>
            Đang tải dữ liệu blog...
          </div>
          <div style={{ color: "#666" }}>Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    );
  }

  return (
    <div className="medpro-all-blog-wrapper">
      {/* <header className="medpro-all-blog-header">
        <div className="medpro-all-blog-container">
          <div className="medpro-all-blog-header-content">
            <Link to="/blog" className="medpro-all-blog-logo">
              <span className="medpro-all-blog-logo-text">TIN TỨC Y KHOA</span>
            </Link>
          </div>
        </div>
      </header> */}

      {/* Search and Filter section */}

      <Breadcrumb
        items={[
          { label: "Trang chủ", to: "/" },
          { label: "Tin tức", to: "/blog" },
        ]}
      />

      <main className="medpro-all-blog-main">
        <div className="medpro-all-blog-container">
          {/* All Blogs Section */}
          <section className="medpro-all-blog-all-section">
            <div
              className="medpro-all-blog-section-header"
              style={{ marginTop: 8 }}
            >
              <h2 className="medpro-all-blog-section-title">Blog Sức Khỏe</h2>

              <p className="medpro-all-blog-section-description">
                Khám phá kiến thức mới nhất về sức khỏe giới tính và chủ đề liên
                quan từ các chuyên gia hàng đầu
              </p>
              <div
                className="medpro-all-blog-container"
                style={{ marginTop: 32, marginBottom: 24 }}
              >
                {/* Search Bar */}
                <div className="search-filter-container">
                  <div className="blog-search-container">
                    <Search
                      placeholder="Tìm kiếm bài viết theo tiêu đề hoặc nội dung..."
                      allowClear
                      enterButton="Tìm kiếm"
                      size="large"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onSearch={(value) => setSearchText(value)}
                    />
                  </div>

                  <div className="blog-tag-filter-group">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="Lọc theo chủ đề"
                      value={selectedTags}
                      onChange={handleTagsChange}
                      options={tags.map((tag) => ({
                        label: tag.name,
                        value: tag.id,
                      }))}
                      maxTagCount="responsive"
                    />
                  </div>
                </div>
              </div>

              {searchText && (
                <div
                  style={{ marginTop: "16px", color: "#666", fontSize: "14px" }}
                >
                  {filteredBlogs.length > 0
                    ? `Tìm thấy ${filteredBlogs.length} bài viết cho "${searchText}"`
                    : `Không tìm thấy bài viết nào cho "${searchText}"`}
                </div>
              )}
            </div>
            {filteredBlogs.length > 0 ? (
              <div className="medpro-all-blog-service-grid">
                {filteredBlogs.map((blog) => (
                  <div className="service-blog-card" key={blog.id}>
                    <img
                      src={
                        blog.imgUrl ||
                        "https://via.placeholder.com/400x250?text=Blog+Image"
                      }
                      alt={blog.title}
                      className="service-blog-image"
                    />
                    <div className="service-blog-content">
                      <h3 className="service-blog-title">{blog.title}</h3>
                      <span className="service-blog-tag">
                        #{blog.tags?.[0]?.name || "Tin tức"}
                      </span>

                      <p className="service-blog-desc">
                        {blog.content?.substring(0, 150) + "..." ||
                          "Nội dung bài viết..."}
                      </p>
                      <div className="service-blog-meta">
                        <span>
                          {blog.createdAt
                            ? new Date(blog.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : ""}{" "}
                          - {blog.author?.fullname || "Tác giả ẩn danh"}
                        </span>
                      </div>
                      <Link
                        to={`/blog/${blog.id}`}
                        className="service-blog-link"
                      >
                        Xem tiếp <span>&rarr;</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="medpro-all-blog-no-content">
                <h3> Chưa có bài viết nào</h3>
                <p>Hiện tại chưa có bài viết nào được đăng tải.</p>
              </div>
            )}
          </section>
          {/* Service Blogs Section */}
          <section className="medpro-all-blog-service-section">
            <div className="medpro-all-blog-service-grid">
              {serviceArticles.slice(0, 3).map((blog) => (
                <div className="service-blog-card" key={blog.id}>
                  <img
                    src={blog.imgUrl}
                    alt={blog.title}
                    className="service-blog-image"
                  />
                  <div className="service-blog-content">
                    <span className="service-blog-tag">• Tin dịch vụ</span>
                    <h3 className="service-blog-title">{blog.title}</h3>
                    <p className="service-blog-desc">
                      {blog.content?.substring(0, 150) + "..." ||
                        "Nội dung bài viết..."}
                    </p>
                    <div className="service-blog-meta">
                      <span>
                        {blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString("vi-VN")
                          : ""}{" "}
                        - {blog.author?.fullname || "Tác giả ẩn danh"}
                      </span>
                    </div>
                    <Link to={`/blog/${blog.id}`} className="service-blog-link">
                      Xem tiếp <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AllBlog;
