import React, { useState } from "react";
import { Card, Col, Row, Tag, message } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import TreatmentProtocolViewModal from "../../features/medical/components/TreatmentProtocolViewModal";
import { getTreatmentProtocol } from "../../features/medical/medicalApi";
import { MEDICAL_RESULT_MESSAGES } from "../../features/medical/medicalResultMessages";


// Professional Medical Result Display Component
const ProfessionalResultDisplay = ({ result }) => {
  // const printRef = useRef();
  const [treatmentProtocolModalVisible, setTreatmentProtocolModalVisible] =
    useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [loadingProtocol, setLoadingProtocol] = useState(false);

  const handleTreatmentProtocolClick = () => {
    if (result?.treatmentProtocolId) {
      fetchTreatmentProtocolDetail(result.treatmentProtocolId);
    }
  };

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
  const getSeverityInfo = (testStatus) => {
    switch (testStatus) {
      case "NORMAL":
        return {
          color: "#52c41a",
          bgColor: "#f6ffed",
          borderColor: "#b7eb8f",
          icon: <CheckCircleOutlined />,
          label: "Bình thường",
          description: "Kết quả trong giới hạn bình thường",
        };
      case "ABNORMAL":
        return {
          color: "#fa8c16",
          bgColor: "#fff7e6",
          borderColor: "#ffd591",
          icon: <ExclamationCircleOutlined />,
          label: "Bất thường",
          description: "Kết quả nằm ngoài giới hạn bình thường",
        };
      case "CRITICAL":
        return {
          color: "#ff4d4f",
          bgColor: "#fff2f0",
          borderColor: "#ffadd2",
          icon: <CloseCircleOutlined />,
          label: "Nguy hiểm",
          description: "Kết quả cần được xử lý khẩn cấp",
        };
      default:
        return {
          color: "#1890ff",
          bgColor: "#f0f5ff",
          borderColor: "#adc6ff",
          icon: <ClockCircleOutlined />,
          label: "Đang xử lý",
          description: "Kết quả đang được xử lý",
        };
    }
  };

  const severity = getSeverityInfo(result.testStatus);

  return (
    <div
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        lineHeight: 1.6,
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "200px",
            height: "200px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            transform: "translate(50%, -50%)",
          }}
        />

        <Row gutter={24} align="middle">
          <Col span={16}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              {result.testName || result.serviceName}
            </div>
            <div style={{ fontSize: "14px", opacity: 0.9 }}>
              Mã xét nghiệm: <strong>{result.id || "N/A"}</strong> • Ngày thực
              hiện:{" "}
              <strong>
                {new Date(result.createdAt || Date.now()).toLocaleDateString(
                  "vi-VN"
                )}
              </strong>
            </div>
          </Col>
          <Col span={8} style={{ textAlign: "right" }}>
            <div
              style={{
                background: severity.color,
                color: "white",
                padding: "12px 20px",
                borderRadius: "25px",
                fontSize: "16px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {severity.icon}
              {severity.label}
            </div>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <Row gutter={24}>
        {/* Left Column - Test Results */}
        <Col span={14}>
          {/* Test Result Card */}
          <Card
            style={{
              marginBottom: "20px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            styles={{ body: { padding: "24px" } }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
                paddingBottom: "16px",
                borderBottom: "2px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: severity.bgColor,
                  border: `2px solid ${severity.borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  color: severity.color,
                  marginRight: "16px",
                }}
              >
                <ExperimentOutlined />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                  }}
                >
                  Kết quả xét nghiệm
                </div>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  {severity.description}
                </div>
              </div>
            </div>

            <div
              style={{
                background: severity.bgColor,
                border: `1px solid ${severity.borderColor}`,
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: severity.color,
                  marginBottom: "8px",
                }}
              >
                {result.testResult || "N/A"}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Giá trị bình thường:{" "}
                <strong>{result.normalRange || "N/A"}</strong>
              </div>
            </div>

            {/* Technical Details */}
            <Row gutter={16}>
              <Col span={12}>
                <div
                  style={{
                    background: "#fafafa",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "4px",
                    }}
                  >
                    PHƯƠNG PHÁP
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {result.testMethod || "N/A"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    background: "#fafafa",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "4px",
                    }}
                  >
                    MẪU XÉT NGHIỆM
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {result.specimenType || "N/A"}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Clinical Information */}
          {(result.diagnosis || result.treatmentPlan) && (
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "2px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#e6f7ff",
                    border: "2px solid #91d5ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    color: "#1890ff",
                    marginRight: "16px",
                  }}
                >
                  <MedicineBoxOutlined />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                    }}
                  >
                    Thông tin lâm sàng
                  </div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Chẩn đoán và kế hoạch điều trị
                  </div>
                </div>
              </div>

              {result.diagnosis && (
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    Chẩn đoán
                  </div>
                  <div
                    style={{
                      background: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: "8px",
                      padding: "16px",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    {result.diagnosis}
                  </div>
                </div>
              )}

              {result.treatmentPlan && (
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <MedicineBoxOutlined style={{ color: "#1890ff" }} />
                    Kế hoạch điều trị
                  </div>
                  <div
                    style={{
                      background: "#f0f5ff",
                      border: "1px solid #adc6ff",
                      borderRadius: "8px",
                      padding: "16px",
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    {result.treatmentPlan}
                  </div>
                </div>
              )}
            </Card>
          )}
        </Col>

        {/* Right Column - Additional Info */}
        <Col span={10}>
          {/* Patient Info */}
          <Card
            style={{
              marginBottom: "20px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#1a1a1a",
              }}
            >
              Thông tin bổ sung
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}
              >
                LOẠI XÉT NGHIỆM
              </div>
              <Tag color="blue" style={{ fontSize: "12px" }}>
                {result.resultType === "LAB_TEST" ? "Xét nghiệm" : "Tư vấn"}
              </Tag>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}
              >
                NGÀY THỰC HIỆN
              </div>
              <div style={{ fontSize: "14px", fontWeight: "500" }}>
                {new Date(result.createdAt || Date.now()).toLocaleDateString(
                  "vi-VN"
                )}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}
              >
                BÁC SĨ THỰC HIỆN
              </div>
              <div style={{ fontSize: "14px", fontWeight: "500" }}>
                {result.doctorName || "N/A"}
              </div>
            </div>

            {result.sampleCollectedAt && (
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "4px",
                  }}
                >
                  THỜI GIAN LẤY MẪU
                </div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>
                  {new Date(result.sampleCollectedAt).toLocaleString("vi-VN")}
                </div>
              </div>
            )}
          </Card>

          {/* Lab Notes */}
          {result.labNotes && (
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              styles={{ body: { padding: "20px" } }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FileTextOutlined style={{ color: "#1890ff" }} />
                Ghi chú từ phòng lab
              </div>
              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  padding: "16px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#666",
                }}
              >
                {result.labNotes}
              </div>
            </Card>
          )}

          {/* Treatment Protocol */}
          {result.treatmentProtocolId && (
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: "2px solid #e6f7ff",
                background: "linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)",
              }}
              styles={{
                body: { padding: "20px" },
              }}
              hoverable
              onClick={handleTreatmentProtocolClick}
              loading={loadingProtocol}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(24, 144, 255, 0.15)";
                e.currentTarget.style.borderColor = "#1890ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
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
        </Col>
      </Row>
      <TreatmentProtocolViewModal
        visible={treatmentProtocolModalVisible}
        onClose={() => {
          setTreatmentProtocolModalVisible(false);
          setSelectedProtocol(null);
        }}
        protocol={selectedProtocol}
      />
    </div>
  );
};

export default ProfessionalResultDisplay;
