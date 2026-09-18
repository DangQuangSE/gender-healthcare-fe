import React from "react";
import { Modal, Button, Tag } from "antd";
import {
  SERVICE_MANAGEMENT_MESSAGES,
  SERVICE_TYPE_LABELS,
} from "./serviceManagementMessages";
import "./ServiceDetailModal.css";

const ServiceDetailModal = ({ visible, onCancel, serviceDetail }) => {
  return (
    <Modal
      title={SERVICE_MANAGEMENT_MESSAGES.ui.detailTitle}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          {SERVICE_MANAGEMENT_MESSAGES.ui.close}
        </Button>,
      ]}
      width={600}
    >
      {serviceDetail && (
        <div>
          <p>
            <strong>{SERVICE_MANAGEMENT_MESSAGES.ui.detailName}:</strong>{" "}
            {serviceDetail.name}
          </p>
          <p>
            <strong>{SERVICE_MANAGEMENT_MESSAGES.ui.description}:</strong>{" "}
            {serviceDetail.description}
          </p>
          <p>
            <strong>{SERVICE_MANAGEMENT_MESSAGES.ui.detailDuration}:</strong>{" "}
            {serviceDetail.duration
              ? Math.floor(serviceDetail.duration)
              : SERVICE_MANAGEMENT_MESSAGES.ui.notAvailable}{" "}
            {SERVICE_MANAGEMENT_MESSAGES.ui.minutes}
          </p>
          <p>
            <strong>{SERVICE_MANAGEMENT_MESSAGES.ui.type}:</strong>
            <Tag
              color={
                serviceDetail.type === "CONSULTING" ||
                serviceDetail.type === "CONSULTING_ON"
                  ? "blue"
                  : "green"
              }
              className="service-detail__tag"
            >
              {SERVICE_TYPE_LABELS[serviceDetail.type] || serviceDetail.type}
            </Tag>
          </p>
          <p>
            <strong>{SERVICE_MANAGEMENT_MESSAGES.ui.price}:</strong>{" "}
            {serviceDetail.price?.toLocaleString() || 0}đ
          </p>
          <p>
            <strong>{SERVICE_MANAGEMENT_MESSAGES.ui.discount}:</strong>{" "}
            {serviceDetail.discountPercent || 0}%
          </p>
          <p>
            <strong>{SERVICE_MANAGEMENT_MESSAGES.ui.detailIsCombo}:</strong>
            <Tag
              color={serviceDetail.isCombo ? "orange" : "default"}
              className="service-detail__tag"
            >
              {serviceDetail.isCombo
                ? SERVICE_MANAGEMENT_MESSAGES.ui.yes
                : SERVICE_MANAGEMENT_MESSAGES.ui.no}
            </Tag>
          </p>
          <p>
            <strong>{SERVICE_MANAGEMENT_MESSAGES.ui.detailStatus}:</strong>
            <Tag
              color={serviceDetail.isActive ? "green" : "red"}
              className="service-detail__tag"
            >
              {serviceDetail.isActive
                ? SERVICE_MANAGEMENT_MESSAGES.ui.activeStatus
                : SERVICE_MANAGEMENT_MESSAGES.ui.inactiveStatus}
            </Tag>
          </p>
          <p>
            <strong>{SERVICE_MANAGEMENT_MESSAGES.ui.detailCreatedAt}:</strong>{" "}
            {new Date(serviceDetail.createdAt).toLocaleString("vi-VN")}
          </p>
          {serviceDetail.subServices &&
            serviceDetail.subServices.length > 0 && (
              <div>
                <p>
                  <strong>{SERVICE_MANAGEMENT_MESSAGES.ui.detailSubServices}:</strong>
                </p>
                <div className="service-detail__sub-services">
                  {serviceDetail.subServices.map((subService, index) => (
                    <div
                      key={subService.id}
                      className="service-detail__sub-service"
                    >
                      <p className="service-detail__sub-service-name">
                        <strong>
                          {index + 1}. {subService.name}
                        </strong>
                      </p>
                      <p className="service-detail__sub-service-description">
                        {subService.description}
                      </p>
                      <p className="service-detail__sub-service-meta">
                        {SERVICE_MANAGEMENT_MESSAGES.ui.price}:{" "}
                        {subService.price?.toLocaleString() || 0}đ |{" "}
                        {SERVICE_MANAGEMENT_MESSAGES.ui.detailDuration}:{" "}
                        {subService.duration
                          ? Math.floor(subService.duration)
                          : SERVICE_MANAGEMENT_MESSAGES.ui.notAvailable}{" "}
                        {SERVICE_MANAGEMENT_MESSAGES.ui.minutes} |{" "}
                        {SERVICE_MANAGEMENT_MESSAGES.ui.type}:{" "}
                        <Tag
                          size="small"
                          color={
                            subService.type === "CONSULTING" ||
                            subService.type === "CONSULTING_ON"
                              ? "blue"
                              : "green"
                          }
                        >
                          {SERVICE_TYPE_LABELS[subService.type] || subService.type}
                        </Tag>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </Modal>
  );
};

export default ServiceDetailModal;
