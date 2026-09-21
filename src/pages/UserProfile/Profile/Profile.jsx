import { useState } from "react";
import { Button, Card, Col, Form, Modal, Row, message } from "antd";
import {
  EditOutlined,
  FileTextOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { updateUserAvatar } from "../../../redux/reduxStore/userSlice";
import CertificateModal from "./CertificateModal";
import CertificateList from "./CertificateList";
import ProfileAvatar from "./ProfileAvatar";
import ProfileForm from "./ProfileForm";
import { useProfileData } from "./useProfileData";
import {
  PROFILE_MESSAGES,
  PROFILE_ROLES,
  PROFILE_TEXT,
  CERTIFICATE_SECTION_TEXT,
  toProfileFormValues,
} from "./Profile.constants";
import "./Profile.css";

const Profile = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const {
    user,
    imageUrl,
    certificates,
    fetchingUser,
    saveProfile,
    uploadProfileAvatar,
    removeCertificate,
    loadCertificates,
  } = useProfileData(form);

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const nextImageUrl = await uploadProfileAvatar(file);
      dispatch(updateUserAvatar({ imageUrl: nextImageUrl }));
      message.success(PROFILE_MESSAGES.IMAGE_UPLOAD_SUCCESS);
    } catch {
      message.error(PROFILE_MESSAGES.IMAGE_UPLOAD_FAILED);
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      await saveProfile(values);
      message.success(PROFILE_MESSAGES.UPDATE_SUCCESS);
      setEditing(false);
    } catch {
      message.error(PROFILE_MESSAGES.UPDATE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditing = () => {
    setEditing(false);
    form.setFieldsValue(toProfileFormValues(user));
  };

  const handleSaveCertificates = async () => {
    try {
      setCertificateLoading(true);
      await loadCertificates();
      setCertificateModalVisible(false);
      setEditingCertificate(null);
      message.success(PROFILE_MESSAGES.CERTIFICATE_UPDATE_SUCCESS);
    } catch {
      message.error(PROFILE_MESSAGES.CERTIFICATE_UPDATE_FAILED);
    } finally {
      setCertificateLoading(false);
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    try {
      await removeCertificate(certificateId);
      message.success(PROFILE_MESSAGES.CERTIFICATE_DELETE_SUCCESS);
    } catch {
      message.error(PROFILE_MESSAGES.CERTIFICATE_DELETE_FAILED);
    }
  };

  const openCertificateModal = (certificate = null) => {
    setEditingCertificate(certificate);
    setCertificateModalVisible(true);
  };

  return (
    <div className="profile-container">
      <Card
        title={
          <div className="profile-header">
            <h2>{PROFILE_TEXT.TITLE}</h2>
            <Button
              type={editing ? "default" : "primary"}
              icon={editing ? <SaveOutlined /> : <EditOutlined />}
              onClick={() => (editing ? form.submit() : setEditing(true))}
              loading={loading}
            >
              {editing ? PROFILE_TEXT.SAVE : PROFILE_TEXT.EDIT}
            </Button>
          </div>
        }
        loading={loading || fetchingUser}
      >
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <ProfileAvatar
              user={user}
              imageUrl={imageUrl}
              uploading={uploading}
              onUpload={handleImageUpload}
              onPreview={() => {
                setPreviewImage(imageUrl || user?.imageUrl || "");
                setPreviewVisible(true);
              }}
            />
          </Col>
          <Col xs={24} md={16}>
            <ProfileForm
              form={form}
              user={user}
              editing={editing}
              loading={loading}
              onSubmit={handleUpdateProfile}
              onCancel={handleCancelEditing}
            />
          </Col>
        </Row>
      </Card>

      {user?.role === PROFILE_ROLES.CONSULTANT && (
        <Card
          title={
            <div className="profile-header">
              <h2>{CERTIFICATE_SECTION_TEXT.TITLE}</h2>
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => openCertificateModal()}
              >
                {CERTIFICATE_SECTION_TEXT.MANAGE}
              </Button>
            </div>
          }
          style={{ marginTop: 24 }}
        >
          <CertificateList
            certificates={certificates}
            onPreview={(image) => {
              setPreviewImage(image);
              setPreviewVisible(true);
            }}
            onEdit={openCertificateModal}
            onDelete={handleDeleteCertificate}
          />
        </Card>
      )}

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      <CertificateModal
        visible={certificateModalVisible}
        onCancel={() => {
          setCertificateModalVisible(false);
          setEditingCertificate(null);
        }}
        onSave={handleSaveCertificates}
        initialValue={editingCertificate ? [editingCertificate] : []}
        loading={certificateLoading}
        isEditing={Boolean(editingCertificate)}
      />
    </div>
  );
};

export default Profile;
