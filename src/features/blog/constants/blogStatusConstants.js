import BLOG_MESSAGES from "./blogMessages";

export const BLOG_STATUS_CONFIG = Object.freeze({
  DRAFT: { color: "#8c8c8c", text: BLOG_MESSAGES.STATUS_LABELS.DRAFT },
  PENDING: { color: "#faad14", text: BLOG_MESSAGES.STATUS_LABELS.PENDING },
  APPROVED: { color: "#52c41a", text: BLOG_MESSAGES.STATUS_LABELS.APPROVED },
  PUBLISHED: { color: "#1890ff", text: BLOG_MESSAGES.STATUS_LABELS.PUBLISHED },
  REJECTED: { color: "#ff4d4f", text: BLOG_MESSAGES.STATUS_LABELS.REJECTED },
  ARCHIVED: { color: "#722ed1", text: BLOG_MESSAGES.STATUS_LABELS.ARCHIVED },
});

export const DEFAULT_BLOG_STATUS_CONFIG = Object.freeze({
  color: "#8c8c8c",
});
