import React, { useState } from "react";
import "./Staff.css";
import StaffBookingDashboard from "./StaffBookingDashboard/StaffBookingDashboard";
import StaffChatInterface from "./ChatDashboard/StaffChatInterface";
import SafeChatWebSocketProvider from "./ChatDashboard/SafeChatWebSocketProvider";
import {
  Layout,
  Menu,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Tabs,
  List,
  Typography,
  Row,
  Col,
  Tag,
  Space,
  Breadcrumb,
  theme,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  LaptopOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import storage from "../../../shared/storage/storage";
import { STORAGE_KEYS } from "../../../shared/constants/storageKeys";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

function Staff() {
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] =
    useState(false);
  const [isQAModalVisible, setIsQAModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedMenuItem, setSelectedMenuItem] = useState(() => {
    // Check if there's a saved menu item from chat widget navigation
    const savedMenuItem = storage.get(STORAGE_KEYS.STAFF_SELECTED_MENU_ITEM);
    console.log(
      " [STAFF] Checking localStorage staffSelectedMenuItem:",
      savedMenuItem
    );
    if (savedMenuItem) {
      console.log("[STAFF] Found saved menu item:", savedMenuItem);
      storage.remove(STORAGE_KEYS.STAFF_SELECTED_MENU_ITEM); // Clear after use
      return savedMenuItem;
    }
    console.log(" [STAFF] No saved menu item, using default");
    return "appointments_view_all"; // Default selected item
  });

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Menu items for the top navigation
  const items1 = ["Staff Dashboard"].map((label, key) => ({
    key: String(key + 1),
    label,
  }));

  // Menu items for the side navigation
  const items2 = [
    {
      key: "appointments_view_all",
      icon: React.createElement(CalendarOutlined),
      label: "Lịch hẹn",
    },
    // {
    //   key: "customers",
    //   icon: React.createElement(UserOutlined),
    //   label: "Khách hàng",
    //   children: [
    //     { key: "customers_profiles", label: "Hồ sơ" },
    //     { key: "customers_history", label: "Lịch sử" },
    //   ],
    // },
    {
      key: "qa",
      icon: React.createElement(QuestionCircleOutlined),
      label: "Hỏi đáp",
      // children: [
      //   { key: "qa_waiting", label: "Đang chờ" },
      //   { key: "qa_active", label: "Đang hoạt động" },
      // ],
    },
  ];

  // Mock data - Replace with actual API calls

  const consultantSchedule = [
    {
      id: 1,
      consultant: "Dr. Smith",
      date: "2024-03-20",
      slots: ["9:00 AM", "10:00 AM", "11:00 AM"],
    },
    {
      id: 2,
      consultant: "Dr. Johnson",
      date: "2024-03-20",
      slots: ["9:30 AM", "10:30 AM", "11:30 AM"],
    },
  ];

  const customerProfiles = [
    {
      id: 1,
      name: "John Doe",
      medicalHistory: "Hypertension",
      lastVisit: "2024-02-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      medicalHistory: "Diabetes",
      lastVisit: "2024-03-01",
    },
  ];

  const handleCreateQA = () => {
    setIsQAModalVisible(true);
  };

  const handleAppointmentModalOk = () => {
    form.validateFields().then((values) => {
      console.log("Form values:", values);
      setIsAppointmentModalVisible(false);
      form.resetFields();
    });
  };

  const handleQAModalOk = () => {
    form.validateFields().then((values) => {
      console.log("Form values:", values);
      setIsQAModalVisible(false);
      form.resetFields();
    });
  };

  const renderContent = () => {
    console.log(
      " [STAFF] Rendering content for selectedMenuItem:",
      selectedMenuItem
    );
    switch (selectedMenuItem) {
      case "appointments_view_all":
        return <StaffBookingDashboard />;
      case "appointments_consultant_schedule":
        return (
          <Row gutter={[16, 16]}>
            {consultantSchedule.map((schedule) => (
              <Col xs={24} md={12} key={schedule.id}>
                <Card title={schedule.consultant}>
                  <p>
                    <strong>Ngày:</strong> {schedule.date}
                  </p>
                  <p>
                    <strong>Khung giờ có sẵn:</strong>
                  </p>
                  <Space wrap>
                    {schedule.slots.map((slot, index) => (
                      <Tag key={index} color="blue">
                        {slot}
                      </Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        );
      case "customers_profiles":
        return (
          <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={customerProfiles}
            renderItem={(profile) => (
              <List.Item>
                <Card
                  title={profile.name}
                  extra={
                    <Button type="primary" icon={<EyeOutlined />}>
                      Xem chi tiết
                    </Button>
                  }
                >
                  <p>
                    <strong>Tiền sử bệnh:</strong> {profile.medicalHistory}
                  </p>
                  <p>
                    <strong>Lần khám cuối:</strong> {profile.lastVisit}
                  </p>
                </Card>
              </List.Item>
            )}
          />
        );
      case "qa":
        return (
          <StaffChatInterface
            defaultTab="waiting"
            hideTabs={false}
            key={`qa-${Date.now()}`} // Force re-render to trigger API calls
          />
        );

      case "qa_waiting":
        return <StaffChatInterface defaultTab="waiting" hideTabs={false} />;
      case "customers_history":
        return (
          <Card title="Lịch sử khách hàng">
            <p>Chi tiết lịch sử khách hàng sẽ được hiển thị ở đây.</p>
          </Card>
        );
      case "qa_active":
        return <StaffChatInterface defaultTab="active" hideTabs={false} />;
      default:
        return null;
    }
  };

  return (
    <SafeChatWebSocketProvider
      enableChat={
        selectedMenuItem === "qa" || selectedMenuItem.startsWith("qa_")
      }
    >
      <Layout>
        <Header style={{ display: "flex", alignItems: "center" }}>
          <div className="demo-logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={["1"]}
            items={items1}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Layout>
          <Sider width={200} style={{ background: colorBgContainer }}>
            <Menu
              mode="inline"
              selectedKeys={[selectedMenuItem]}
              defaultOpenKeys={
                selectedMenuItem.startsWith("qa_") || selectedMenuItem === "qa"
                  ? ["qa"]
                  : ["appointments"]
              }
              style={{ height: "100%", borderRight: 0 }}
              items={items2}
              onSelect={({ key }) => {
                console.log(" [STAFF] Menu item selected:", key);
                setSelectedMenuItem(key);
              }}
            />
          </Sider>
          <Layout style={{ padding: "0 24px 24px" }}>
            <Breadcrumb
              items={[
                { title: "Home" },
                { title: "Staff" },
                { title: "Dashboard" },
              ]}
              style={{ margin: "16px 0" }}
            />
            <Content
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              {renderContent()}
            </Content>
          </Layout>
        </Layout>

        {/* Create Appointment Modal */}
        <Modal
          title="Tạo lịch hẹn mới"
          visible={isAppointmentModalVisible}
          onOk={handleAppointmentModalOk}
          onCancel={() => setIsAppointmentModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="customer"
              label="Customer Name"
              rules={[
                { required: true, message: "Please input customer name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="consultant"
              label="Consultant"
              rules={[
                { required: true, message: "Please input consultant name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: "Please select date!" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: "Please select time!" }]}
            >
              <TimePicker style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Create Q&A Modal */}
        <Modal
          title="Hỏi đáp mới"
          visible={isQAModalVisible}
          onOk={handleQAModalOk}
          onCancel={() => setIsQAModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="customer"
              label="Customer Name"
              rules={[
                { required: true, message: "Please input customer name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="question"
              label="Question"
              rules={[
                { required: true, message: "Please input your question!" },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </SafeChatWebSocketProvider>
  );
}

export default Staff;
