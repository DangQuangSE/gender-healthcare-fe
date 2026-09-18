import React from "react";
import { CalendarOutlined } from "@ant-design/icons";
import { PERSONAL_SCHEDULE_MESSAGES } from "./personalScheduleConstants";

const PersonalScheduleEmptyState = ({ date }) => (
  <div className="empty-state-container">
    <CalendarOutlined className="empty-state-icon" />
    <div className="empty-state-message">
      {PERSONAL_SCHEDULE_MESSAGES.EMPTY(date)}
    </div>
    <div className="empty-state-hint">
      {PERSONAL_SCHEDULE_MESSAGES.EMPTY_HINT}
    </div>
  </div>
);

export default PersonalScheduleEmptyState;
