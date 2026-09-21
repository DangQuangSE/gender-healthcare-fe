import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  PERSONAL_SCHEDULE_MESSAGES,
  PERSONAL_SCHEDULE_STATUS_LABELS,
} from "./personalScheduleConstants";

export const STATUS_INFO = Object.freeze({
  CHECKED: {
    color: "blue",
    icon: CheckCircleOutlined,
    text: PERSONAL_SCHEDULE_STATUS_LABELS.CHECKED,
  },
  IN_PROGRESS: {
    color: "purple",
    icon: ClockCircleOutlined,
    text: PERSONAL_SCHEDULE_STATUS_LABELS.IN_PROGRESS,
    description: PERSONAL_SCHEDULE_MESSAGES.STATUS_IN_PROGRESS_DESCRIPTION,
  },
  WAITING_RESULT: {
    color: "orange",
    icon: ExclamationCircleOutlined,
    text: PERSONAL_SCHEDULE_STATUS_LABELS.WAITING_RESULT,
    description: PERSONAL_SCHEDULE_MESSAGES.STATUS_WAITING_RESULT_DESCRIPTION,
  },
  COMPLETED: {
    color: "green",
    icon: CheckCircleOutlined,
    text: PERSONAL_SCHEDULE_STATUS_LABELS.COMPLETED,
  },
  PENDING: {
    color: "orange",
    icon: ExclamationCircleOutlined,
    text: PERSONAL_SCHEDULE_STATUS_LABELS.PENDING,
    description: PERSONAL_SCHEDULE_MESSAGES.STATUS_PENDING_DESCRIPTION,
  },
  CONFIRMED: {
    color: "cyan",
    icon: CheckCircleOutlined,
    text: PERSONAL_SCHEDULE_STATUS_LABELS.CONFIRMED,
    description: PERSONAL_SCHEDULE_MESSAGES.STATUS_CONFIRMED_DESCRIPTION,
  },
  CANCELED: {
    color: "red",
    icon: CloseCircleOutlined,
    text: PERSONAL_SCHEDULE_STATUS_LABELS.CANCELED,
    description: PERSONAL_SCHEDULE_MESSAGES.STATUS_CANCELED_DESCRIPTION,
  },
});

export const DEFAULT_STATUS_INFO = Object.freeze({
  color: "default",
  icon: QuestionCircleOutlined,
  description: PERSONAL_SCHEDULE_MESSAGES.UNKNOWN_STATUS,
});
