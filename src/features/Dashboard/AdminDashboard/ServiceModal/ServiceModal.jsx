import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, Select } from "antd";
import {
  fetchSpecializations as fetchSpecializationOptions,
} from "../../../catalog/api/specializationApi";
import {
  SERVICE_MANAGEMENT_MESSAGES,
  SERVICE_TYPE_OPTIONS,
} from "./serviceManagementMessages";
import "./ServiceModal.css";

const { Option } = Select;

const ServiceModal = ({
  visible,
  onOk,
  onCancel,
  form,
  editingService,
  isComboService,
  setIsComboService,
  availableServices,
  setAvailableServices,
}) => {
  const [specializations, setSpecializations] = useState([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);

  const loadSpecializations = useCallback(async () => {
    setLoadingSpecializations(true);
    try {
      const data = await fetchSpecializationOptions();
      setSpecializations(data);
    } catch (error) {
      console.error("Error fetching specializations:", error);
      setSpecializations([]);
    } finally {
      setLoadingSpecializations(false);
    }
  }, []);

  // Fetch specializations when modal opens
  useEffect(() => {
    if (visible) {
      loadSpecializations();
    }
  }, [loadSpecializations, visible]);

  // Set form values when editing service
  useEffect(() => {
    if (editingService && visible) {
      form.setFieldsValue({
        name: editingService.name,
        description: editingService.description,
        duration: editingService.duration,
        type: editingService.type,
        price: editingService.price,
        discountPercent: editingService.discountPercent || 0,
        specializationIds: editingService.specializationIds || [],
        subServiceIds: editingService.subServiceIds || [],
      });
    } else if (visible) {
      // Reset form when adding new service
      form.resetFields();
    }
  }, [editingService, visible, form]);

  const handleCancel = () => {
    setIsComboService(false);
    setAvailableServices([]);
    form.resetFields();
    onCancel();
  };

  const handleOk = async () => {
    try {
      await form.validateFields();
      onOk();
    } catch (error) {
      if (!error?.errorFields) return;
    }
  };

  return (
    <Modal
      title={
        editingService
          ? SERVICE_MANAGEMENT_MESSAGES.ui.modalEdit
          : isComboService
          ? SERVICE_MANAGEMENT_MESSAGES.ui.modalCombo
          : SERVICE_MANAGEMENT_MESSAGES.ui.modalCreate
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={SERVICE_MANAGEMENT_MESSAGES.ui.serviceNameLabel}
          rules={[
            {
              required: true,
              message: SERVICE_MANAGEMENT_MESSAGES.validation.nameRequired,
            },
          ]}
        >
          <Input placeholder={SERVICE_MANAGEMENT_MESSAGES.ui.serviceNamePlaceholder} />
        </Form.Item>
        <Form.Item
          name="description"
          label={SERVICE_MANAGEMENT_MESSAGES.ui.descriptionLabel}
          rules={[
            {
              required: true,
              message: SERVICE_MANAGEMENT_MESSAGES.validation.descriptionRequired,
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder={SERVICE_MANAGEMENT_MESSAGES.ui.descriptionPlaceholder}
          />
        </Form.Item>
        <Form.Item
          name="duration"
          label={SERVICE_MANAGEMENT_MESSAGES.ui.duration}
          rules={[
            {
              required: true,
              message: SERVICE_MANAGEMENT_MESSAGES.validation.durationRequired,
            },
          ]}
        >
          <Input
            type="number"
            placeholder={SERVICE_MANAGEMENT_MESSAGES.ui.durationPlaceholder}
          />
        </Form.Item>
        <Form.Item
          name="type"
          label={SERVICE_MANAGEMENT_MESSAGES.ui.typeLabel}
          rules={[
            {
              required: true,
              message: SERVICE_MANAGEMENT_MESSAGES.validation.typeRequired,
            },
          ]}
        >
          <Select placeholder={SERVICE_MANAGEMENT_MESSAGES.ui.typePlaceholder}>
            {SERVICE_TYPE_OPTIONS.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="specializationIds"
          label={SERVICE_MANAGEMENT_MESSAGES.ui.specialization}
          rules={[
            {
              required: true,
              message:
                SERVICE_MANAGEMENT_MESSAGES.validation.specializationRequired,
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder={SERVICE_MANAGEMENT_MESSAGES.ui.specializationPlaceholder}
            loading={loadingSpecializations}
            allowClear
          >
            {specializations.map((specialization) => (
              <Option key={specialization.id} value={specialization.id}>
                {specialization.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Chỉ hiển thị trường giá khi KHÔNG phải là combo service */}
        {!isComboService && (
          <Form.Item
            name="price"
            label={SERVICE_MANAGEMENT_MESSAGES.ui.priceLabel}
            rules={[
              {
                required: true,
                message: SERVICE_MANAGEMENT_MESSAGES.validation.priceRequired,
              },
            ]}
          >
            <Input
              type="number"
              placeholder={SERVICE_MANAGEMENT_MESSAGES.ui.pricePlaceholder}
            />
          </Form.Item>
        )}

        <Form.Item
          name="discountPercent"
          label={SERVICE_MANAGEMENT_MESSAGES.ui.discountLabel}
        >
          <Input
            type="number"
            min={0}
            max={100}
            placeholder={SERVICE_MANAGEMENT_MESSAGES.ui.discountPlaceholder}
          />
        </Form.Item>

        {/* Hiển thị trường sub-services khi isCombo = true */}
        {isComboService && (
          <Form.Item
            name="subServiceIds"
            label={SERVICE_MANAGEMENT_MESSAGES.ui.subServicesLabel}
            rules={[
              {
                required: true,
                message: SERVICE_MANAGEMENT_MESSAGES.ui.subServicesRequired,
              },
              {
                validator: (_, value) => {
                  if (value && value.length >= 2) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      SERVICE_MANAGEMENT_MESSAGES.ui.subServicesValidator
                    )
                  );
                },
              },
            ]}
            extra={SERVICE_MANAGEMENT_MESSAGES.ui.subServicesExtra}
          >
            <Select
              mode="multiple"
              placeholder={SERVICE_MANAGEMENT_MESSAGES.ui.subServicesPlaceholder}
              onChange={(selectedIds) => {
                // Manually set form field value
                form.setFieldsValue({ subServiceIds: selectedIds });
              }}
              notFoundContent={
                availableServices.length === 0
                  ? SERVICE_MANAGEMENT_MESSAGES.ui.loadingServices
                  : SERVICE_MANAGEMENT_MESSAGES.ui.noAvailableServices
              }
            >
              {availableServices.map((service) => {
                return (
                  <Option key={service.id} value={service.id}>
                    <div className="service-modal__option">
                      <span>{service.name}</span>
                      <span className="service-modal__price">
                        {service.price?.toLocaleString() || 0}đ
                      </span>
                    </div>
                  </Option>
                );
              })}
            </Select>
            {availableServices.length === 0 && (
              <div className="service-modal__hint">
                {SERVICE_MANAGEMENT_MESSAGES.ui.singleServicesHint}
              </div>
            )}
            {isComboService && (
              <div className="service-modal__summary">
                <div className="service-modal__summary-text">
                  {SERVICE_MANAGEMENT_MESSAGES.ui.comboPriceHint}
                </div>
                <div className="service-modal__summary-note">
                  {SERVICE_MANAGEMENT_MESSAGES.ui.comboDiscountHint}
                </div>
              </div>
            )}
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ServiceModal;
