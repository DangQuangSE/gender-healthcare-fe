import React, { useState } from "react";
import { Modal, Button, Card, message } from "antd";
import "./MedicalResultModal.css";
import TreatmentProtocolViewModal from "../../../features/medical/components/TreatmentProtocolViewModal";
import { getTreatmentProtocol } from "../../../features/medical/medicalApi";
import { MEDICAL_RESULT_MESSAGES } from "../../../features/medical/medicalResultMessages";

const MedicalResultModal = ({ visible, onClose, selectedResult }) => {
  const [loadingProtocol, setLoadingProtocol] = useState(false);
  const [treatmentProtocolModalVisible, setTreatmentProtocolModalVisible] =
    useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  if (!selectedResult) return null;

  const fetchTreatmentProtocolDetail = async (protocolId) => {
    try {
      setLoadingProtocol(true);
      const response = await getTreatmentProtocol(protocolId);
      setSelectedProtocol(response.data);
      setTreatmentProtocolModalVisible(true);
    } catch {
      message.error(MEDICAL_RESULT_MESSAGES.TREATMENT_PROTOCOL_LOAD_FAILED);
    } finally {
      setLoadingProtocol(false);
    }
  };
  const handleTreatmentProtocolClick = (result) => {
    if (result?.treatmentProtocolId) {
      fetchTreatmentProtocolDetail(result.treatmentProtocolId);
    }
  };
  return (
    <Modal
      title="Kết quả khám bệnh"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={800}
      style={{ top: 20 }}
    >
      {selectedResult && selectedResult.appointment && (
        <div className="medical-result-modal-content">
          {/* Thông tin lịch hẹn */}
          <div className="appointment-info-section">
            <h3>Thông tin lịch hẹn</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Ngày khám:</span>
                <span className="info-value">
                  {selectedResult.appointment?.preferredDate ||
                    "Không có thông tin"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Dịch vụ:</span>
                <span className="info-value">
                  {selectedResult.appointment?.serviceName ||
                    "Không có thông tin"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Bác sĩ:</span>
                <span className="info-value">
                  {selectedResult.appointment?.appointmentDetails?.[0]
                    ?.consultantName || "Không có thông tin"}
                </span>
              </div>
            </div>
          </div>

          {/* Kết quả khám từ appointmentDetails */}
          {((selectedResult.selectedDetail &&
            selectedResult.selectedDetail.medicalResult) ||
            selectedResult.appointment.appointmentDetails?.some(
              (detail) =>
                detail.medicalResult &&
                Object.keys(detail.medicalResult).length > 0
            )) && (
            <div className="medical-results-section">
              <h3>Kết quả khám bệnh</h3>
              {(selectedResult.selectedDetail
                ? [selectedResult.selectedDetail]
                : selectedResult.appointment.appointmentDetails.filter(
                    (detail) =>
                      detail.medicalResult &&
                      Object.keys(detail.medicalResult).length > 0
                  )
              ).map((detail, index) => (
                <div key={index} className="result-item">
                  <div className="result-header">
                    <h4>{detail.serviceName}</h4>
                    {detail.medicalResult.createdAt && (
                      <span className="result-date">
                        {new Date(
                          detail.medicalResult.createdAt
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>

                  <div className="result-content">
                    {/* Kết quả xét nghiệm */}
                    {detail.medicalResult.testResult && (
                      <div className="result-field">
                        <span className="field-label">Kết quả xét nghiệm:</span>
                        <span className="field-value">
                          {detail.medicalResult.testResult}
                        </span>
                        {detail.medicalResult.normalRange && (
                          <div className="normal-range">
                            Giá trị bình thường:{" "}
                            {detail.medicalResult.normalRange}
                          </div>
                        )}
                        {detail.medicalResult.testStatus && (
                          <div className="test-status">
                            Trạng thái:{" "}
                            {detail.medicalResult.testStatus === "NORMAL"
                              ? "Bình thường"
                              : detail.medicalResult.testStatus === "ABNORMAL"
                              ? "Bất thường"
                              : "Đang xử lý"}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chẩn đoán */}
                    {detail.medicalResult.diagnosis && (
                      <div className="result-field">
                        <span className="field-label">Chẩn đoán:</span>
                        <div className="field-value">
                          {detail.medicalResult.diagnosis}
                        </div>
                      </div>
                    )}

                    {/* Kế hoạch điều trị */}
                    {detail.medicalResult.treatmentPlan && (
                      <div className="result-field">
                        <span className="field-label">Kế hoạch điều trị:</span>
                        <div className="field-value">
                          {detail.medicalResult.treatmentPlan}
                        </div>
                      </div>
                    )}

                    {/* Mô tả */}
                    {detail.medicalResult.description && (
                      <div className="result-field">
                        <span className="field-label">Mô tả:</span>
                        <div className="field-value">
                          {detail.medicalResult.description}
                        </div>
                      </div>
                    )}

                    {/* Ghi chú từ phòng lab */}
                    {detail.medicalResult.labNotes && (
                      <div className="result-field">
                        <span className="field-label">
                          Ghi chú từ phòng lab:
                        </span>
                        <div className="field-value">
                          {detail.medicalResult.labNotes}
                        </div>
                      </div>
                    )}

                    {/* Thông tin bác sĩ */}
                    {detail.medicalResult.consultantName && (
                      <div className="result-field">
                        <span className="field-label">Bác sĩ thực hiện:</span>
                        <span className="field-value">
                          {detail.medicalResult.consultantName}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Treatment Protocol */}
                  {detail.medicalResult?.treatmentProtocolId && (
                    <Card
                      style={{
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        border: "2px solid #e6f7ff",
                        background:
                          "linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)",
                      }}
                      styles={{
                        body: { padding: "20px" },
                      }}
                      hoverable
                      onClick={() =>
                        handleTreatmentProtocolClick(detail.medicalResult)
                      }
                      loading={loadingProtocol}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 16px rgba(24, 144, 255, 0.15)";
                        e.currentTarget.style.borderColor = "#1890ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0,0,0,0.06)";
                        e.currentTarget.style.borderColor = "#e6f7ff";
                      }}
                    >
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "16px",
                          color: "#1890ff",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {/* <FileTextOutlined style={{ color: "#1890ff" }} /> */}
                        📋 Phác đồ điều trị
                      </div>
                      <div
                        style={{
                          marginTop: "12px",
                          fontSize: "12px",
                          color: "#1890ff",
                          fontWeight: "500",
                          textAlign: "center",
                        }}
                      >
                        👆 Nhấn để xem chi tiết phác đồ điều trị
                      </div>
                    </Card>
                  )}
                  <TreatmentProtocolViewModal
                    visible={treatmentProtocolModalVisible}
                    onClose={() => {
                      setTreatmentProtocolModalVisible(false);
                      setSelectedProtocol(null);
                    }}
                    protocol={selectedProtocol}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Thông tin y tế cá nhân */}
          {selectedResult.medicalProfile &&
            Object.keys(selectedResult.medicalProfile).length > 0 && (
              <div className="medical-profile-section">
                <h3>Thông tin y tế cá nhân</h3>
                <div className="profile-content">
                  {selectedResult.medicalProfile.allergies && (
                    <div className="profile-field">
                      <span className="field-label">Dị ứng:</span>
                      <div className="field-value">
                        {selectedResult.medicalProfile.allergies}
                      </div>
                    </div>
                  )}

                  {selectedResult.medicalProfile.chronicConditions && (
                    <div className="profile-field">
                      <span className="field-label">Bệnh mãn tính:</span>
                      <div className="field-value">
                        {selectedResult.medicalProfile.chronicConditions}
                      </div>
                    </div>
                  )}

                  {selectedResult.medicalProfile.familyHistory && (
                    <div className="profile-field">
                      <span className="field-label">Tiền sử gia đình:</span>
                      <div className="field-value">
                        {selectedResult.medicalProfile.familyHistory}
                      </div>
                    </div>
                  )}

                  {selectedResult.medicalProfile.specialNotes && (
                    <div className="profile-field">
                      <span className="field-label">Ghi chú đặc biệt:</span>
                      <div className="field-value">
                        {selectedResult.medicalProfile.specialNotes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      )}
    </Modal>
  );
};

export default MedicalResultModal;
