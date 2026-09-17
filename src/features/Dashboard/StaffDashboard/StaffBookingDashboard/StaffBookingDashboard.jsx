import { useState, useEffect } from "react";
import {
  Table,
  Tabs,
  Card,
  Tag,
  Button,
  Space,
  message,
  Modal,
  Input,
  Popconfirm,
  Form,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import api from "../../../../configs/api";
import "../../AdminDashboard/BookingDashboard/BookingDashboard.css";

const { Search } = Input;

// Định nghĩa status cho Staff (bao gồm cả CANCELED)
const APPOINTMENT_STATUSES = [
  { key: "ALL", label: "Tất cả", color: "default" },
  { key: "PENDING", label: "Chờ xác nhận", color: "orange" },
  { key: "CONFIRMED", label: "Đã xác nhận", color: "blue" },
  { key: "CHECKED", label: "Có mặt", color: "green" },
  { key: "CANCELED", label: "Đã hủy", color: "red" },
];

const StaffBookingDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  // State cho modal cập nhật thông tin y tế
  const [isMedicalInfoModalVisible, setIsMedicalInfoModalVisible] =
    useState(false);
  const [selectedPatientForMedicalInfo, setSelectedPatientForMedicalInfo] =
    useState(null);

  // Form cho modal medical info
  const [medicalInfoForm] = Form.useForm();

  // Fetch appointments theo status
  const fetchAppointments = async (status = "ALL") => {
    setLoading(true);
    try {
      let allAppointments = [];

      if (status === "ALL") {
        // Gọi API cho tất cả status của Staff và merge lại
        const statusList = ["PENDING", "CONFIRMED", "CHECKED", "CANCELED"];

        console.log(" Fetching staff appointments for statuses:", statusList);

        const promises = statusList.map(async (s) => {
          try {
            const response = await api.get(
              `/appointment/by-status?status=${s}`
            );
            console.log(
              ` Status ${s}:`,
              response.data?.length || 0,
              "appointments"
            );
            return response.data || [];
          } catch (error) {
            console.error(` Error fetching ${s}:`, error);
            return [];
          }
        });

        const responses = await Promise.all(promises);
        allAppointments = responses.flat();
      } else {
        // Gọi API với status cụ thể
        console.log(` Fetching appointments for status: ${status}`);
        const response = await api.get(
          `/appointment/by-status?status=${status}`
        );
        allAppointments = response.data || [];
      }

      // Sort theo ngày tạo mới nhất
      const sortedData = allAppointments.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setAppointments(sortedData);
      console.log(
        ` Loaded ${sortedData.length} appointments for status: ${status}`
      );
      console.log(" Sample appointment data:", sortedData[0]);

      // Debug: Check if all appointments have the same customerMedicalProfile
      if (sortedData.length > 1) {
        console.log(" Debugging medical profiles:");
        sortedData.slice(0, 3).forEach((appointment, index) => {
          console.log(`  Appointment ${index + 1}:`, {
            id: appointment.id,
            customerId: appointment.customerId,
            customerName: appointment.customerName,
            medicalProfile: appointment.customerMedicalProfile,
          });
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Không thể tải danh sách lịch hẹn");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Load appointments khi component mount hoặc tab thay đổi
  useEffect(() => {
    fetchAppointments(activeTab);
  }, [activeTab]);

  // Get status color
  const getStatusColor = (status) => {
    const statusObj = APPOINTMENT_STATUSES.find((s) => s.key === status);
    return statusObj?.color || "default";
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusObj = APPOINTMENT_STATUSES.find((s) => s.key === status);
    return statusObj?.label || status;
  };

  // Handle checked (check-in)
  const handleChecked = async (record) => {
    try {
      console.log(" Checking appointment:", record.id);

      await api.patch(`/appointment/${record.id}/checkin`);

      message.success("Đã đánh dấu checked thành công!");

      // Refresh appointments
      fetchAppointments(activeTab);
    } catch (error) {
      console.error(" Error checking appointment:", error);
      message.error("Không thể đánh dấu checked. Vui lòng thử lại!");
    }
  };

  // Handle view detail
  const handleViewDetail = (record) => {
    console.log(" Showing appointment detail for:", record.id);
    console.log(" Full record data:", record);
    console.log(" Customer ID:", record.customerId);
    console.log(" Customer Medical Profile:", record.customerMedicalProfile);

    // Format date and time safely
    const formatDateTime = () => {
      try {
        const slotTime = record.appointmentDetails?.[0]?.slotTime;
        if (slotTime) {
          const dateTime = new Date(slotTime);
          if (!isNaN(dateTime.getTime())) {
            return `${dateTime.toLocaleDateString(
              "vi-VN"
            )} - ${dateTime.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
          }
        }
        if (record.preferredDate) {
          const preferredDateTime = new Date(record.preferredDate);
          if (!isNaN(preferredDateTime.getTime())) {
            return preferredDateTime.toLocaleDateString("vi-VN");
          }
        }
        return "N/A";
      } catch (error) {
        console.error("Error formatting date:", error);
        return "N/A";
      }
    };

    // Safe string conversion function
    const safeString = (value) => {
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    };

    Modal.info({
      title: "Chi tiết lịch hẹn",
      width: 800,
      content: (
        <div>
          <p>
            <strong>Tên khách hàng:</strong>{" "}
            {safeString(record.customerName) || "N/A"}
          </p>
          <p>
            <strong>Dịch vụ:</strong> {safeString(record.serviceName) || "N/A"}
          </p>
          <p>
            <strong>Giá dịch vụ:</strong>{" "}
            {record.price?.toLocaleString() || "0"} VNĐ
          </p>
          <p>
            <strong>Ngày & Giờ hẹn:</strong> {formatDateTime()}
          </p>
          <p>
            <strong>Trạng thái:</strong> {getStatusLabel(record.status)}
          </p>
          <p>
            <strong>Ngày tạo:</strong>{" "}
            {(() => {
              try {
                if (record.created_at) {
                  const createdDate = new Date(record.created_at);
                  if (!isNaN(createdDate.getTime())) {
                    return createdDate.toLocaleDateString("vi-VN");
                  }
                }
                return "N/A";
              } catch (error) {
                console.error("Error formatting created date:", error);
                return "N/A";
              }
            })()}
          </p>
          <p>
            <strong>Ghi chú:</strong> {safeString(record.note) || "Không có"}
          </p>

          {/* Thông tin y tế cơ bản của bệnh nhân */}
          {record.customerMedicalProfile && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#f0f8ff",
                borderRadius: 4,
                border: "1px solid #d1ecf1",
              }}
            >
              <p>
                <strong>Thông tin y tế cơ bản:</strong>
              </p>
              {record.customerMedicalProfile.allergies && (
                <p>
                  • <strong>Dị ứng:</strong>{" "}
                  {safeString(record.customerMedicalProfile.allergies)}
                </p>
              )}
              {record.customerMedicalProfile.chronicConditions && (
                <p>
                  • <strong>Bệnh mãn tính:</strong>{" "}
                  {safeString(record.customerMedicalProfile.chronicConditions)}
                </p>
              )}
              {record.customerMedicalProfile.familyHistory && (
                <p>
                  • <strong>Tiền sử gia đình:</strong>{" "}
                  {safeString(record.customerMedicalProfile.familyHistory)}
                </p>
              )}
              {record.customerMedicalProfile.specialNotes && (
                <p>
                  • <strong>Ghi chú đặc biệt:</strong>{" "}
                  {safeString(record.customerMedicalProfile.specialNotes)}
                </p>
              )}
              {!record.customerMedicalProfile.allergies &&
                !record.customerMedicalProfile.chronicConditions &&
                !record.customerMedicalProfile.familyHistory &&
                !record.customerMedicalProfile.specialNotes && (
                  <p style={{ fontStyle: "italic", color: "#666" }}>
                    Chưa có thông tin y tế cơ bản
                  </p>
                )}
            </div>
          )}

          {record.appointmentDetails?.[0] && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
              }}
            >
              <p>
                <strong>Thông tin chi tiết:</strong>
              </p>
              <p>
                • <strong>Tư vấn viên:</strong>{" "}
                {safeString(record.appointmentDetails[0].consultantName) ||
                  "Chưa phân công"}
              </p>
              <p>
                • <strong>Trạng thái chi tiết:</strong>{" "}
                {getStatusLabel(record.appointmentDetails[0].status)}
              </p>
              {record.appointmentDetails[0].room && (
                <p>
                  • <strong>Phòng khám:</strong>{" "}
                  {safeString(record.appointmentDetails[0].room.name) ||
                    safeString(record.appointmentDetails[0].room)}
                </p>
              )}
              {record.appointmentDetails[0].medicalResult && (
                <div>
                  <p>
                    • <strong>Kết quả khám:</strong>
                  </p>
                  <p style={{ marginLeft: 16 }}>
                    - Chẩn đoán:{" "}
                    {safeString(
                      record.appointmentDetails[0].medicalResult.diagnosis
                    ) || "Chưa có"}
                  </p>
                  <p style={{ marginLeft: 16 }}>
                    - Kế hoạch điều trị:{" "}
                    {safeString(
                      record.appointmentDetails[0].medicalResult.treatmentPlan
                    ) || "Chưa có"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    });
  };

  // Hàm cập nhật thông tin y tế cho bệnh nhân
  const updateMedicalInfo = async (medicalData) => {
    try {
      const response = await api.put(
        "/medical-profile/update-medical-info",
        medicalData
      );

      if (response.status === 200) {
        toast.success("Cập nhật thông tin y tế thành công!");
        setIsMedicalInfoModalVisible(false);
        setSelectedPatientForMedicalInfo(null);
        medicalInfoForm.resetFields();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin y tế:", error);
      toast.error("Không thể cập nhật thông tin y tế. Vui lòng thử lại!");
    }
  };

  // Hàm mở modal cập nhật thông tin y tế
  const openMedicalInfoModal = (patient) => {
    setSelectedPatientForMedicalInfo(patient);
    setIsMedicalInfoModalVisible(true);

    // Pre-fill form nếu có dữ liệu sẵn
    medicalInfoForm.setFieldsValue({
      customerId: patient.customerId,
      serviceId: patient.serviceId || 1, // Default service ID
      allergies: patient.allergies || "",
      chronicConditions: patient.chronicConditions || "",
      familyHistory: patient.familyHistory || "",
      lifestyleNotes: patient.lifestyleNotes || "",
      specialNotes: patient.specialNotes || "",
      emergencyContact: patient.emergencyContact || "",
    });
  };

  const handleEdit = (record) => {
    // Mở modal cập nhật thông tin y tế
    openMedicalInfoModal({
      customerId: record.customerId,
      customerName: record.customerName,
      serviceId: record.serviceId,
    });
  };

  // Hủy lịch hẹn
  const handleCancelAppointment = async (record) => {
    try {
      console.log(" Canceling appointment:", record.id);

      // Gọi API DELETE để hủy lịch hẹn
      const response = await api.delete(`/appointment/${record.id}/cancel`);

      console.log("Appointment canceled successfully:", response.data);
      message.success("Hủy lịch hẹn thành công! Lịch hẹn đã được hủy.");

      // Refresh danh sách appointments
      await fetchAppointments(activeTab);
    } catch (error) {
      console.error(" Error canceling appointment:", error);
      console.error("Error details:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Có lỗi xảy ra khi hủy lịch hẹn!";
      message.error(errorMessage);
    }
  };

  // Table columns
  const columns = [
    {
      title: "Tên khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 70,
      render: (customerName) => (
        <div className="booking-dashboard__customer-name">
          {customerName || "N/A"}
        </div>
      ),
    },
    {
      title: "Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
      width: 90,
      render: (serviceName, record) => (
        <div className="booking-dashboard__service">
          <div className="booking-dashboard__service-name">
            {serviceName || "N/A"}
          </div>
          <div className="booking-dashboard__service-price">
            {record.price ? `${record.price.toLocaleString()} VNĐ` : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày & Giờ",
      key: "datetime",
      width: 50,
      render: (_, record) => {
        // Lấy slotTime từ appointmentDetails array
        const slotTime = record.appointmentDetails?.[0]?.slotTime;

        try {
          if (slotTime) {
            const dateTime = new Date(slotTime);
            if (!isNaN(dateTime.getTime())) {
              const date = dateTime.toLocaleDateString("vi-VN");
              const time = dateTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div className="booking-dashboard__datetime">
                  <div className="booking-dashboard__date">{date}</div>
                  <div className="booking-dashboard__time">{time}</div>
                </div>
              );
            }
          }

          // Fallback to preferredDate if no slotTime
          let preferredDateStr = "N/A";
          if (record.preferredDate) {
            const preferredDateTime = new Date(record.preferredDate);
            if (!isNaN(preferredDateTime.getTime())) {
              preferredDateStr = preferredDateTime.toLocaleDateString("vi-VN");
            }
          }

          return (
            <div className="booking-dashboard__datetime">
              <div className="booking-dashboard__date">{preferredDateStr}</div>
              <div className="booking-dashboard__time">Chưa có giờ</div>
            </div>
          );
        } catch (error) {
          console.error("Error formatting datetime in table:", error);
          return (
            <div className="booking-dashboard__datetime">
              <div className="booking-dashboard__date">N/A</div>
              <div className="booking-dashboard__time">Lỗi hiển thị</div>
            </div>
          );
        }
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 40,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 45,
      render: (date) => {
        try {
          if (date) {
            const createdDate = new Date(date);
            if (!isNaN(createdDate.getTime())) {
              return createdDate.toLocaleDateString("vi-VN");
            }
          }
          return "N/A";
        } catch (error) {
          console.error("Error formatting created date in table:", error);
          return "N/A";
        }
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 100,
      render: (note) => note || "Không có",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small" className="booking-dashboard__action-space">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            className="booking-dashboard__view-btn"
            onClick={() => handleViewDetail(record)}
            title="Xem chi tiết"
          >
            Chi tiết
          </Button>
          {record.status === "CONFIRMED" &&
            record.serviceType !== "CONSULTING_ON" && (
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleChecked(record)}
                title="Đánh dấu đã khám"
                className="booking-dashboard__checkin-btn"
              >
                Check in
              </Button>
            )}
          <Button
            size="small"
            icon={<EditOutlined />}
            className="booking-dashboard__edit-btn"
            onClick={() => handleEdit(record)}
            title="Cập nhật thông tin y tế"
          >
            Thông tin y tế cơ bản
          </Button>
          {(record.status === "PENDING" ||
            record.status === "CONFIRMED" ||
            record.status === "CHECKED") &&
            record.status !== "CANCELED" && (
              <Popconfirm
                title="Hủy lịch hẹn"
                description="Bạn có chắc chắn muốn hủy lịch hẹn này?"
                onConfirm={() => handleCancelAppointment(record)}
                okText="Có"
                cancelText="Không"
                okType="danger"
              >
                <Button
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  className="booking-dashboard__cancel-btn"
                  title="Hủy lịch hẹn"
                >
                  Hủy
                </Button>
              </Popconfirm>
            )}
        </Space>
      ),
    },
  ];

  // Filter appointments based on search text
  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.customerName
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      appointment.serviceName?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Card title="Quản lý lịch hẹn" className="booking-dashboard">
      {/* Search */}
      <div className="booking-dashboard__search">
        <Search
          placeholder="Tìm kiếm theo tên khách hàng, dịch vụ..."
          allowClear
          className="booking-dashboard__search-input"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="booking-dashboard__tabs"
        items={APPOINTMENT_STATUSES.map((status) => ({
          key: status.key,
          label: (
            <span className="booking-dashboard__tab-label">{status.label}</span>
          ),
        }))}
      />

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredAppointments}
        rowKey="id"
        loading={loading}
        className="booking-dashboard__table"
        scroll={{ x: 800 }}
        pagination={{
          total: filteredAppointments.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} lịch hẹn`,
        }}
      />

      {/* Modal cập nhật thông tin y tế */}
      <Modal
        title={`Cập nhật thông tin y tế - ${
          selectedPatientForMedicalInfo?.customerName || "Bệnh nhân"
        }`}
        open={isMedicalInfoModalVisible}
        onOk={() => {
          medicalInfoForm.validateFields().then((values) => {
            updateMedicalInfo(values);
          });
        }}
        onCancel={() => {
          setIsMedicalInfoModalVisible(false);
          setSelectedPatientForMedicalInfo(null);
          medicalInfoForm.resetFields();
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        width={800}
      >
        <Form form={medicalInfoForm} layout="vertical">
          <Form.Item name="customerId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="serviceId" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="allergies"
                label="Dị ứng"
                tooltip="Các loại dị ứng đã biết của bệnh nhân"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="VD: Penicillin, Tôm cua, Phấn hoa..."
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="chronicConditions"
                label="Bệnh mãn tính"
                tooltip="Các bệnh mãn tính hiện tại"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="VD: Cao huyết áp, Tiểu đường, Tim mạch..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="familyHistory"
            label="Tiền sử gia đình"
            tooltip="Lịch sử bệnh tật trong gia đình"
          >
            <Input.TextArea
              rows={2}
              placeholder="VD: Cha mắc tim mạch, mẹ mắc tiểu đường..."
            />
          </Form.Item>

          <Form.Item
            name="lifestyleNotes"
            label="Lối sống"
            tooltip="Thói quen sinh hoạt, tập luyện, ăn uống"
          >
            <Input.TextArea
              rows={3}
              placeholder="VD: Hút thuốc 10 điếu/ngày, uống rượu cuối tuần, tập thể dục 3 lần/tuần..."
            />
          </Form.Item>

          <Form.Item
            name="specialNotes"
            label="Ghi chú đặc biệt"
            tooltip="Các lưu ý đặc biệt khi điều trị"
          >
            <Input.TextArea
              rows={3}
              placeholder="VD: Bệnh nhân lo lắng, sợ tiêm, cần giải thích kỹ..."
            />
          </Form.Item>

          <Form.Item
            name="emergencyContact"
            label="Liên hệ khẩn cấp"
            tooltip="Thông tin người liên hệ khi có tình huống khẩn cấp"
          >
            <Input placeholder="VD: Nguyễn Thị B (vợ) - 0987654321" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default StaffBookingDashboard;
