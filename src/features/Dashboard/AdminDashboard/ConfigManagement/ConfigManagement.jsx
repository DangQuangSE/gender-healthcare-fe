import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Typography,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  createConfig,
  fetchAllConfigs,
  updateConfig,
  deleteConfig,
} from "../../../catalog/configApi";
import "./ConfigManagement.css";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";

const { Title } = Typography;

const ConfigManagement = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [form] = Form.useForm();

  // Load configs on component mount
  useEffect(() => {
    loadConfigs();
  }, []);

  // Load all configs
  const loadConfigs = async () => {
    setLoading(true);
    try {
      const response = await fetchAllConfigs();
      setConfigs(response.data || []);
    } catch (error) {
      console.error("Error loading configs:", error);
      message.error(NOTIFICATION_MESSAGES.CONFIG.LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  // Handle create/update config
  const handleSubmit = async (values) => {
    try {
      console.log("Submitting config data:", values);

      if (editingConfig) {
        // Update existing config - chỉ gửi value
        await updateConfig(editingConfig.id, { value: values.value });
        message.success(NOTIFICATION_MESSAGES.CONFIG.UPDATE_SUCCESS);
      } else {
        // Create new config - gửi cả name và value
        await createConfig({
          name: values.name,
          value: values.value,
        });
        message.success(NOTIFICATION_MESSAGES.CONFIG.CREATE_SUCCESS);
      }

      setModalVisible(false);
      setEditingConfig(null);
      form.resetFields();
      loadConfigs();
    } catch (error) {
      console.error("Error saving config:", error);
      console.error("Error response:", error.response?.data);
      message.error(
        editingConfig
          ? NOTIFICATION_MESSAGES.CONFIG.UPDATE_FAILED
          : NOTIFICATION_MESSAGES.CONFIG.CREATE_FAILED
      );
    }
  };

  // Handle delete config
  const handleDelete = async (id) => {
    try {
      await deleteConfig(id);
      message.success(NOTIFICATION_MESSAGES.CONFIG.DELETE_SUCCESS);
      loadConfigs();
    } catch (error) {
      console.error("Error deleting config:", error);
      message.error(NOTIFICATION_MESSAGES.CONFIG.DELETE_FAILED);
    }
  };

  // Open modal for create
  const handleCreate = () => {
    setEditingConfig(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Open modal for edit
  const handleEdit = (config) => {
    setEditingConfig(config);
    form.setFieldsValue({
      name: config.name,
      value: config.value,
    });
    setModalVisible(true);
  };

  // Close modal
  const handleCancel = () => {
    setModalVisible(false);
    setEditingConfig(null);
    form.resetFields();
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên cấu hình",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      width: 120,
      render: (value) => <span className="config-value">{value}</span>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa cấu hình"
            description={`Bạn có chắc chắn muốn xóa cấu hình "${record.name}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      className="config-management-card"
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SettingOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Quản lý Cấu hình chung
          </Title>
        </div>
      }
      extra={
        <Space className="config-header-actions">
          <Button
            icon={<ReloadOutlined />}
            onClick={loadConfigs}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm cấu hình
          </Button>
        </Space>
      }
    >
      <Table
        className="config-table"
        columns={columns}
        dataSource={configs}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} cấu hình`,
        }}
        size="middle"
      />

      {/* Create/Edit Modal */}
      <Modal
        className="config-modal"
        title={editingConfig ? "Sửa cấu hình" : "Thêm cấu hình mới"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: "20px" }}
        >
          <Form.Item
            label="Tên cấu hình"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên cấu hình!" },
              { min: 2, message: "Tên cấu hình phải có ít nhất 2 ký tự!" },
            ]}
          >
            <Input placeholder="Nhập tên cấu hình (ví dụ: MAX_BOOKING)" />
          </Form.Item>

          <Form.Item
            label="Giá trị"
            name="value"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị!" },
              {
                type: "number",
                min: 0,
                message: "Giá trị phải là số không âm!",
              },
            ]}
          >
            <InputNumber
              placeholder="Nhập giá trị (ví dụ: 6)"
              style={{ width: "100%" }}
              min={0}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingConfig ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ConfigManagement;
