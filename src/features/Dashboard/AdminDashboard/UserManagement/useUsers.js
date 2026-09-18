import { useState, useEffect } from "react";
import { message } from "antd";
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../../../admin/api/userApi";
import dayjs from "dayjs";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";

/**
 * Custom hook for managing Users
 */
export const useUsers = () => {
  // States
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load users from API
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      message.error(NOTIFICATION_MESSAGES.USER_MANAGEMENT.LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = (record) => {
    setEditingUser(record);
    setIsUserModalVisible(true);
  };

  // Handle add new user
  const handleAddUser = (form) => {
    setEditingUser(null);
    form.resetFields();
    setIsUserModalVisible(true);
  };

  // Handle modal OK (save)
  const handleUserModalOk = async (form) => {
    try {
      const values = await form.validateFields();

      // Format data theo API request
      const userData = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
          : null,
        specializationIds: values.specializationIds || [],
      };

      if (editingUser) {
        // Update existing user
        await updateUser(editingUser.id, userData);
        message.success(NOTIFICATION_MESSAGES.USER_MANAGEMENT.UPDATE_SUCCESS);
      } else {
        // Add new user
        await addUser(userData);
        message.success(NOTIFICATION_MESSAGES.USER_MANAGEMENT.CREATE_SUCCESS);
      }

      // Close modal and reset form
      setIsUserModalVisible(false);
      form.resetFields();
      setEditingUser(null);

      // Reload data
      await loadUsers();
    } catch (error) {
      console.error("Lỗi cập nhật người dùng:", error);
      message.error(NOTIFICATION_MESSAGES.USER_MANAGEMENT.SAVE_FAILED);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      message.success(NOTIFICATION_MESSAGES.USER_MANAGEMENT.DELETE_SUCCESS);
      await loadUsers();
    } catch (error) {
      console.error("Lỗi xóa người dùng:", error);
      message.error(NOTIFICATION_MESSAGES.USER_MANAGEMENT.DELETE_FAILED);
    }
  };

  // Handle modal cancel
  const handleUserModalCancel = (form) => {
    setIsUserModalVisible(false);
    form.resetFields();
    setEditingUser(null);
  };

  return {
    // States
    users,
    editingUser,
    isUserModalVisible,
    loading,

    // Actions
    handleEditUser,
    handleAddUser,
    handleUserModalOk,
    handleDeleteUser,
    handleUserModalCancel,
    loadUsers,
  };
};
