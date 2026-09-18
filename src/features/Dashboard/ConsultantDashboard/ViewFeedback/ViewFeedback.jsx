import React, { useState, useEffect } from "react";
import { Card, Table, message, Spin } from "antd";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";
import { getMyConsultantFeedback } from "../../../feedback/feedbackApi";
import "./ViewFeedback.css";

const ViewFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch feedbacks from API
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await getMyConsultantFeedback();
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      message.error(NOTIFICATION_MESSAGES.FEEDBACK.CONSULTANT_LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Table columns configuration
  const columns = [
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      render: (rating) => (
        <span className="rating-display">⭐ {rating || 0}/5</span>
      ),
    },
    {
      title: "Nhận xét",
      dataIndex: "comment",
      key: "comment",
      render: (comment) => (
        <div style={{ maxWidth: 300, wordWrap: "break-word" }}>
          {comment || "Không có nhận xét"}
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updateAt",
      key: "updateAt",
      width: 180,
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
  ];

  return (
    <Card title="Xem phản hồi/nhận xét">
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={feedbacks}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} phản hồi`,
          }}
        />
      </Spin>
    </Card>
  );
};

export default ViewFeedback;
