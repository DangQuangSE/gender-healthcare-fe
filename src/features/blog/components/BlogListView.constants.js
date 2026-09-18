import BLOG_MESSAGES from "../constants/blogMessages";

export const LIST_MESSAGES = BLOG_MESSAGES.LIST;
export const STATUS_MESSAGES = BLOG_MESSAGES.STATUS_LABELS;

export const STATUS_OPTIONS = Object.freeze([
  { value: "ALL", label: LIST_MESSAGES.ALL_STATUSES },
  { value: "PENDING", label: STATUS_MESSAGES.PENDING },
  { value: "PUBLISHED", label: STATUS_MESSAGES.PUBLISHED },
  { value: "REJECTED", label: STATUS_MESSAGES.REJECTED },
]);

export const BLOG_PAGE_SIZE = 10;
export const BLOG_PAGE_SIZE_OPTIONS = Object.freeze(["5", "10", "20", "50"]);
