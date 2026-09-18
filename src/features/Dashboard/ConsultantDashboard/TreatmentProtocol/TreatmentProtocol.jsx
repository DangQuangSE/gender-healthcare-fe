import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form, Input, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import TreatmentProtocolViewModal from "../../../medical/components/TreatmentProtocolViewModal";
import {
  createTreatmentProtocol,
  deleteTreatmentProtocol,
  getTreatmentProtocols,
  updateTreatmentProtocol,
} from "../../../medical/medicalApi";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";

const { TextArea } = Input;

const TreatmentProtocol = () => {
  const [protocols, setProtocols] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [form] = Form.useForm();
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingProtocol, setViewingProtocol] = useState(null);

  // Lấy tất cả phác đồ điều trị
  const fetchTreatmentProtocols = async () => {
    try {
      const response = await getTreatmentProtocols();
      setProtocols(response.data);
    } catch {
      message.error(NOTIFICATION_MESSAGES.TREATMENT_PROTOCOL.LOAD_FAILED);
    }
  };

  const handleRowClick = (record) => {
    setViewingProtocol(record);
    setIsViewModalVisible(true);
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchTreatmentProtocols();
  }, []);

  // Thêm phác đồ mới
  const handleAddProtocol = () => {
    setEditingProtocol(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Xử lý xóa phác đồ
  const handleDelete = async (id) => {
    try {
      await deleteTreatmentProtocol(id);
      message.success(NOTIFICATION_MESSAGES.TREATMENT_PROTOCOL.DELETE_SUCCESS);
      // Tải lại danh sách từ server
      await fetchTreatmentProtocols();
    } catch {
      message.error(NOTIFICATION_MESSAGES.TREATMENT_PROTOCOL.DELETE_FAILED);
    }
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const protocolData = {
        diseaseName: values.diseaseName,
        diagnosis: values.diagnosis,
        treatment: values.treatment,
        followUp: values.followUp,
        notes: values.notes,
      };

      if (editingProtocol) {
        // Gọi API cập nhật phác đồ
      await updateTreatmentProtocol(editingProtocol.id, protocolData);
        message.success(NOTIFICATION_MESSAGES.TREATMENT_PROTOCOL.UPDATE_SUCCESS);
        // Tải lại danh sách từ server
        await fetchTreatmentProtocols();
      } else {
        // Gọi API tạo phác đồ mới
      await createTreatmentProtocol(protocolData);
        message.success(NOTIFICATION_MESSAGES.TREATMENT_PROTOCOL.CREATE_SUCCESS);
        // Tải lại danh sách từ server
        await fetchTreatmentProtocols();
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch {
      message.error(NOTIFICATION_MESSAGES.TREATMENT_PROTOCOL.SAVE_FAILED);
    }
  };

  const columns = [
    {
      title: "Tên bệnh",
      dataIndex: "diseaseName",
      key: "diseaseName",
    },
    {
      title: "Chẩn đoán",
      dataIndex: "diagnosis",
      key: "diagnosis",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Phác đồ điều trị",
      dataIndex: "treatment",
      key: "treatment",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Kế hoạch theo dõi",
      dataIndex: "followUp",
      key: "followUp",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation(); // Ngăn chặn sự kiện click của row
              setEditingProtocol(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa phác đồ này?"
            onConfirm={(e) => {
              e.stopPropagation(); // Ngăn chặn sự kiện click của row
              handleDelete(record.id);
            }}
            onCancel={(e) => e.stopPropagation()}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
              onClick={(e) => e.stopPropagation()}
            >
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddProtocol}
        >
          Tạo phác đồ mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={protocols}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' }
        })}
      />

      <Modal
        title={editingProtocol ? "Sửa phác đồ" : "Tạo phác đồ mới"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText={editingProtocol ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="diseaseName"
            label="Tên bệnh"
            rules={[{ required: true, message: "Vui lòng nhập tên bệnh!" }]}
          >
            <Input placeholder="Nhập tên bệnh" />
          </Form.Item>

          <Form.Item
            name="diagnosis"
            label="Triệu chứng, chẩn đoán"
            rules={[{ required: true, message: "Vui lòng nhập triệu chứng và chẩn đoán!" }]}
          >
            <TextArea rows={4} placeholder="Nhập triệu chứng và chẩn đoán chi tiết" />
          </Form.Item>

          <Form.Item
            name="treatment"
            label="Phác đồ điều trị"
            rules={[{ required: true, message: "Vui lòng nhập phác đồ điều trị!" }]}
          >
            <TextArea rows={6} placeholder="Nhập chi tiết phác đồ điều trị" />
          </Form.Item>

          <Form.Item
            name="followUp"
            label="Kế hoạch theo dõi"
            rules={[{ required: true, message: "Vui lòng nhập kế hoạch theo dõi!" }]}
          >
            <TextArea rows={4} placeholder="Nhập kế hoạch theo dõi bệnh nhân" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Lưu ý đặc biệt"
          >
            <TextArea rows={3} placeholder="Nhập các lưu ý đặc biệt (không bắt buộc)" />
          </Form.Item>
        </Form>
      </Modal>
      <TreatmentProtocolViewModal
        visible={isViewModalVisible}
        onClose={() => setIsViewModalVisible(false)}
        protocol={viewingProtocol}
      />
    </div>
  );
};

export default TreatmentProtocol;
