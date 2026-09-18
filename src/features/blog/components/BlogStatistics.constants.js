import BLOG_MESSAGES from "../constants/blogMessages";

export const STATISTICS = Object.freeze([
  {
    key: "total",
    label: BLOG_MESSAGES.STATISTICS.TOTAL,
    className: "total",
  },
  {
    key: "published",
    label: BLOG_MESSAGES.STATISTICS.PUBLISHED,
    className: "published",
  },
  {
    key: "rejected",
    label: BLOG_MESSAGES.STATISTICS.REJECTED,
    className: "draft",
  },
  {
    key: "views",
    label: BLOG_MESSAGES.STATISTICS.VIEWS,
    className: "views",
  },
  {
    key: "likes",
    label: BLOG_MESSAGES.STATISTICS.LIKES,
    className: "likes",
  },
  {
    key: "comments",
    label: BLOG_MESSAGES.STATISTICS.COMMENTS,
    className: "comments",
  },
]);
