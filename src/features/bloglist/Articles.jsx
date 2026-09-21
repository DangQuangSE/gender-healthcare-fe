import React, { useState, useEffect } from "react";
import "./Articles.css";
import { Link } from "react-router-dom";
import { likeBlog, fetchBlogs } from "../blog/api/blogApi";
import { fetchBlogSummary } from "../blog/api/commentApi";
import {
  EyeIcon,
  HeartIcon,
  CommentIcon,
} from "../../components/Icons/BlogIcons";
import { unwrapApiResponse } from "../../shared/api/response";
import storage from "../../shared/storage/storage";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import CONTENT_MESSAGES from "../../shared/constants/contentMessages";

const getBlogsFromResponse = (response) => {
  const data = unwrapApiResponse(response?.data);
  return data?.content || (Array.isArray(data) ? data : []);
};

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [likingBlogs, setLikingBlogs] = useState(new Set());
  const [commentCounts, setCommentCounts] = useState({});
  const articlesPerPage = 4;

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
    } catch {
      setCommentCounts({});
    }
  };

  // Handle like blog
  const handleLikeBlog = async (e, blogId) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (likingBlogs.has(blogId)) return; // Prevent double clicking

    try {
      setLikingBlogs((prev) => new Set([...prev, blogId]));

      await likeBlog(blogId);

      // Update local state optimistically
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === blogId
            ? { ...article, likeCount: (article.likeCount || 0) + 1 }
            : article
        )
      );

      // Reload all articles to get updated data from server
      setTimeout(async () => {
        try {
          // Reload the articles data from API
          const response = await fetchBlogs(0, 20);

          const blogs = getBlogsFromResponse(response);

          // Sort and transform like before
          const topBlogs = blogs
            .filter((blog) => blog.status === "PUBLISHED")
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, 5);

          const transformedArticles = topBlogs.map((blog, index) => ({
              id: blog.id,
              title: blog.title,
              excerpt: blog.content
                ? blog.content.substring(0, 150) + "..."
                : "Không có nội dung",
              image:
                blog.imgUrl ||
                "https://via.placeholder.com/400x300?text=No+Image",
              category: blog.tags?.[0]?.name || "general",
              author: {
                name: blog.author?.fullname || "Tác giả ẩn danh",
                avatar: blog.author?.imageUrl || "/placeholder.svg",
              },
              date: blog.createdAt
                ? new Date(blog.createdAt).toLocaleDateString("vi-VN")
                : "Không có ngày",
              viewCount: blog.viewCount || 0,
              likeCount: blog.likeCount || 0,
              featured: index === 0,
            }));

          setArticles(transformedArticles);
        } catch (reloadError) {
          console.error(`Error reloading articles:`, reloadError);
        }
      }, 2000);
    } catch (error) {
      // Show user-friendly error message
      alert(error.message || CONTENT_MESSAGES.BLOG_LIKE_FAILED);
      // Revert optimistic update on error
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === blogId
            ? {
                ...article,
                likeCount: Math.max(0, (article.likeCount || 0) - 1),
              }
            : article
        )
      );
    } finally {
      setLikingBlogs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(blogId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const loadTopBlogs = async () => {
      try {
        setLoading(true);
        // Lấy nhiều blogs để có thể sort theo viewCount
        // Gọi API trực tiếp không qua api instance để tránh CORS
        const response = await fetchBlogs(0, 20);

        const blogs = getBlogsFromResponse(response);

        // Sort theo viewCount giảm dần và lấy top 5
        const topBlogs = blogs
          .filter((blog) => blog.status === "PUBLISHED") // Chỉ lấy blog đã publish
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 5);

        // Transform data để phù hợp với UI
        const transformedArticles = topBlogs.map((blog, index) => ({
          id: blog.id,
          title: blog.title,
          excerpt: blog.content
            ? blog.content.substring(0, 150) + "..."
            : "Không có nội dung",
          image:
            blog.imgUrl || "https://via.placeholder.com/400x300?text=No+Image",
          category: blog.tags?.[0]?.name || "general",
          author: {
            name: blog.author?.fullname || "Tác giả ẩn danh",
            avatar: blog.author?.imageUrl || "/placeholder.svg",
          },
          date: blog.createdAt
            ? new Date(blog.createdAt).toLocaleDateString("vi-VN")
            : "Không có ngày",
          viewCount: blog.viewCount || 0,
          likeCount: blog.likeCount || 0,
          featured: index === 0, // Blog có lượt xem cao nhất làm featured
        }));

        setArticles(transformedArticles);

        // Lưu vào localStorage để dùng ở BlogDetail
        storage.setJson(
          STORAGE_KEYS.ALL_ARTICLES,
          transformedArticles
        );
      } catch {
        // Fallback to empty array if API fails
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopBlogs();
    loadCommentCounts();
  }, []);

  const featuredArticle = articles.find((article) => article.featured);
  const sidebarArticles = featuredArticle
    ? articles.filter((a) => a.id !== featuredArticle.id)
    : articles;

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentSidebarArticles = sidebarArticles.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );

  const totalPages = Math.ceil(sidebarArticles.length / articlesPerPage);

  if (loading) {
    return (
      <section className="articles section">
        <div className="container">
          <div
            className="loading-container"
            style={{ textAlign: "center", padding: "50px" }}
          >
            <div> Đang tải top 5 bài viết có lượt xem cao nhất...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="articles section">
      <div className="container">
        <div className="blog-layout">
          {/* Featured Article */}
          {featuredArticle && (
            <Link
              to={`/blog/${featuredArticle.id}`}
              className="featured-article"
            >
              <div className="featured-image">
                <img src={featuredArticle.image} alt={featuredArticle.title} />
              </div>
              <div className="featured-content">
                <h2>{featuredArticle.title}</h2>
                <p>{featuredArticle.excerpt}</p>
                <div className="article-meta">
                  <div className="article-author">
                    <img
                      src={featuredArticle.author.avatar}
                      alt={featuredArticle.author.name}
                    />
                    <span>{featuredArticle.author.name}</span>
                  </div>
                  <div className="article-date">{featuredArticle.date}</div>
                </div>

                {/* Article Stats */}
                <div className="article-stats">
                  <div className="stat-item">
                    <EyeIcon size={16} color="#666" />
                    <span className="stat-count">
                      {featuredArticle.viewCount || 0}
                    </span>
                  </div>
                  <button
                    className={`stat-item like-button ${
                      likingBlogs.has(featuredArticle.id) ? "liking" : ""
                    }`}
                    onClick={(e) => handleLikeBlog(e, featuredArticle.id)}
                    disabled={likingBlogs.has(featuredArticle.id)}
                  >
                    <HeartIcon size={16} color="#ff4757" />
                    <span className="stat-count">
                      {featuredArticle.likeCount || 0}
                    </span>
                  </button>
                  <div className="stat-item">
                    <CommentIcon size={16} color="#666" />
                    <span className="stat-count">
                      {commentCounts[featuredArticle.id] || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Sidebar Articles */}
          <div className="sidebar-articles">
            {currentSidebarArticles.map((article) => (
              <Link
                to={`/blog/${article.id}`}
                key={article.id}
                className="sidebar-article"
              >
                <div className="sidebar-article-image">
                  <img src={article.image} alt={article.title} />
                </div>
                <div className="sidebar-article-content">
                  <h3>{article.title}</h3>
                  <div className="article-meta">
                    <div className="article-author">
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                      />
                      <span>{article.author.name}</span>
                    </div>
                    <div className="article-date">{article.date}</div>
                  </div>

                  {/* Sidebar Article Stats */}
                  <div className="sidebar-article-stats">
                    <div className="stat-item">
                      <EyeIcon size={14} color="#666" />
                      <span className="stat-count">
                        {article.viewCount || 0}
                      </span>
                    </div>
                    <button
                      className={`stat-item like-button ${
                        likingBlogs.has(article.id) ? "liking" : ""
                      }`}
                      onClick={(e) => handleLikeBlog(e, article.id)}
                      disabled={likingBlogs.has(article.id)}
                    >
                      <HeartIcon size={14} color="#ff4757" />
                      <span className="stat-count">
                        {article.likeCount || 0}
                      </span>
                    </button>
                    <div className="stat-item">
                      <CommentIcon size={14} color="#666" />
                      <span className="stat-count">
                        {commentCounts[article.id] || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="sidebar-pagination">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`pagination-dot ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(index + 1)}
                  ></button>
                ))}
              </div>
            )}

            <div className="see-all-button-blog">
              <Link to="/blog" className="view-all-link-blog">
                Xem tất cả bài viết
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Articles;
