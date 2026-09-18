import React from "react";
import { Button, Select, Table } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import BlogDetailModal from "./BlogDetailModal";
import BlogEditorModal from "./BlogEditorModal";
import BlogStatistics from "./BlogStatistics";
import {
  BLOG_PAGE_SIZE,
  BLOG_PAGE_SIZE_OPTIONS,
  LIST_MESSAGES,
  STATUS_OPTIONS,
} from "./BlogListView.constants";

const BlogListView = ({
  blogs,
  commentCounts,
  loading,
  columns,
  selectedStatus,
  onStatusChange,
  selectedTags,
  onTagsChange,
  tagOptions,
  onRefresh,
  onCreate,
  createModal,
  editModal,
  detailModal,
  renderStatus,
  includeStatus = false,
  showDetailId = false,
}) => {
  const values = {
    total: blogs.length,
    published: blogs.filter((blog) => blog.status === "PUBLISHED").length,
    rejected: blogs.filter((blog) => blog.status === "REJECTED").length,
    views: blogs.reduce((sum, blog) => sum + (blog.viewCount || 0), 0),
    likes: blogs.reduce((sum, blog) => sum + (blog.likeCount || 0), 0),
    comments: blogs.reduce(
      (sum, blog) => sum + (commentCounts[blog.id] || 0),
      0
    ),
  };

  return (
    <div>
      <BlogStatistics values={values} />

      <div className="filter-actions">
        <div style={{ display: "flex", gap: "16px" }}>
          <Select
            placeholder={LIST_MESSAGES.STATUS_FILTER_PLACEHOLDER}
            className="filter-select"
            value={selectedStatus}
            onChange={onStatusChange}
            options={STATUS_OPTIONS}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder={LIST_MESSAGES.TOPIC_FILTER_PLACEHOLDER}
            className="filter-select"
            options={tagOptions}
            value={selectedTags}
            onChange={onTagsChange}
            style={{ minWidth: 200 }}
            maxTagCount="responsive"
          />
        </div>

        {onRefresh && (
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            style={{ marginRight: 8 }}
          >
            {LIST_MESSAGES.REFRESH}
          </Button>
        )}
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          {LIST_MESSAGES.CREATE_BLOG}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={blogs}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: BLOG_PAGE_SIZE,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            LIST_MESSAGES.PAGINATION_TOTAL(range[0], range[1], total),
          pageSizeOptions: BLOG_PAGE_SIZE_OPTIONS,
        }}
        size="middle"
      />

      <BlogEditorModal
        mode="create"
        open={createModal.open}
        form={createModal.form}
        onOk={createModal.onOk}
        onCancel={createModal.onCancel}
        tagOptions={tagOptions}
        confirmLoading={createModal.loading}
        imageInputId="blog-image-input"
        onImageChange={createModal.onImageChange}
      />
      <BlogEditorModal
        mode="edit"
        open={editModal.open}
        form={editModal.form}
        onOk={editModal.onOk}
        onCancel={editModal.onCancel}
        tagOptions={tagOptions}
        includeStatus={includeStatus}
        imageInputId="edit-blog-image-input"
      />
      <BlogDetailModal
        open={detailModal.open}
        blog={detailModal.blog}
        commentCount={commentCounts[detailModal.blog?.id] || 0}
        renderStatus={renderStatus}
        onCancel={detailModal.onCancel}
        showId={showDetailId}
      />
    </div>
  );
};

export default BlogListView;
