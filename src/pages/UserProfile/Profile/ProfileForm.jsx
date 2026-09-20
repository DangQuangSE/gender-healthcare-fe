import { Button, Col, DatePicker, Form, Input, Row, Select } from "antd";
import {
  CalendarOutlined,
  HomeOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  PROFILE_FORM_FIELDS,
  PROFILE_TEXT,
  PROFILE_VALIDATION,
} from "./Profile.constants";

const ProfileForm = ({ form, user, editing, loading, onSubmit, onCancel }) => (
  <Form
    form={form}
    layout="vertical"
    onFinish={onSubmit}
    disabled={!editing}
  >
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          name={PROFILE_FORM_FIELDS[0]}
          label={PROFILE_TEXT.FULLNAME_LABEL}
          rules={[{ required: true, message: PROFILE_VALIDATION.FULLNAME_REQUIRED }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={PROFILE_TEXT.FULLNAME_PLACEHOLDER}
            size="large"
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name={PROFILE_FORM_FIELDS[1]}
          label={PROFILE_TEXT.PHONE_LABEL}
          rules={[
            { required: true, message: PROFILE_VALIDATION.PHONE_REQUIRED },
            { pattern: /^[0-9]{10,11}$/, message: PROFILE_VALIDATION.PHONE_INVALID },
          ]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder={PROFILE_TEXT.PHONE_PLACEHOLDER}
            size="large"
          />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          name={PROFILE_FORM_FIELDS[4]}
          label={PROFILE_TEXT.DATE_OF_BIRTH_LABEL}
        >
          <DatePicker
            prefix={<CalendarOutlined />}
            placeholder={PROFILE_TEXT.DATE_OF_BIRTH_PLACEHOLDER}
            size="large"
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name={PROFILE_FORM_FIELDS[3]}
          label={PROFILE_TEXT.GENDER_LABEL}
        >
          <Select
            placeholder={PROFILE_TEXT.GENDER_PLACEHOLDER}
            size="large"
            style={{ width: "100%" }}
            options={PROFILE_TEXT.GENDER_OPTIONS}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item label={PROFILE_TEXT.EMAIL_LABEL}>
          <Input
            value={user?.email}
            disabled
            size="large"
            placeholder={PROFILE_TEXT.EMAIL_PLACEHOLDER}
          />
        </Form.Item>
      </Col>
    </Row>
    <Form.Item
      name={PROFILE_FORM_FIELDS[2]}
      label={PROFILE_TEXT.ADDRESS_LABEL}
    >
      <Input.TextArea
        prefix={<HomeOutlined />}
        placeholder={PROFILE_TEXT.ADDRESS_PLACEHOLDER}
        rows={3}
        size="large"
      />
    </Form.Item>
    {editing && (
      <Form.Item>
        <div className="form-actions">
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            {PROFILE_TEXT.CANCEL}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
          >
            {PROFILE_TEXT.SAVE}
          </Button>
        </div>
      </Form.Item>
    )}
  </Form>
);

export default ProfileForm;
