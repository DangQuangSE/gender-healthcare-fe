import React from "react";
import { Modal, Form, Input, Select } from "antd";
import {
  LEGACY_BLOG_MODAL_LIMITS,
  LEGACY_BLOG_MODAL_MESSAGES,
} from "./BlogModal.constants";

const BlogModal = ({
  visible,
  onOk,
  onCancel,
  form,
  editingArticle,
  tagOptions = [],
}) => {
  return (
    <Modal
      title={
        editingArticle
          ? LEGACY_BLOG_MODAL_MESSAGES.editTitle
          : LEGACY_BLOG_MODAL_MESSAGES.createTitle
      }
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      width={LEGACY_BLOG_MODAL_LIMITS.WIDTH}
      okText={
        editingArticle
          ? LEGACY_BLOG_MODAL_MESSAGES.updateConfirm
          : LEGACY_BLOG_MODAL_MESSAGES.createConfirm
      }
      cancelText={LEGACY_BLOG_MODAL_MESSAGES.cancel}
      maskClosable={false}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label={LEGACY_BLOG_MODAL_MESSAGES.title}
          rules={[
            { required: true, message: LEGACY_BLOG_MODAL_MESSAGES.titleRequired },
            {
              min: LEGACY_BLOG_MODAL_LIMITS.TITLE_MIN_LENGTH,
              message: LEGACY_BLOG_MODAL_MESSAGES.titleMinLength,
            },
          ]}
        >
          <Input placeholder={LEGACY_BLOG_MODAL_MESSAGES.titlePlaceholder} />
        </Form.Item>
        <Form.Item
          name="content"
          label={LEGACY_BLOG_MODAL_MESSAGES.content}
          rules={[
            { required: true, message: LEGACY_BLOG_MODAL_MESSAGES.contentRequired },
            {
              min: LEGACY_BLOG_MODAL_LIMITS.CONTENT_MIN_LENGTH,
              message: LEGACY_BLOG_MODAL_MESSAGES.contentMinLength,
            },
          ]}
        >
          <Input.TextArea
            rows={LEGACY_BLOG_MODAL_LIMITS.CONTENT_ROWS}
            placeholder={LEGACY_BLOG_MODAL_MESSAGES.contentPlaceholder}
          />
        </Form.Item>
        <Form.Item name="tags" label={LEGACY_BLOG_MODAL_MESSAGES.topics}>
          <Select
            mode="multiple"
            placeholder={LEGACY_BLOG_MODAL_MESSAGES.topicsPlaceholder}
            options={tagOptions}
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BlogModal;
