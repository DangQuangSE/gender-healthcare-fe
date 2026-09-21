import React from "react";
import { Form, Input, Modal } from "antd";
import { TAG_MESSAGES } from "./BlogTagModal.constants";

const BlogTagModal = ({
  open,
  form,
  editingTag,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title={editingTag ? TAG_MESSAGES.EDIT : TAG_MESSAGES.ADD}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={TAG_MESSAGES.NAME}
          rules={[
            { required: true, message: TAG_MESSAGES.NAME_REQUIRED },
            { min: 2, message: TAG_MESSAGES.NAME_MIN_LENGTH },
            { max: 50, message: TAG_MESSAGES.NAME_MAX_LENGTH },
          ]}
        >
          <Input placeholder={TAG_MESSAGES.NAME_PLACEHOLDER} />
        </Form.Item>

        <Form.Item
          name="description"
          label={TAG_MESSAGES.DESCRIPTION}
          rules={[{ max: 200, message: TAG_MESSAGES.DESCRIPTION_MAX_LENGTH }]}
        >
          <Input.TextArea
            rows={3}
            placeholder={TAG_MESSAGES.DESCRIPTION_PLACEHOLDER}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BlogTagModal;
