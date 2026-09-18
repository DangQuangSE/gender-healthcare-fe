import React from "react";
import { Form, Input, Modal, Select } from "antd";
import {
  EDITOR_MESSAGES,
  EDIT_STATUS_OPTIONS,
  STATUS_LABELS,
} from "./BlogEditorModal.constants";

const BlogEditorModal = ({
  mode,
  open,
  form,
  onOk,
  onCancel,
  tagOptions = [],
  confirmLoading = false,
  includeStatus = false,
  imageInputId,
  onImageChange,
}) => {
  const isCreate = mode === "create";

  return (
    <Modal
      title={isCreate ? EDITOR_MESSAGES.CREATE_TITLE : EDITOR_MESSAGES.EDIT_TITLE}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText={isCreate ? EDITOR_MESSAGES.CREATE_CONFIRM : EDITOR_MESSAGES.UPDATE_CONFIRM}
      cancelText={EDITOR_MESSAGES.CANCEL}
      width={800}
      confirmLoading={confirmLoading}
      maskClosable={isCreate ? !confirmLoading : true}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label={EDITOR_MESSAGES.TITLE}
          rules={[
            { required: true, message: EDITOR_MESSAGES.TITLE_REQUIRED },
            { min: 10, message: EDITOR_MESSAGES.TITLE_MIN_LENGTH },
          ]}
        >
          <Input placeholder={EDITOR_MESSAGES.TITLE_PLACEHOLDER} />
        </Form.Item>

        <Form.Item
          name="content"
          label={EDITOR_MESSAGES.CONTENT}
          rules={[
            { required: true, message: EDITOR_MESSAGES.CONTENT_REQUIRED },
            { min: 50, message: EDITOR_MESSAGES.CONTENT_MIN_LENGTH },
          ]}
        >
          <Input.TextArea
            rows={8}
            placeholder={EDITOR_MESSAGES.CONTENT_PLACEHOLDER}
          />
        </Form.Item>

        <Form.Item name="tags" label={EDITOR_MESSAGES.TOPICS}>
          <Select
            mode="multiple"
            placeholder={EDITOR_MESSAGES.TOPICS_PLACEHOLDER}
            options={tagOptions}
            allowClear
          />
        </Form.Item>

        {includeStatus && (
          <Form.Item
            name="status"
            label={EDITOR_MESSAGES.STATUS}
            rules={[{ required: true, message: EDITOR_MESSAGES.STATUS_REQUIRED }]}
          >
            <Select placeholder={EDITOR_MESSAGES.STATUS_PLACEHOLDER}>
              {EDIT_STATUS_OPTIONS.map((status) => (
                <Select.Option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item label={EDITOR_MESSAGES.COVER_IMAGE}>
          <input
            id={imageInputId}
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="image-upload-input"
            disabled={isCreate && confirmLoading}
          />
          {isCreate && confirmLoading && (
            <div>{EDITOR_MESSAGES.IMAGE_PROCESSING}</div>
          )}
          <div className="image-upload-hint">
            {isCreate ? EDITOR_MESSAGES.IMAGE_HINT : EDITOR_MESSAGES.EDIT_IMAGE_HINT}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BlogEditorModal;
