import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Typography,
  Divider,
  Tag,
  Space,
  Pagination,
  Empty,
  Spin,
  Modal,
  Button,
} from "antd";
import { getPatientMedicalHistory } from "../../../medical/patientHistoryApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";

const { Title, Text } = Typography;

const PatientMedicalHistory = ({ patientId }) => {
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Load patient medical history
  const loadPatientHistory = useCallback(async (page = 0, size = 5) => {
    if (!patientId) return;

    setLoading(true);
    try {
      console.log(
        ` [PATIENT_HISTORY] Loading history for patient ${patientId}, page ${page}, size ${size}`
      );
      const response = await getPatientMedicalHistory(patientId, page, size);
      setPatientData(response.data);
      console.log("[PATIENT_HISTORY] Loaded successfully:", response.data);
    } catch (error) {
      console.error(" [PATIENT_HISTORY] Error loading patient history:", error);
      toast.error(NOTIFICATION_MESSAGES.PATIENT_HISTORY.LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPatientHistory(currentPage, pageSize);
  }, [loadPatientHistory, currentPage, pageSize]);

  // Handle pagination change
  const handlePageChange = (page, size) => {
    setCurrentPage(page - 1); // Ant Design uses 1-based, API uses 0-based
    setPageSize(size);
  };

  // Get status display
  const getStatusDisplay = (status) => {
    const statusMap = {
      COMPLETED: { color: "green", text: "Đã hoàn thành" },
      PENDING: { color: "orange", text: "Chờ khám" },
      IN_PROGRESS: { color: "blue", text: "Đang khám" },
      CANCELLED: { color: "red", text: "Đã hủy" },
    };
    return statusMap[status] || { color: "default", text: status };
  };

  // Appointment history table columns
  const appointmentColumns = [
    {
      title: "Ngày khám",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => (
        <Text strong style={{ color: "#1a1a1a" }}>
          {dayjs(date).format("DD/MM/YYYY")}
        </Text>
      ),
    },
    {
      title: "Dịch vụ",
      dataIndex: "service",
      key: "service",
      width: 180,
      render: (service) => <Text style={{ color: "#1a1a1a" }}>{service}</Text>,
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctor",
      key: "doctor",
      width: 120,
      render: (doctor) => (
        <Text style={{ color: "#1a1a1a", fontWeight: "500" }}>
          BS. {doctor}
        </Text>
      ),
    },
    {
      title: "Phòng khám",
      dataIndex: "room",
      key: "room",
      width: 120,
      render: (room) => <Text style={{ color: "#666" }}>{room}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusInfo = getStatusDisplay(status);
        return (
          <Tag color={statusInfo.color} style={{ fontSize: "12px" }}>
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "Chẩn đoán",
      dataIndex: "diagnosis",
      key: "diagnosis",
      render: (diagnosis) => (
        <Text style={{ color: "#1a1a1a" }}>
          {diagnosis || "Chưa có chẩn đoán"}
        </Text>
      ),
    },
  ];

  // Recent tests table columns
  const testsColumns = [
    {
      title: "Tên xét nghiệm",
      dataIndex: "testName",
      key: "testName",
      width: 200,
      render: (testName) => (
        <Text strong style={{ color: "#1a1a1a" }}>
          {testName}
        </Text>
      ),
    },
    {
      title: "Kết quả",
      dataIndex: "result",
      key: "result",
      width: 150,
      render: (result) => <Text style={{ color: "#1a1a1a" }}>{result}</Text>,
    },
    {
      title: "Ngày xét nghiệm",
      dataIndex: "testDate",
      key: "testDate",
      width: 130,
      render: (testDate) => (
        <Text style={{ color: "#666" }}>
          {dayjs(testDate).format("DD/MM/YYYY")}
        </Text>
      ),
    },
    {
      title: "Tình trạng",
      dataIndex: "isAbnormal",
      key: "isAbnormal",
      width: 100,
      render: (isAbnormal) => (
        <Tag
          color={isAbnormal ? "orange" : "green"}
          style={{ fontSize: "12px" }}
        >
          {isAbnormal ? "Bất thường" : "Bình thường"}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px", color: "#666" }}>
          Đang tải lịch sử khám bệnh...
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <Empty
        description="Không có dữ liệu bệnh nhân"
        style={{ padding: "50px" }}
      />
    );
  }

  const { patientInfo, appointments, recentTests, totalVisits } = patientData;

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#1a1a1a" }}>
          Hồ sơ bệnh án
        </Title>
        <Text style={{ color: "#666", fontSize: "14px" }}>
          Lịch sử khám bệnh và điều trị của bệnh nhân
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Patient Information */}
        <Col span={24}>
          <Card
            title={
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                Thông tin bệnh nhân
              </span>
            }
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Row gutter={[32, 16]}>
              <Col span={8}>
                <div style={{ marginBottom: "12px" }}>
                  <Text
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      display: "block",
                    }}
                  >
                    HỌ VÀ TÊN
                  </Text>
                  <Text strong style={{ fontSize: "14px", color: "#1a1a1a" }}>
                    {patientInfo.fullname || "Chưa cập nhật"}
                  </Text>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <Text
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      display: "block",
                    }}
                  >
                    TUỔI
                  </Text>
                  <Text strong style={{ fontSize: "14px", color: "#1a1a1a" }}>
                    {patientInfo.age || "Chưa cập nhật"} tuổi
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: "12px" }}>
                  <Text
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      display: "block",
                    }}
                  >
                    GIỚI TÍNH
                  </Text>
                  <Text strong style={{ fontSize: "14px", color: "#1a1a1a" }}>
                    {patientInfo.gender || "Chưa cập nhật"}
                  </Text>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <Text
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      display: "block",
                    }}
                  >
                    SỐ ĐIỆN THOẠI
                  </Text>
                  <Text strong style={{ fontSize: "14px", color: "#1a1a1a" }}>
                    {patientInfo.phone || "Chưa cập nhật"}
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: "12px" }}>
                  <Text
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      display: "block",
                    }}
                  >
                    EMAIL
                  </Text>
                  <Text strong style={{ fontSize: "14px", color: "#1a1a1a" }}>
                    {patientInfo.email || "Chưa cập nhật"}
                  </Text>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <Text
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      display: "block",
                    }}
                  >
                    TỔNG SỐ LƯỢT KHÁM
                  </Text>
                  <Text strong style={{ fontSize: "14px", color: "#1890ff" }}>
                    {totalVisits} lượt
                  </Text>
                </div>
              </Col>
            </Row>

            {/* Additional Medical Info */}
            {(patientInfo.allergies ||
              patientInfo.familyHistory ||
              patientInfo.lifestyleNotes ||
              patientInfo.specialNotes) && (
              <>
                <Divider style={{ margin: "20px 0" }} />
                <Row gutter={[32, 16]}>
                  {patientInfo.allergies && (
                    <Col span={12}>
                      <div>
                        <Text
                          style={{
                            color: "#666",
                            fontSize: "12px",
                            display: "block",
                          }}
                        >
                          DỊ ỨNG
                        </Text>
                        <Text style={{ fontSize: "14px", color: "#1a1a1a" }}>
                          {patientInfo.allergies}
                        </Text>
                      </div>
                    </Col>
                  )}
                  {patientInfo.familyHistory && (
                    <Col span={12}>
                      <div>
                        <Text
                          style={{
                            color: "#666",
                            fontSize: "12px",
                            display: "block",
                          }}
                        >
                          TIỀN SỬ GIA ĐÌNH
                        </Text>
                        <Text style={{ fontSize: "14px", color: "#1a1a1a" }}>
                          {patientInfo.familyHistory}
                        </Text>
                      </div>
                    </Col>
                  )}
                  {patientInfo.lifestyleNotes && (
                    <Col span={12}>
                      <div>
                        <Text
                          style={{
                            color: "#666",
                            fontSize: "12px",
                            display: "block",
                          }}
                        >
                          LỐI SỐNG
                        </Text>
                        <Text style={{ fontSize: "14px", color: "#1a1a1a" }}>
                          {patientInfo.lifestyleNotes}
                        </Text>
                      </div>
                    </Col>
                  )}
                  {patientInfo.specialNotes && (
                    <Col span={12}>
                      <div>
                        <Text
                          style={{
                            color: "#666",
                            fontSize: "12px",
                            display: "block",
                          }}
                        >
                          GHI CHÚ ĐặC BIỆT
                        </Text>
                        <Text style={{ fontSize: "14px", color: "#1a1a1a" }}>
                          {patientInfo.specialNotes}
                        </Text>
                      </div>
                    </Col>
                  )}
                </Row>
              </>
            )}
          </Card>
        </Col>

        {/* Appointment History */}
        <Col span={24}>
          <Card
            title={
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                Lịch sử khám bệnh
              </span>
            }
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Table
              columns={appointmentColumns}
              dataSource={appointments.content}
              rowKey={(record, index) => `appointment-${index}`}
              pagination={false}
              size="middle"
              style={{ marginBottom: "16px" }}
              locale={{
                emptyText: "Chưa có lịch sử khám bệnh",
              }}
            />

            {appointments.totalElements > 0 && (
              <div style={{ textAlign: "right", marginTop: "16px" }}>
                <Pagination
                  current={currentPage + 1}
                  total={appointments.totalElements}
                  pageSize={pageSize}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} bản ghi`
                  }
                  onChange={handlePageChange}
                  onShowSizeChange={handlePageChange}
                  pageSizeOptions={["5", "10", "20", "50"]}
                />
              </div>
            )}
          </Card>
        </Col>

        {/* Recent Tests */}
        {recentTests && recentTests.length > 0 && (
          <Col span={24}>
            <Card
              title={
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                  }}
                >
                  Kết quả xét nghiệm gần đây
                </span>
              }
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Table
                columns={testsColumns}
                dataSource={recentTests}
                rowKey={(record, index) => `test-${index}`}
                pagination={false}
                size="middle"
                locale={{
                  emptyText: "Chưa có kết quả xét nghiệm",
                }}
              />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default PatientMedicalHistory;
