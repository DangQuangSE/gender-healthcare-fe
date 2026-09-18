import { useState, useEffect } from "react";
import {
  Table,
  Tabs,
  Card,
  message,
  Input,
  Form,
} from "antd";
import { toast } from "react-toastify";
import {
  checkInAppointment,
  getAppointmentsByStatus,
  cancelAppointment,
} from "../../../appointments/appointmentApi";
import { updateMedicalInfo as updateMedicalInfoRequest } from "../../../medical/medicalApi";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";
import { createStaffBookingColumns } from "./StaffBookingColumns";
import StaffMedicalInfoModal from "./StaffMedicalInfoModal";
import STAFF_BOOKING_MESSAGES from "./staffBookingMessages";
import { STAFF_APPOINTMENT_STATUS_KEYS } from "./StaffBookingDashboard.constants";
import { showStaffAppointmentDetail } from "./StaffAppointmentDetailModal";
import "../../AdminDashboard/BookingDashboard/BookingDashboard.css";

const { Search } = Input;

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
        const promises = STAFF_APPOINTMENT_STATUS_KEYS.map(async (s) => {
          try {
            const response = await getAppointmentsByStatus(s);
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
        const response = await getAppointmentsByStatus(status);
        allAppointments = response.data || [];
      }

      // Sort theo ngày tạo mới nhất
      const sortedData = allAppointments.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setAppointments(sortedData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error(NOTIFICATION_MESSAGES.STAFF_BOOKING.LOAD_FAILED);
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
    const statusObj = STAFF_BOOKING_MESSAGES.statuses.find(
      (s) => s.key === status
    );
    return statusObj?.color || "default";
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusObj = STAFF_BOOKING_MESSAGES.statuses.find(
      (s) => s.key === status
    );
    return statusObj?.label || status;
  };

  // Handle checked (check-in)
  const handleChecked = async (record) => {
    try {
      await checkInAppointment(record.id);

      message.success(NOTIFICATION_MESSAGES.STAFF_BOOKING.CHECKED_SUCCESS);

      // Refresh appointments
      fetchAppointments(activeTab);
    } catch (error) {
      console.error(" Error checking appointment:", error);
      message.error(NOTIFICATION_MESSAGES.STAFF_BOOKING.CHECKED_FAILED);
    }
  };

  const handleViewDetail = (record) =>
    showStaffAppointmentDetail(record, getStatusLabel);

  // Hàm cập nhật thông tin y tế cho bệnh nhân
  const updateMedicalInfo = async (medicalData) => {
    try {
      const response = await updateMedicalInfoRequest(medicalData);

      if (response.status === 200) {
        toast.success(NOTIFICATION_MESSAGES.STAFF_BOOKING.MEDICAL_UPDATE_SUCCESS);
        setIsMedicalInfoModalVisible(false);
        setSelectedPatientForMedicalInfo(null);
        medicalInfoForm.resetFields();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin y tế:", error);
      toast.error(NOTIFICATION_MESSAGES.STAFF_BOOKING.MEDICAL_UPDATE_FAILED);
    }
  };

  // Hàm mở modal cập nhật thông tin y tế
  const openMedicalInfoModal = (patient) => {
    setSelectedPatientForMedicalInfo(patient);
    setIsMedicalInfoModalVisible(true);

    // Pre-fill form nếu có dữ liệu sẵn
    medicalInfoForm.setFieldsValue({
      customerId: patient.customerId,
      serviceId: patient.serviceId,
      allergies: patient.allergies || "",
      chronicConditions: patient.chronicConditions || "",
      familyHistory: patient.familyHistory || "",
      lifestyleNotes: patient.lifestyleNotes || "",
      specialNotes: patient.specialNotes || "",
      emergencyContact: patient.emergencyContact || "",
    });
  };

  const handleEdit = (record) => {
    const serviceId =
      record.serviceId || record.appointmentDetails?.[0]?.serviceId;

    if (!record.customerId || !serviceId) {
      message.warning(STAFF_BOOKING_MESSAGES.ui.medicalInfoUnavailable);
      return;
    }

    openMedicalInfoModal({
      customerId: record.customerId,
      customerName: record.customerName,
      serviceId,
    });
  };

  // Hủy lịch hẹn
  const handleCancelAppointment = async (record) => {
    try {
      // Gọi API DELETE để hủy lịch hẹn
      await cancelAppointment(record.id);
      message.success(NOTIFICATION_MESSAGES.STAFF_BOOKING.CANCEL_SUCCESS);

      // Refresh danh sách appointments
      await fetchAppointments(activeTab);
    } catch (error) {
      console.error(" Error canceling appointment:", error);
      console.error("Error details:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        NOTIFICATION_MESSAGES.STAFF_BOOKING.CANCEL_FAILED;
      message.error(errorMessage);
    }
  };

  const columns = createStaffBookingColumns({
    getStatusColor,
    getStatusLabel,
    onCancel: handleCancelAppointment,
    onCheckIn: handleChecked,
    onEdit: handleEdit,
    onViewDetail: handleViewDetail,
  });

  // Filter appointments based on search text
  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.customerName
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      appointment.serviceName?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Card title={STAFF_BOOKING_MESSAGES.ui.managementTitle} className="booking-dashboard">
      {/* Search */}
      <div className="booking-dashboard__search">
        <Search
          placeholder={STAFF_BOOKING_MESSAGES.ui.searchPlaceholder}
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
        items={STAFF_BOOKING_MESSAGES.statuses.map((status) => ({
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
            STAFF_BOOKING_MESSAGES.ui.pagination(range[0], range[1], total),
        }}
      />

      <StaffMedicalInfoModal
        form={medicalInfoForm}
        onCancel={() => {
          setIsMedicalInfoModalVisible(false);
          setSelectedPatientForMedicalInfo(null);
          medicalInfoForm.resetFields();
        }}
        onSubmit={updateMedicalInfo}
        patient={selectedPatientForMedicalInfo}
        visible={isMedicalInfoModalVisible}
      />
    </Card>
  );
};

export default StaffBookingDashboard;
