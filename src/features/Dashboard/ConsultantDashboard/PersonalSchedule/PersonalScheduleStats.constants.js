import {
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

export const STATISTIC_ITEMS = Object.freeze([
  {
    key: "total",
    className: "total",
    icon: CalendarOutlined,
    messageKey: "TOTAL_SERVICES",
  },
  {
    key: "checked",
    className: "checked",
    icon: CheckCircleOutlined,
    messageKey: "CHECKED",
  },
  {
    key: "waitingResult",
    className: "waiting",
    icon: ExclamationCircleOutlined,
    messageKey: "WAITING_RESULT",
  },
  {
    key: "completed",
    className: "completed",
    icon: CheckCircleOutlined,
    messageKey: "COMPLETED",
  },
]);
