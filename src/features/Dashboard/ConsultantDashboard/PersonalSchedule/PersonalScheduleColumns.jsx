import { Button, Space, Tag } from "antd";
import {
  ClockCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import MedicalResultViewer from "../../../../components/MedicalResult/MedicalResultViewer";
import PatientDetailButton from "../PatientHistory/PatientDetailButton";
import {
  PERSONAL_SCHEDULE_MESSAGES,
} from "./personalScheduleConstants";
import {
  DEFAULT_STATUS_INFO,
  STATUS_INFO,
} from "./PersonalScheduleColumns.constants";

const getStatusInfo = (status) =>
  STATUS_INFO[status] || { ...DEFAULT_STATUS_INFO, text: status };

export const createPersonalScheduleColumns = ({
  activeTab,
  getCurrentTabData,
  onStartExamination,
  onWaitForResult,
  onOpenResultModal,
  statusUpdateLoading,
}) => {
  const columns = [
    {
      title: PERSONAL_SCHEDULE_MESSAGES.PATIENT_INFO,
      key: "patientInfo",
      width: 200,
      render: (_, detail) => {
        const appointment = getCurrentTabData().find((item) =>
          item.appointmentDetails?.some((appointmentDetail) =>
            appointmentDetail.id === detail.id
          )
        );

        return (
          <div>
            <div className="patient-info-name">
              <UserOutlined />
              {detail.customerName || PERSONAL_SCHEDULE_MESSAGES.PATIENT_NAME_FALLBACK}
            </div>
            <div className="patient-detail-button-container">
              <PatientDetailButton
                patientId={detail.customerId || appointment?.customerId}
                patientName={
                  detail.customerName ||
                  appointment?.customerName ||
                  PERSONAL_SCHEDULE_MESSAGES.PATIENT_LABEL
                }
                buttonText={PERSONAL_SCHEDULE_MESSAGES.PATIENT_DETAILS}
                buttonType="link"
                buttonSize="small"
              />
            </div>
          </div>
        );
      },
    },
    {
      title: PERSONAL_SCHEDULE_MESSAGES.STATUS,
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        const statusInfo = getStatusInfo(status);
        const StatusIcon = statusInfo.icon;
        return (
          <div>
            <Tag color={statusInfo.color} icon={<StatusIcon />}>
              {statusInfo.text}
            </Tag>
            <div className="status-description">{statusInfo.description}</div>
          </div>
        );
      },
    },
    {
      title: PERSONAL_SCHEDULE_MESSAGES.SERVICE,
      key: "serviceInfo",
      width: 200,
      render: (_, detail) => (
        <div>
          <div className="service-name">{detail.serviceName}</div>
          <div className="service-time">
            {PERSONAL_SCHEDULE_MESSAGES.SERVICE_TIME}:{" "}
            {new Date(detail.slotTime).toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>
          <div className="service-consultant">
            {PERSONAL_SCHEDULE_MESSAGES.CONSULTANT}:{" "}
            {detail.consultantName ||
              PERSONAL_SCHEDULE_MESSAGES.CONSULTANT_FALLBACK(detail.consultantId)}
          </div>
        </div>
      ),
    },
    {
      title: PERSONAL_SCHEDULE_MESSAGES.ACTIONS,
      key: "actions",
      width: 150,
      render: (_, detail) => {
        const { status, id } = detail;

        return (
          <Space direction="vertical" size="small">
            {status === "CONFIRMED" &&
              detail.serviceType === "CONSULTING_ON" &&
              detail.startUrl && (
                <Button
                  type="primary"
                  size="small"
                  icon={<SolutionOutlined />}
                  onClick={() => onStartExamination(id, detail.startUrl)}
                  loading={statusUpdateLoading}
                  className="action-button-consulting"
                >
                  {PERSONAL_SCHEDULE_MESSAGES.JOIN_CONSULTATION}
                </Button>
              )}

            {status === "CHECKED" && detail.serviceType !== "CONSULTING_ON" && (
              <Button
                type="primary"
                size="small"
                icon={<ClockCircleOutlined />}
                onClick={() => onStartExamination(id)}
                loading={statusUpdateLoading}
              >
                {PERSONAL_SCHEDULE_MESSAGES.START_EXAMINATION}
              </Button>
            )}

            {status === "IN_PROGRESS" && (
              <Button
                type="primary"
                size="small"
                icon={<ExclamationCircleOutlined />}
                onClick={() => onWaitForResult(id)}
                loading={statusUpdateLoading}
                className="action-button-waiting"
              >
                {PERSONAL_SCHEDULE_MESSAGES.WAIT_RESULT}
              </Button>
            )}

            {status === "WAITING_RESULT" && (
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onOpenResultModal(detail)}
                className="action-button-result"
              >
                {PERSONAL_SCHEDULE_MESSAGES.ENTER_RESULT}
              </Button>
            )}

            {status === "COMPLETED" && (
              <div className="completed-status">
                {PERSONAL_SCHEDULE_MESSAGES.COMPLETED_STATUS}
              </div>
            )}
          </Space>
        );
      },
    },
  ];

  if (activeTab === "completed") {
    columns.push({
      title: PERSONAL_SCHEDULE_MESSAGES.MEDICAL_RESULT,
      dataIndex: "medicalResult",
      key: "medicalResult",
      ellipsis: true,
      width: 300,
      render: (result) => <MedicalResultViewer result={result} compact />,
    });
  }

  return columns;
};
