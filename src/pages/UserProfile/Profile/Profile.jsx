import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Avatar,
  message,
  Row,
  Col,
  Upload,
  Modal,
  Select,
  Divider,
  Dropdown,
  Menu,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  FileTextOutlined,
  MoreOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import NOTIFICATION_MESSAGES from "../../../shared/constants/notificationMessages";
import dayjs from "dayjs";
import {
  deleteCertification,
  getCurrentUser,
  getMyCertifications,
  updateAvatar,
  updateProfile,
} from "../../../features/profile/profileApi";
import { useDispatch } from "react-redux";
import { updateUserAvatar } from "../../../redux/reduxStore/userSlice";
import "./Profile.css";
import CertificateModal from "./CertificateModal";

const Profile = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Thêm state cho chứng chỉ
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certificateLoading, setCertificateLoading] = useState(false);

  // Thêm state cho chỉnh sửa chứng chỉ
  const [editingCertificate, setEditingCertificate] = useState(null);

  // Fetch user data from API /api/me
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetchingUser(true);
        const response = await getCurrentUser();
        setUser(response.data);
        setImageUrl(response.data.imageUrl || "");

        // Set form values from API user data
        form.setFieldsValue({
          fullname: response.data.fullname || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
          gender: response.data.gender || "",
          dateOfBirth: response.data.dateOfBirth
            ? dayjs(response.data.dateOfBirth)
            : null,
        });

        // Lấy dữ liệu chứng chỉ nếu có
        if (response.data.certificates) {
          setCertificates(response.data.certificates);
        }
      } catch {
        message.error(NOTIFICATION_MESSAGES.PROFILE.LOAD_FAILED);
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUserData();
  }, [form]);

  // Handle image upload
  const handleImageUpload = async (file) => {
    try {
      setUploading(true);

      // Create FormData for file upload
      const response = await updateAvatar(file);

      if (response.data && response.data.imageUrl) {
        setImageUrl(response.data.imageUrl);

        // Update user data with new image URL
        setUser((prev) => ({
          ...prev,
          imageUrl: response.data.imageUrl,
        }));

        // Cập nhật Redux store để các component khác cũng nhận được ảnh mới
        dispatch(updateUserAvatar({ imageUrl: response.data.imageUrl }));

      message.success(NOTIFICATION_MESSAGES.PROFILE.IMAGE_UPLOAD_SUCCESS);
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      message.error(NOTIFICATION_MESSAGES.PROFILE.IMAGE_UPLOAD_FAILED);
    } finally {
      setUploading(false);
    }
  };

  // Preview image
  const handlePreview = () => {
    setPreviewImage(imageUrl || user?.imageUrl);
    setPreviewVisible(true);
  };

  // Update profile
  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);

      const updateData = {
        fullname: values.fullname,
        phone: values.phone,
        address: values.address,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : null,
      };

      await updateProfile(updateData);

      message.success(NOTIFICATION_MESSAGES.PROFILE.UPDATE_SUCCESS);
      setEditing(false);

      // Refresh user data after successful update
      const updatedResponse = await getCurrentUser();
      setUser(updatedResponse.data);
    } catch {
      message.error(NOTIFICATION_MESSAGES.PROFILE.UPDATE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xử lý cho chứng chỉ
  const handleOpenCertificateModal = () => {
    setEditingCertificate(null);
    setCertificateModalVisible(true);
  };

  const handleSaveCertificates = async () => {
    try {
      setCertificateLoading(true);

      // Sau khi lưu thành công, tải lại danh sách chứng chỉ từ server
      const response = await getMyCertifications();
      if (response.data) {
        setCertificates(
          Array.isArray(response.data) ? response.data : [response.data]
        );
      }

      setCertificateModalVisible(false);
      message.success(NOTIFICATION_MESSAGES.PROFILE.CERTIFICATE_UPDATE_SUCCESS);
    } catch {
      message.error(NOTIFICATION_MESSAGES.PROFILE.CERTIFICATE_UPDATE_FAILED);
    } finally {
      setCertificateLoading(false);
    }
  };

  // Thêm vào useEffect để lấy dữ liệu chứng chỉ - chỉ cho CONSULTANT
  useEffect(() => {
    const fetchCertificates = async () => {
      // Chỉ fetch certificates nếu user là CONSULTANT hoặc STAFF
      if (!user || user.role !== "CONSULTANT") {
        return;
      }

      try {
        // Sử dụng endpoint /my-certifications để lấy chứng chỉ của người dùng hiện tại
        const response = await getMyCertifications();
        if (response.data) {
          setCertificates(
            Array.isArray(response.data) ? response.data : [response.data]
          );
        }
      } catch {
        message.error(NOTIFICATION_MESSAGES.PROFILE.CERTIFICATE_LOAD_FAILED);
      }
    };

    fetchCertificates();
  }, [user]); // Dependency on user để fetch khi user data được load

  // Hàm xóa chứng chỉ
  const handleDeleteCertificate = async (certificateId) => {
    try {
      await deleteCertification(certificateId);
      message.success(NOTIFICATION_MESSAGES.PROFILE.CERTIFICATE_DELETE_SUCCESS);

      // Cập nhật danh sách chứng chỉ
      setCertificates((prevCertificates) =>
        prevCertificates.filter((cert) => cert.id !== certificateId)
      );
    } catch {
      message.error(NOTIFICATION_MESSAGES.PROFILE.CERTIFICATE_DELETE_FAILED);
    }
  };

  // Hàm mở modal sửa chứng chỉ
  const handleEditCertificate = (certificate) => {
    setEditingCertificate(certificate);
    setCertificateModalVisible(true);
  };

  return (
    <div className="profile-container">
      <Card
        title={
          <div className="profile-header">
            <h2>Hồ sơ cá nhân</h2>
            <Button
              type={editing ? "default" : "primary"}
              icon={editing ? <SaveOutlined /> : <EditOutlined />}
              onClick={() => {
                if (editing) {
                  form.submit();
                } else {
                  setEditing(true);
                }
              }}
              loading={loading}
            >
              {editing ? "Lưu thay đổi" : "Chỉnh sửa"}
            </Button>
          </div>
        }
        loading={loading || fetchingUser}
      >
        <Row gutter={24}>
          {/* Avatar Section */}
          <Col xs={24} md={8}>
            <div className="avatar-section">
              <div className="avatar-container">
                <Avatar
                  size={120}
                  src={imageUrl || user?.imageUrl}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                  onClick={handlePreview}
                />
                <Upload
                  name="avatar"
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  accept="image/*"
                >
                  <Button
                    className="avatar-upload-button"
                    icon={<CameraOutlined />}
                    loading={uploading}
                    type="primary"
                    shape="circle"
                  />
                </Upload>
              </div>

              <div className="user-basic-info">
                <h3>{user?.fullname || "Chưa có tên"}</h3>
                <p>{user?.email}</p>
              </div>
            </div>
          </Col>

          {/* Form Section */}
          <Col xs={24} md={16}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              disabled={!editing}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fullname"
                    label="Họ và tên"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ và tên!" },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nhập họ và tên"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại!",
                      },
                      {
                        pattern: /^[0-9]{10,11}$/,
                        message: "Số điện thoại không hợp lệ!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Nhập số điện thoại"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="dateOfBirth" label="Ngày sinh">
                    <DatePicker
                      prefix={<CalendarOutlined />}
                      placeholder="Chọn ngày sinh"
                      size="large"
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="gender" label="Giới tính">
                    <Select
                      placeholder="Chọn giới tính"
                      size="large"
                      style={{ width: "100%" }}
                    >
                      <Select.Option value="MALE">Nam</Select.Option>
                      <Select.Option value="FEMALE">Nữ</Select.Option>
                      <Select.Option value="OTHER">Khác</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Email">
                    <Input
                      value={user?.email}
                      disabled
                      size="large"
                      placeholder="Email không thể thay đổi"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea
                  prefix={<HomeOutlined />}
                  placeholder="Nhập địa chỉ"
                  rows={3}
                  size="large"
                />
              </Form.Item>

              {editing && (
                <Form.Item>
                  <div className="form-actions">
                    <Button
                      onClick={() => {
                        setEditing(false);
                        // Reset form to original user data from API
                        form.setFieldsValue({
                          fullname: user?.fullname || "",
                          phone: user?.phone || "",
                          address: user?.address || "",
                          gender: user?.gender || "",
                          dateOfBirth: user?.dateOfBirth
                            ? dayjs(user.dateOfBirth)
                            : null,
                        });
                      }}
                      style={{ marginRight: 8 }}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                </Form.Item>
              )}
            </Form>
          </Col>
        </Row>
      </Card>

      {/* Card chứng chỉ - chỉ hiển thị cho CONSULTANT và STAFF */}
      {user?.role === "CONSULTANT" && (
        <Card
          title={
            <div className="profile-header">
              <h2>Chứng chỉ</h2>
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={handleOpenCertificateModal}
              >
                Quản lý chứng chỉ
              </Button>
            </div>
          }
          style={{ marginTop: 24 }}
        >
          {certificates.length > 0 ? (
            <div className="certificates-list">
              {certificates.map((cert, index) => (
                <div
                  key={cert.id || index}
                  className="certificate-item"
                  style={{ position: "relative" }}
                >
                  {/* Nút 3 chấm ở góc trên phải */}
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      zIndex: 10,
                    }}
                  >
                    <Dropdown
                      overlay={
                        <Menu>
                          <Menu.Item
                            key="edit"
                            icon={<EditOutlined />}
                            onClick={() => handleEditCertificate(cert)}
                          >
                            Sửa
                          </Menu.Item>
                          <Menu.Item
                            key="delete"
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => {
                              Modal.confirm({
                                title: "Xóa chứng chỉ",
                                content: `Bạn có chắc chắn muốn xóa chứng chỉ "${cert.name}"?`,
                                okText: "Xóa",
                                cancelText: "Hủy",
                                okType: "danger",
                                onOk: () => handleDeleteCertificate(cert.id),
                              });
                            }}
                          >
                            Xóa
                          </Menu.Item>
                        </Menu>
                      }
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                          border: "none",
                        }}
                      />
                    </Dropdown>
                  </div>

                  <Row gutter={16} align="middle">
                    <Col xs={24} sm={cert.imageUrl ? 16 : 10}>
                      <h3 style={{ marginTop: "8px", paddingRight: "40px" }}>
                        {cert.name}
                      </h3>
                      <p>{cert.description || "Không có mô tả"}</p>
                      {cert.createdAt && (
                        <p>
                          Ngày tạo: {dayjs(cert.createdAt).format("DD/MM/YYYY")}
                        </p>
                      )}
                    </Col>
                    {cert.imageUrl && (
                      <Col xs={24} sm={8}>
                        <div
                          className="certificate-image-container"
                          style={{ paddingRight: "40px" }}
                        >
                          <img
                            src={cert.imageUrl}
                            alt={cert.name}
                            className="certificate-image"
                            onClick={() => {
                              setPreviewImage(cert.imageUrl);
                              setPreviewVisible(true);
                            }}
                            style={{
                              width: "100%",
                              maxHeight: "120px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                          />
                        </div>
                      </Col>
                    )}
                  </Row>
                  {index < certificates.length - 1 && (
                    <div
                      style={{
                        margin: "16px 0",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-certificates">
              <p>
                Bạn chưa có chứng chỉ nào. Nhấn "Quản lý chứng chỉ" để thêm mới.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Modal xem trước ảnh */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      {/* Modal quản lý chứng chỉ */}
      <CertificateModal
        visible={certificateModalVisible}
        onCancel={() => {
          setCertificateModalVisible(false);
          setEditingCertificate(null);
        }}
        onSave={handleSaveCertificates}
        initialValue={editingCertificate ? [editingCertificate] : []}
        loading={certificateLoading}
        isEditing={!!editingCertificate}
      />
    </div>
  );
};

export default Profile;
