import React from "react";
import { Button, Table } from "antd";
import BlogTagModal from "./BlogTagModal";
import { TAG_MANAGEMENT_MESSAGES } from "./BlogTagManagementView.constants";

const BlogTagManagementView = ({
  tags,
  columns,
  form,
  editingTag,
  open,
  onCreate,
  onOk,
  onCancel,
}) => (
  <div>
    <Button
      type="primary"
      className="tag-create-button"
      onClick={onCreate}
    >
      {TAG_MANAGEMENT_MESSAGES.ADD}
    </Button>
    <Table
      dataSource={tags}
      rowKey="id"
      columns={columns}
      pagination={false}
    />
    <BlogTagModal
      open={open}
      form={form}
      editingTag={editingTag}
      onOk={onOk}
      onCancel={onCancel}
    />
  </div>
);

export default BlogTagManagementView;
