import { Button, Col, Dropdown, Menu, Modal, Row } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import NOTIFICATION_MESSAGES from "../../../shared/constants/notificationMessages";

const CERTIFICATE_LIST_TEXT = {
  EMPTY: 'Bạn chưa có chứng chỉ nào. Nhấn "Quản lý chứng chỉ" để thêm mới.',
  EDIT: "Sửa",
  DELETE: "Xóa",
  DELETE_TITLE: "Xóa chứng chỉ",
  DELETE_CONFIRM: (name) => `Bạn có chắc chắn muốn xóa chứng chỉ "${name}"?`,
  NO_DESCRIPTION: "Không có mô tả",
  CREATED_AT: "Ngày tạo",
  IMAGE_ALT: "Chứng chỉ",
};

const CertificateList = ({ certificates, onPreview, onEdit, onDelete }) => {
  if (!certificates.length) {
    return (
      <div className="empty-certificates">
        <p>{CERTIFICATE_LIST_TEXT.EMPTY}</p>
      </div>
    );
  }

  return (
    <div className="certificates-list">
      {certificates.map((certificate, index) => (
        <div
          key={certificate.id || index}
          className="certificate-item"
          style={{ position: "relative" }}
        >
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
                    onClick={() => onEdit(certificate)}
                  >
                    {CERTIFICATE_LIST_TEXT.EDIT}
                  </Menu.Item>
                  <Menu.Item
                    key="delete"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() =>
                      Modal.confirm({
                        title: CERTIFICATE_LIST_TEXT.DELETE_TITLE,
                        content: CERTIFICATE_LIST_TEXT.DELETE_CONFIRM(
                          certificate.name
                        ),
                        okText: CERTIFICATE_LIST_TEXT.DELETE,
                        cancelText: NOTIFICATION_MESSAGES.PROFILE.CANCEL,
                        okType: "danger",
                        onOk: () => onDelete(certificate.id),
                      })
                    }
                  >
                    {CERTIFICATE_LIST_TEXT.DELETE}
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
            <Col xs={24} sm={certificate.imageUrl ? 16 : 10}>
              <h3 style={{ marginTop: "8px", paddingRight: "40px" }}>
                {certificate.name}
              </h3>
              <p>{certificate.description || CERTIFICATE_LIST_TEXT.NO_DESCRIPTION}</p>
              {certificate.createdAt && (
                <p>
                  {CERTIFICATE_LIST_TEXT.CREATED_AT}: {dayjs(certificate.createdAt).format("DD/MM/YYYY")}
                </p>
              )}
            </Col>
            {certificate.imageUrl && (
              <Col xs={24} sm={8}>
                <div className="certificate-image-container" style={{ paddingRight: "40px" }}>
                  <img
                    src={certificate.imageUrl}
                    alt={CERTIFICATE_LIST_TEXT.IMAGE_ALT}
                    className="certificate-image"
                    onClick={() => onPreview(certificate.imageUrl)}
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
            <div style={{ margin: "16px 0", borderTop: "1px solid #f0f0f0" }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default CertificateList;
