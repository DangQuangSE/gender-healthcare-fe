import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Tabs,
  Modal,
  Select,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useUsers } from "./useUsers";
import CreateUserModal from "./CreateUserModal";
import { fetchSpecializations } from "../../../catalog/api/specializationApi";
import {
  addUserSpecializations,
  fetchUserSpecializations as fetchUserSpecializationList,
  removeUserSpecialization,
} from "../../../admin/api/userApi";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";
import "./UserManagement.css";

const { TabPane } = Tabs;

/**
 * Component hiển thị chuyên khoa của tư vấn viên
 */
const SpecializationCell = ({
  record,
  onAddSpecialization,
  refreshTrigger,
}) => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUserSpecializations = useCallback(async () => {
    try {
      setLoading(true);
      const userSpecializations = await fetchUserSpecializationList(record.id);
      setSpecializations(userSpecializations);
    } catch {
      setSpecializations([]);
    } finally {
      setLoading(false);
    }
  }, [record.id]);

  // Load chuyên khoa của user khi component mount hoặc khi có refresh trigger
  useEffect(() => {
    if (record.role === "CONSULTANT") {
      loadUserSpecializations();
    }
  }, [record.role, loadUserSpecializations, refreshTrigger]);

  if (record.role !== "CONSULTANT") {
    return (
      <span className="specialization-cell-not-applicable">Không áp dụng</span>
    );
  }

  return (
    <div className="specialization-cell-container">
      <div className="specialization-cell-content">
        {loading ? (
          <span className="specialization-cell-loading">Đang tải...</span>
        ) : !specializations || specializations.length === 0 ? (
          <span className="specialization-cell-empty">Chưa có</span>
        ) : (
          specializations.map((spec, index) => (
            <Tag
              key={spec.id || index}
              color="blue"
              className="specialization-cell-tag"
            >
              {spec.name}
            </Tag>
          ))
        )}
      </div>
      <Button
        size="small"
        type="text"
        icon={<UserAddOutlined />}
        onClick={() => onAddSpecialization(record)}
        title="Thêm chuyên khoa"
        className="specialization-cell-add-btn"
      />
    </div>
  );
};

/**
 * User Management Component
 * Handles the complete user management interface with tabs for different user types
 */
