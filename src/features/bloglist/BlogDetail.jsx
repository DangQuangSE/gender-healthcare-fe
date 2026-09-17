import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import RelatedArticlesSection from "./RelatedArticlesSection";
import CommentSection from "../../components/CommentSection/CommentSection";
import { likeBlog, viewBlogAndIncreaseCount } from "../../api/consultantAPI";
import { fetchBlogSummary } from "../../api/commentAPI";
import storage from "../../shared/storage/storage";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import {
  EyeIcon,
  HeartIcon,
  CommentIcon,
} from "../../components/Icons/BlogIcons";
import "./BlogDetail.css";

const BlogDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [commentCount, setCommentCount] = useState(0);

  // Load comment count for this blog
  const loadCommentCount = async () => {
    try {
      const response = await fetchBlogSummary();
      const commentData = response.data || [];

      // Find comment count for current blog
      const currentBlog = commentData.find(
        (blog) => blog.blog_id === parseInt(id)
      );
      setCommentCount(currentBlog?.commentCount || 0);
    } catch (error) {
      console.error("Error loading comment count:", error);
      setCommentCount(0);
    }
  };

  // Handle comment count update when new comment is added
  const handleCommentCountUpdate = () => {
    setCommentCount((prev) => prev + 1);
  };

  // Handle comment count update when comment is deleted
  const handleCommentDeleted = () => {
    setCommentCount((prev) => Math.max(0, prev - 1));
  };

  useEffect(() => {
    const loadBlogDetail = async () => {
      try {
        setLoading(true);
        console.log(` Loading blog detail for ID: ${id}`);

        // Call API to view blog and auto-increment view count
        const response = await viewBlogAndIncreaseCount(id);
        const blogData = response.data;

        console.log(" Blog detail loaded:", blogData);

        // Transform blog data
        const transformedArticle = {
          id: blogData.id,
          title: blogData.title,
          content: blogData.content,
          image:
            blogData.imgUrl ||
            "https://via.placeholder.com/800x400?text=No+Image",
          author: {
            name: blogData.author?.fullname || "Tác giả ẩn danh",
            avatar: blogData.author?.imageUrl || "/placeholder.svg",
          },
          date: blogData.createdAt
            ? new Date(blogData.createdAt).toLocaleDateString("vi-VN")
            : "Không có ngày",
          viewCount: blogData.viewCount || 0,
          likeCount: blogData.likeCount || 0,
          category: blogData.tags?.[0]?.name || "general",
        };

        setArticle(transformedArticle);

        // Use the last loaded list only as a fallback for related articles.
        const sampleArticles =
          storage.getJson(STORAGE_KEYS.ALL_ARTICLES, []) || [];
        const related = sampleArticles.filter(
          (item) => item.id.toString() !== id
        );
        setRelatedArticles(related);
      } catch (error) {
        console.error(" Error loading blog detail:", error);

        // Fallback to the last loaded list when the detail request fails.
        const sampleArticles =
          storage.getJson(STORAGE_KEYS.ALL_ARTICLES, []) || [];
        const fallbackArticle = sampleArticles.find(
          (item) => item.id.toString() === id
        );
        setArticle(fallbackArticle || null);

        const related = sampleArticles.filter(
          (item) => item.id.toString() !== id
        );
        setRelatedArticles(related);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBlogDetail();
      loadCommentCount();
    }
  }, [id]);

  // Handle like blog
  const handleLikeBlog = async () => {
    if (liking || !article) return;

    try {
      setLiking(true);
      await likeBlog(article.id);

      // Update local state
      setArticle((prev) => ({
        ...prev,
        likeCount: (prev.likeCount || 0) + 1,
      }));

      console.log(` Liked blog ${article.id}`);
    } catch (error) {
      alert(error.message || "Không thể thích bài viết. Vui lòng thử lại sau.");
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-detail-page-wrapper">
        <div className="slogan-section">
          {/* <h1 className="slogan-title">
            CHĂM SÓC SỨC KHỎE GIỚI TÍNH SHEALTHCARE
          </h1>
          <p className="slogan-text">
            "Vì sức khỏe của bạn là ưu tiên hàng đầu của chúng tôi"
          </p> */}
        </div>
        <div className="blog-detail-container">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-500 mb-4">
              Đang tải bài viết...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="blog-detail-page-wrapper">
        <div className="top-header-container">
          <div className="breadcrumbs"></div>
        </div>
        <div className="slogan-section">
          <h1 className="slogan-title">
            TRUNG TÂM NỘI SOI TIÊU HÓA DOCTOR CHECK
          </h1>
          <p className="slogan-text">
            "Vì một Việt Nam nói không với ung thư dạ dày & đại tràng"
          </p>
        </div>
        <div className="blog-detail-container">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-500 mb-4">
              Bài viết không tồn tại.
            </h2>
            <Link to="/blog" className="back-button">
              Quay lại danh sách bài viết
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-page-wrapper">
      <div className="slogan-section">
        {/* <h1 className="slogan-title">
          CHĂM SÓC SỨC KHỎE GIỚI TÍNH SHEALTHCARE
        </h1>
        <p className="slogan-text">
          "Vì sức khỏe của bạn là ưu tiên hàng đầu của chúng tôi"
        </p> */}
      </div>
      <div className="blog-detail-container">
        <article>
          <header className="blog-header">
            <img
              src={article.image}
              alt={article.title}
              className="blog-image"
            />
            <h1 className="blog-title">{article.title}</h1>
            <div className="blog-meta">
              {article.author.avatar && (
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="author-avatar"
                />
              )}
              <span className="font-medium">{article.author.name}</span>
              <span className="mx-2">•</span>
              <span>{article.date}</span>
            </div>

            {/* Blog Stats */}
            <div className="blog-stats">
              <div className="stat-item">
                <EyeIcon size={18} color="#666" />
                <span className="stat-count">
                  {article.viewCount || 0} lượt xem
                </span>
              </div>
              <button
                className={`stat-item like-button ${liking ? "liking" : ""}`}
                onClick={handleLikeBlog}
                disabled={liking}
              >
                <HeartIcon size={18} color="#ff4757" />
                <span className="stat-count">
                  {article.likeCount || 0} lượt thích
                </span>
              </button>
              <div className="stat-item">
                <CommentIcon size={18} color="#666" />
                <span className="stat-count">{commentCount} bình luận</span>
              </div>
            </div>
          </header>

          <div className="blog-content">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </article>

        {/* Comment Section */}
        <CommentSection
          blogId={article.id}
          onCommentAdded={handleCommentCountUpdate}
          onCommentDeleted={handleCommentDeleted}
        />
      </div>
      <RelatedArticlesSection articles={relatedArticles} />
    </div>
  );
};

export default BlogDetail;
