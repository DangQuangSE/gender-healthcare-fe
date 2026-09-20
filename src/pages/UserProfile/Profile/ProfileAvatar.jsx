import { Avatar, Button, Upload } from "antd";
import { CameraOutlined, UserOutlined } from "@ant-design/icons";
import { PROFILE_TEXT } from "./Profile.constants";

const ProfileAvatar = ({ user, imageUrl, uploading, onUpload, onPreview }) => (
  <div className="avatar-section">
    <div className="avatar-container">
      <Avatar
        size={120}
        src={imageUrl || user?.imageUrl}
        icon={<UserOutlined />}
        className="profile-avatar"
        onClick={onPreview}
      />
      <Upload
        name="avatar"
        showUploadList={false}
        beforeUpload={onUpload}
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
      <h3>{user?.fullname || PROFILE_TEXT.NAME_FALLBACK}</h3>
      <p>{user?.email}</p>
    </div>
  </div>
);

export default ProfileAvatar;
