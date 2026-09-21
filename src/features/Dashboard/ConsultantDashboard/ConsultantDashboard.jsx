import React, { useState } from "react";
import { Layout, Menu, Typography, theme, Breadcrumb } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  SolutionOutlined,
  EditOutlined,
  ScheduleOutlined,
  FormOutlined,
  CommentOutlined,
  TagOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import jwt_decode from "jwt-decode";

// Import các component con
import PersonalSchedule from "./PersonalSchedule/PersonalSchedule";
import MedicalProfile from "./MedicalProfile/UserProfiles";
import OnlineConsultation from "./OnlineConsultation/OnlineConsultation";
import ConsultationResults from "./ConsultationResults/ConsultationResults";
import ManageSchedule from "./ManageSchedule/ManageSchedule";
import WriteBlogs from "./WriteBlogs/WriteBlogs";
import ViewFeedback from "./ViewFeedback/ViewFeedback";
import TreatmentProtocol from "./TreatmentProtocol/TreatmentProtocol";

import "./Consultant.css";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function ConsultantDashboard() {
  const [selectedMenuItem, setSelectedMenuItem] = useState("personal_schedule");
  const token = useSelector((state) => state.user.jwt || state.user.token);

  let userId;
  if (token) {
    try {
      const decoded = jwt_decode(token);
      userId = decoded.id;
    } catch {
      userId = null;
    }
  }

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Menu items với SubMenu xổ xuống cho quản lý nội dung
  const menuItems = [
    {
      key: "personal_schedule",
      icon: <CalendarOutlined />,
      label: "Lịch tư vấn cá nhân",
    },
    {
      key: "manage_schedule",
      icon: <ScheduleOutlined />,
      label: "Quản lý lịch làm việc",
    },
    {
      key: "manage_TreatmentProtocol",
      icon: <CommentOutlined />,
      label: "Quản lí phác đồ",
    },
    {
      key: "content_management",
      icon: <AppstoreOutlined />,
      label: "Quản lý nội dung",
      children: [
        {
          key: "write_blogs",
          icon: <FormOutlined />,
          label: "Viết bài đăng",
        },
        {
          key: "manage_tags",
          icon: <TagOutlined />,
          label: "Quản lý chủ đề",
        },
      ],
    },
    {
      key: "view_feedback",
      icon: <CommentOutlined />,
      label: "Xem phản hồi/nhận xét",
    },
  ];

  // Render content theo tab được chọn
  const renderContent = () => {
    switch (selectedMenuItem) {
      case "personal_schedule":
        return <PersonalSchedule userId={userId} />;
      case "user_profiles":
        return <MedicalProfile userId={userId} />;
      case "online_consultation":
        return <OnlineConsultation userId={userId} />;
      case "consultation_results":
        return <ConsultationResults userId={userId} />;
      case "manage_schedule":
        return <ManageSchedule userId={userId} />;
      case "manage_TreatmentProtocol":
        return <TreatmentProtocol userId={userId} />;
      case "write_blogs":
      case "manage_tags":
        return <WriteBlogs userId={userId} selectedTab={selectedMenuItem} />;
      case "view_feedback":
        return <ViewFeedback userId={userId} />;
      default:
        return <div>Chọn một mục từ menu</div>;
    }
  };

  // Lấy tên menu item hiện tại cho breadcrumb
  const getCurrentMenuLabel = () => {
    const flatItems = menuItems.flatMap((item) =>
      item.children ? item.children : item
    );
    return (
      flatItems.find((item) => item.key === selectedMenuItem)?.label ||
      menuItems.find((item) => item.key === selectedMenuItem)?.label
    );
  };

  return (
    <Layout>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
        <Title level={3} style={{ color: "white", margin: 0 }}>
          Bảng điều khiển tư vấn viên
        </Title>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: "flex-end",
          }}
        />
      </Header>

      <Layout>
        <Sider width={250} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["personal_schedule"]}
            defaultOpenKeys={["personal_schedule", "content_management"]}
            style={{ height: "100%", borderRight: 0 }}
            items={menuItems}
            onSelect={({ key }) => setSelectedMenuItem(key)}
          />
        </Sider>

        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb
            items={[
              { title: "Trang chủ" },
              { title: "Tư vấn viên" },
              { title: getCurrentMenuLabel() },
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
    </Layout>
  );
}

export default ConsultantDashboard;
