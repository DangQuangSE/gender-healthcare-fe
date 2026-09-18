import React from "react";
import { Card, Col, Row } from "antd";
import { PERSONAL_SCHEDULE_MESSAGES } from "./personalScheduleConstants";
import { STATISTIC_ITEMS } from "./PersonalScheduleStats.constants";

const PersonalScheduleStats = ({ statistics }) => (
  <Row gutter={12} className="statistics-row">
    {STATISTIC_ITEMS.map(({ key, className, icon: Icon, messageKey }) => (
      <Col span={6} key={key}>
        <Card
          size="small"
          styles={{ body: { padding: "12px" } }}
          className="statistics-card"
        >
          <div className="statistics-card-content">
            {React.createElement(Icon, {
              className: `statistics-icon ${className}`,
            })}
            <span className={`statistics-text ${className}`}>
              {PERSONAL_SCHEDULE_MESSAGES[messageKey](statistics[key])}
            </span>
          </div>
        </Card>
      </Col>
    ))}
  </Row>
);

export default PersonalScheduleStats;