const UserManagement = ({ form }) => {
  const {
    users,
    editingUser,
    isUserModalVisible,
    loading,
    handleEditUser,
    handleAddUser,
    handleUserModalOk,
    handleDeleteUser,
    handleUserModalCancel,
    loadUsers,
  } = useUsers();

  // State cho modal thêm chuyên khoa
  const [isSpecializationModalVisible, setIsSpecializationModalVisible] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableSpecializations, setAvailableSpecializations] = useState([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Lấy danh sách chuyên khoa hiện tại của user
  const getUserSpecializationIds = async (userId) => {
    try {
      const specializations = await fetchUserSpecializationList(userId);
      return specializations.map((spec) => spec.id);
    } catch {
      return [];
    }
  };

  // Xử lý thêm chuyên khoa cho tư vấn viên
  const handleAddSpecialization = async (user) => {
    try {
      setSelectedUser(user);
      setLoadingSpecializations(true);

      // Load danh sách chuyên khoa có sẵn và chuyên khoa hiện tại của user
      const [specializations, currentSpecializationIds] = await Promise.all([
        fetchSpecializations(),
        getUserSpecializationIds(user.id),
      ]);

      setAvailableSpecializations(specializations);
      setSelectedSpecializations(currentSpecializationIds);
      setIsSpecializationModalVisible(true);
    } catch (error) {
      console.error(" Error loading specializations:", error);
      message.error(
        NOTIFICATION_MESSAGES.USER_MANAGEMENT.SPECIALIZATIONS_LOAD_FAILED
      );
    } finally {
      setLoadingSpecializations(false);
    }
  };

  // Lưu chuyên khoa cho tư vấn viên
  const handleSaveSpecializations = async () => {
    try {
      // Lấy danh sách chuyên khoa hiện tại
      const currentSpecializationIds = await getUserSpecializationIds(
        selectedUser.id
      );

      // Tìm chuyên khoa cần thêm (có trong selected nhưng không có trong current)
      const toAdd = selectedSpecializations.filter(
        (id) => !currentSpecializationIds.includes(id)
      );

      // Tìm chuyên khoa cần xóa (có trong current nhưng không có trong selected)
      const toRemove = currentSpecializationIds.filter(
        (id) => !selectedSpecializations.includes(id)
      );

      // Thêm chuyên khoa mới
      if (toAdd.length > 0) {
        await addUserSpecializations(selectedUser.id, toAdd);
      }

      // Xóa chuyên khoa không còn được chọn
      for (const specId of toRemove) {
        await removeUserSpecialization(selectedUser.id, specId);
      }

      message.success(
        NOTIFICATION_MESSAGES.USER_MANAGEMENT.SPECIALIZATIONS_UPDATE_SUCCESS
      );

      // Đóng modal và refresh data
      setIsSpecializationModalVisible(false);
      setSelectedUser(null);
      setSelectedSpecializations([]);

      // Trigger refresh cho SpecializationCell
      setRefreshTrigger((prev) => prev + 1);

      // Refresh toàn bộ user list
      await loadUsers();
    } catch (error) {
      console.error(" Error updating specializations:", error);
      console.error("Error details:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        NOTIFICATION_MESSAGES.USER_MANAGEMENT.SPECIALIZATIONS_UPDATE_FAILED;
      message.error(errorMessage);
    }
  };

  // Hủy modal thêm chuyên khoa
  const handleCancelSpecializationModal = () => {
    setIsSpecializationModalVisible(false);
    setSelectedUser(null);
    setSelectedSpecializations([]);
  };

  // Filter users by role
  const customerUsers = users.filter((user) => user.role === "CUSTOMER");
  const staffUsers = users.filter((user) => user.role === "STAFF");
  const consultantUsers = users.filter((user) => user.role === "CONSULTANT");

  // Table columns definition
  const userColumns = [
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
      ellipsis: true,
      width: 160,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 100,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      render: (gender) => {
        const genderMap = {
          MALE: "Nam",
          FEMALE: "Nữ",
          OTHER: "Khác",
        };
        return genderMap[gender] || gender;
      },
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => {
        const roleConfig = {
          CUSTOMER: { color: "green", text: "Khách hàng" },
          STAFF: { color: "blue", text: "Nhân viên" },
          CONSULTANT: { color: "purple", text: "Tư vấn viên - Bác sĩ" },
        };
        const config = roleConfig[role] || { color: "default", text: role };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      width: 120,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (text, record) => (
        <Space size="small">
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Columns cho tư vấn viên (có thêm cột chuyên khoa)
  const consultantColumns = [
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
      ellipsis: true,
      width: 220,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      width: 220,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 120,
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specializations",
      key: "specializations",
      width: 200,
      render: (specializations, record) => {
        return (
          <SpecializationCell
            record={record}
            onAddSpecialization={handleAddSpecialization}
            refreshTrigger={refreshTrigger}
          />
        );
      },
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      render: (gender) => {
        const genderMap = {
          MALE: "Nam",
          FEMALE: "Nữ",
          OTHER: "Khác",
        };
        return genderMap[gender] || gender;
      },
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => {
        const roleConfig = {
          GUEST: { color: "green", text: "Khách hàng" },
          STAFF: { color: "blue", text: "Nhân viên" },
          CONSULTANT: { color: "purple", text: "Tư vấn viên" },
        };
        const config = roleConfig[role] || { color: "default", text: role };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      width: 120,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (text, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record, form)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderUserTable = (userData, userType) => (
    <Table
      columns={userType === "consultant" ? consultantColumns : userColumns}
      dataSource={userData}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} của ${total} người dùng`,
      }}
      scroll={{ x: userType === "consultant" ? 1200 : 1000 }}
    />
  );

  return (
    <>
      <Card
        title="Quản lý Tài khoản Người dùng & Vai trò"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddUser(form)}
          >
            Thêm Người dùng
          </Button>
        }
      >
        <Tabs defaultActiveKey="all" type="card">
          <TabPane tab={`Tất cả (${users.length})`} key="all">
            {renderUserTable(users, "all")}
          </TabPane>
          <TabPane tab={`Khách hàng (${customerUsers.length})`} key="customer">
            {renderUserTable(customerUsers, "customer")}
          </TabPane>
          <TabPane tab={`Nhân viên (${staffUsers.length})`} key="staff">
            {renderUserTable(staffUsers, "staff")}
          </TabPane>
          <TabPane
            tab={`Tư vấn viên (${consultantUsers.length})`}
            key="consultant"
          >
            {renderUserTable(consultantUsers, "consultant")}
          </TabPane>
        </Tabs>
      </Card>

      <CreateUserModal
        visible={isUserModalVisible}
        onOk={() => handleUserModalOk(form)}
        onCancel={() => handleUserModalCancel(form)}
        form={form}
        editingUser={editingUser}
      />

      {/* Modal quản lý chuyên khoa */}
      <Modal
        title={`Quản lý chuyên khoa cho ${selectedUser?.fullname || ""}`}
        open={isSpecializationModalVisible}
        onOk={handleSaveSpecializations}
        onCancel={handleCancelSpecializationModal}
        width={600}
        okText="Lưu"
        cancelText="Hủy"
      >
        <div className="specialization-modal-user-info">
          <p>
            <strong>Tư vấn viên:</strong> {selectedUser?.fullname}
          </p>
          <p>
            <strong>Email:</strong> {selectedUser?.email}
          </p>
        </div>

        <div>
          <label className="specialization-modal-label">
            Chọn chuyên khoa:
          </label>
          <Select
            mode="multiple"
            className="specialization-modal-select"
            placeholder="Chọn các chuyên khoa"
            value={selectedSpecializations}
            onChange={setSelectedSpecializations}
            loading={loadingSpecializations}
            allowClear
          >
            {availableSpecializations.map((spec) => (
              <Select.Option key={spec.id} value={spec.id}>
                {spec.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {selectedSpecializations.length > 0 && (
          <div className="specialization-modal-preview">
            <p className="specialization-modal-preview-title">
              Chuyên khoa đã chọn:
            </p>
            <div>
              {selectedSpecializations.map((specId) => {
                const spec = availableSpecializations.find(
                  (s) => s.id === specId
                );
                return spec ? (
                  <Tag
                    key={specId}
                    color="blue"
                    className="specialization-modal-preview-tag"
                  >
                    {spec.name}
                  </Tag>
                ) : null;
              })}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default UserManagement;
