import React, { useState } from "react";
import {
  Card,
  Button,
  Space,
  DatePicker,
  Select,
  Typography,
  Alert,
  Spin,
} from "antd";
import { CalendarOutlined, ApiOutlined } from "@ant-design/icons";
import { getMySchedule } from "../../../scheduling/scheduleApi";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

/**
 * Test component for My Schedule API
 */
const TestMyScheduleAPI = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  /**
   * Test API call
   */
  const testAPI = async (date = null, status = null) => {
    try {
      setLoading(true);
      setError(null);
      setResponse(null);

      console.log("🧪 Testing API with:", { date, status });

      const result = await getMySchedule(date, status);

      console.log("API Response:", result);
      setResponse(result);
    } catch (err) {
      console.error(" API Error:", err);
      setError(err.response?.data?.message || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quick test buttons
   */
  const quickTests = [
    {
      label: "All Appointments",
      action: () => testAPI(),
      description: "Get all appointments without filters",
    },
    {
      label: "Today Confirmed",
      action: () => testAPI(dayjs().format("YYYY-MM-DD"), "CONFIRMED"),
      description: "Get today's confirmed appointments",
    },
    {
      label: "Pending Only",
      action: () => testAPI(null, "PENDING"),
      description: "Get all pending appointments",
    },
    {
      label: "Cancelled Only",
      action: () => testAPI(null, "CANCELLED"),
      description: "Get all cancelled appointments",
    },
    {
      label: "Specific Date",
      action: () => testAPI("2025-07-02", null),
      description: "Get appointments for 2025-07-02",
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <Title level={2}>
        <ApiOutlined /> Test My Schedule API
      </Title>

      <Paragraph>
        This component tests the <code>getMySchedule</code> API endpoint:
        <br />
        <strong>URL:</strong> <code>GET /appointment/my-schedule</code>
        <br />
        <strong>Params:</strong> <code>date</code> (YYYY-MM-DD),{" "}
        <code>status</code> (CONFIRMED, PENDING, etc.)
      </Paragraph>

      {/* Quick Test Buttons */}
      <Card title="Quick Tests" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          {quickTests.map((test, index) => (
            <div
              key={index}
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <Button
                onClick={test.action}
                loading={loading}
                style={{ minWidth: "150px" }}
              >
                {test.label}
              </Button>
              <Text type="secondary">{test.description}</Text>
            </div>
          ))}
        </Space>
      </Card>

      {/* Custom Test */}
      <Card title="Custom Test" style={{ marginBottom: 16 }}>
        <Space wrap style={{ marginBottom: 16 }}>
          <DatePicker
            placeholder="Select date"
            value={selectedDate}
            onChange={setSelectedDate}
            format="YYYY-MM-DD"
          />

          <Select
            placeholder="Select status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="CONFIRMED">CONFIRMED</Option>
            <Option value="PENDING">PENDING</Option>
            <Option value="CANCELLED">CANCELLED</Option>
            <Option value="COMPLETED">COMPLETED</Option>
          </Select>

          <Button
            type="primary"
            onClick={() =>
              testAPI(
                selectedDate ? selectedDate.format("YYYY-MM-DD") : null,
                selectedStatus
              )
            }
            loading={loading}
          >
            Test Custom
          </Button>
        </Space>

        <div>
          <Text strong>Current params:</Text>
          <br />
          <Text>
            Date: {selectedDate ? selectedDate.format("YYYY-MM-DD") : "null"}
          </Text>
          <br />
          <Text>Status: {selectedStatus || "null"}</Text>
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "12px" }}>
              <Text>Calling API...</Text>
            </div>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert
          message="API Error"
          description={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Response */}
      {response && (
        <Card title="API Response" style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Status:</Text>{" "}
            <Text type="success">{response.status}</Text>
            <br />
            <Text strong>Data Count:</Text>{" "}
            <Text>{response.data?.length || 0} appointments</Text>
          </div>

          {/* Response Data */}
          <div>
            <Text strong>Response Data:</Text>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
                maxHeight: "400px",
                overflow: "auto",
                fontSize: "12px",
              }}
            >
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>

          {/* Parsed Data Summary */}
          {response.data && response.data.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text strong>Summary:</Text>
              <ul>
                {response.data.map((appointment, index) => (
                  <li key={appointment.id || index}>
                    <Text>
                      Appointment #{appointment.id} -{" "}
                      {appointment.preferredDate} -{appointment.status} -{" "}
                      {appointment.price?.toLocaleString("vi-VN")} VND (
                      {appointment.appointmentDetails?.length || 0} services)
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* API Documentation */}
      <Card title="API Documentation">
        <Paragraph>
          <Text strong>Endpoint:</Text>{" "}
          <code>GET /appointment/my-schedule</code>
        </Paragraph>

        <Paragraph>
          <Text strong>Query Parameters:</Text>
          <ul>
            <li>
              <code>date</code> (optional): Date in YYYY-MM-DD format
            </li>
            <li>
              <code>status</code> (optional): CONFIRMED, PENDING, CANCELLED,
              COMPLETED
            </li>
          </ul>
        </Paragraph>

        <Paragraph>
          <Text strong>Response Format:</Text>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
            }}
          >
            {`[
  {
    "id": 1,
    "price": 200000,
    "note": "",
    "preferredDate": "2025-07-02",
    "created_at": "2025-07-01T18:29:20.620685",
    "status": "CONFIRMED",
    "customerName": null,
    "serviceName": "dịch vụ 3",
    "isPaid": null,
    "paymentStatus": null,
    "appointmentDetails": [
      {
        "id": 1,
        "serviceId": 1,
        "serviceName": "dịch vụ 1",
        "consultantId": 2,
        "consultantName": null,
        "slotTime": "2025-07-02T07:00:00",
        "joinUrl": null,
        "startUrl": null,
        "status": "CONFIRMED",
        "medicalResult": null
      }
    ]
  }
]`}
          </pre>
        </Paragraph>
      </Card>
    </div>
  );
};

export default TestMyScheduleAPI;
