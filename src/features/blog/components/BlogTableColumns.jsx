import React from "react";
import { Button, Popconfirm, Space, Tag } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  CommentIcon,
  EyeIcon,
  HeartIcon,
} from "../../../components/Icons/BlogIcons";

import { FORM_CANCEL, TABLE_MESSAGES } from "./BlogTableColumns.constants";

export const createBlogColumns = ({
  commentCounts = {},
  renderStatus,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onPublish,
  canModerate = false,
}) => [
  {
    title: TABLE_MESSAGES.TITLE,
    dataIndex: "title",
    key: "title",
    width: "20%",
    render: (title) => (
      <div>
        <div className="blog-title-cell">
          {title || TABLE_MESSAGES.TITLE_FALLBACK}
        </div>
      </div>
    ),
  },
  {
    title: TABLE_MESSAGES.CREATED_AT,
    dataIndex: "createdAt",
    key: "createdAt",
    width: "12%",
    sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    defaultSortOrder: "descend",
    render: (createdAt) => (
      <div className="blog-date-cell">
        {createdAt || TABLE_MESSAGES.EMPTY_VALUE}
      </div>
    ),
  },
  {
    title: TABLE_MESSAGES.STATUS,
    dataIndex: "status",
    key: "status",
    width: "12%",
    render: (status) => renderStatus(status),
  },
  {
    title: TABLE_MESSAGES.STATISTICS,
    key: "stats",
    width: "12%",
    sorter: (a, b) => (a.viewCount || 0) - (b.viewCount || 0),
    render: (_, record) => (
      <div>
        <div className="blog-stats-cell">
          <EyeIcon size={14} color="#666" /> {record.viewCount || 0}{" "}
          {TABLE_MESSAGES.VIEWS}
        </div>
        <div className="blog-stats-likes">
          <HeartIcon size={14} color="#ff4757" /> {record.likeCount || 0}{" "}
          {TABLE_MESSAGES.LIKES}
        </div>
        <div className="blog-stats-comments">
          <CommentIcon size={14} color="#666" /> {" "}
          {commentCounts[record.id] || 0} {TABLE_MESSAGES.COMMENTS}
        </div>
      </div>
    ),
  },
  {
    title: TABLE_MESSAGES.TOPICS,
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
          <span className="blog-tag-empty">{TABLE_MESSAGES.EMPTY_VALUE}</span>
        )}
        {tags && tags.length > 1 && (
          <div className="blog-tag-count">+{tags.length - 1}</div>
        )}
      </div>
    ),
  },
  {
    title: TABLE_MESSAGES.ACTIONS,
    key: "action",
    width: "13%",
    render: (_, record) => {
      const actions = [
        <Button
          key="detail"
          onClick={() => onView(record.id)}
          size="small"
          type="default"
          block
        >
          {TABLE_MESSAGES.VIEW_DETAIL}
        </Button>,
      ];

      if (canModerate && record.status === "PENDING") {
        actions.push(
          <Popconfirm
            key="approve"
            title={TABLE_MESSAGES.APPROVE_CONFIRM}
            onConfirm={() => onApprove(record.id)}
            okText={TABLE_MESSAGES.CONFIRM}
            cancelText={TABLE_MESSAGES.CANCEL}
          >
            <Button
              icon={<CheckOutlined />}
              size="small"
              type="primary"
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              block
            >
              {TABLE_MESSAGES.APPROVE}
            </Button>
          </Popconfirm>
        );

        actions.push(
          <Popconfirm
            key="reject"
            title={TABLE_MESSAGES.REJECT_CONFIRM}
            onConfirm={() => onReject(record.id)}
            okText={TABLE_MESSAGES.CONFIRM}
            cancelText={TABLE_MESSAGES.CANCEL}
          >
            <Button icon={<CloseOutlined />} size="small" danger block>
              {TABLE_MESSAGES.REJECT}
            </Button>
          </Popconfirm>
        );
      }

      if (canModerate && record.status === "APPROVED") {
        actions.push(
          <Popconfirm
            key="publish"
            title={TABLE_MESSAGES.PUBLISH_CONFIRM}
            onConfirm={() => onPublish(record.id)}
            okText={TABLE_MESSAGES.CONFIRM}
            cancelText={TABLE_MESSAGES.CANCEL}
          >
            <Button icon={<SendOutlined />} size="small" type="primary" block>
              {TABLE_MESSAGES.PUBLISH}
            </Button>
          </Popconfirm>
        );
      }

      actions.push(
        <Button
          key="edit"
          icon={<EditOutlined />}
          size="small"
          onClick={() => onEdit(record)}
          block
        >
          {TABLE_MESSAGES.EDIT}
        </Button>
      );

      actions.push(
        <Popconfirm
          key="delete"
          title={TABLE_MESSAGES.DELETE_TITLE}
          description={TABLE_MESSAGES.DELETE_DESCRIPTION(record.title)}
          onConfirm={() => onDelete(record.id)}
          okText={TABLE_MESSAGES.DELETE}
          cancelText={FORM_CANCEL}
          okButtonProps={{ danger: true }}
        >
          <Button size="small" danger icon={<DeleteOutlined />} block>
            {TABLE_MESSAGES.DELETE}
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

export const createTagColumns = ({ onEdit, onDelete }) => [
  {
    title: TABLE_MESSAGES.TAG_NAME,
    dataIndex: "name",
    key: "name",
  },
  {
    title: TABLE_MESSAGES.ACTIONS,
    key: "action",
    render: (_, record) => (
      <Space>
        <Button onClick={() => onEdit(record)}>{TABLE_MESSAGES.EDIT}</Button>
        <Popconfirm
          title={TABLE_MESSAGES.DELETE_TAG_CONFIRM}
          description={TABLE_MESSAGES.DELETE_TAG_DESCRIPTION}
          onConfirm={() => onDelete(record.id)}
          okText={TABLE_MESSAGES.DELETE}
          cancelText={FORM_CANCEL}
          okType="danger"
        >
          <Button size="small" danger icon={<DeleteOutlined />}>
            {TABLE_MESSAGES.DELETE}
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];
