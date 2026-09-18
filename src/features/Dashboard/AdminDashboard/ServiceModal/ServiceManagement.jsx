import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  message,
  Form,
} from "antd";
import {
  PlusOutlined,
} from "@ant-design/icons";
import {
  getServiceById as getServiceByIdRequest,
  getServices,
  createService as createServiceRequest,
  updateService as updateServiceRequest,
  activateService as activateServiceRequest,
  deactivateService as deactivateServiceRequest,
  createComboService as createComboServiceRequest,
} from "../../../catalog/catalogApi";
import NOTIFICATION_MESSAGES from "../../../../shared/constants/notificationMessages";
import ServiceModal from "./ServiceModal";
import ServiceDetailModal from "./ServiceDetailModal";
import { createServiceManagementColumns } from "./ServiceManagementColumns";
import { SERVICE_MANAGEMENT_MESSAGES } from "./serviceManagementMessages";
import "./ServiceManagement.css";

const getServiceTypeColor = (serviceType) => {
  switch (serviceType) {
    case "CONSULTING":
    case "CONSULTING_ON":
      return "blue";
    case "TESTING":
      return "green";
    case "EXAMINATION":
      return "orange";
    case "OTHER":
    default:
      return "default";
  }
};

const toArray = (data) => (Array.isArray(data) ? data : data ? [data] : []);

/**
 * Service Management Component
 * Handles all service-related operations
 */
const ServiceManagement = () => {
  // States
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [isServiceDetailModalVisible, setIsServiceDetailModalVisible] =
    useState(false);
  const [serviceDetail, setServiceDetail] = useState(null);
  const [isComboService, setIsComboService] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [form] = Form.useForm();

  // API Functions
  const fetchServiceById = async (id) => {
    try {
      const response = await getServiceByIdRequest(id);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy dịch vụ theo ID:", error);
      throw error;
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const response = await getServices();

      const data = toArray(response.data);

      // Chỉ lấy services: không phải combo (bỏ filter theo status)
      const filteredData = data.filter((service) => !service.isCombo);

      return filteredData;
    } catch (error) {
      console.error(" Lỗi lấy danh sách services:", error);
      message.error(NOTIFICATION_MESSAGES.SERVICE.COMBO_LOAD_FAILED);
      return [];
    }
  };

  const addService = async (service) => {
    try {
      const serviceData = {
        name: service.name,
        description: service.description,
        duration: service.duration ? parseInt(service.duration) : null,
        type: service.type,
        price: service.price ? parseFloat(service.price) : 0,
        discountPercent: service.discountPercent
          ? parseFloat(service.discountPercent)
          : 0,
        isCombo: service.isCombo || false,
        specializationIds: service.specializationIds || [],
        ...(service.isCombo &&
          service.subServiceIds &&
          service.subServiceIds.length > 0 && {
            subServiceIds: service.subServiceIds,
          }),
      };

      const response = await createServiceRequest(serviceData);
      return response.data;
    } catch (error) {
      console.error("Lỗi thêm dịch vụ:", error);
      throw error;
    }
  };

  const updateService = async (id, service) => {
    try {
      const serviceData = {
        name: service.name,
        description: service.description,
        duration: service.duration ? parseInt(service.duration) : null,
        type: service.type,
        price: service.price ? parseFloat(service.price) : 0,
        discountPercent: service.discountPercent
          ? parseFloat(service.discountPercent)
          : 0,
        specializationIds: service.specializationIds || [],
      };

      const response = await updateServiceRequest(id, serviceData);
      return response.data;
    } catch (error) {
      console.error("Lỗi sửa dịch vụ:", error);
      throw error;
    }
  };

  const deactivateService = async (id) => {
    try {
      await deactivateServiceRequest(id);
    } catch (error) {
      console.error("Lỗi vô hiệu hóa dịch vụ:", error);
      throw error;
    }
  };

  const activateService = async (id) => {
    try {
      await activateServiceRequest(id);
    } catch (error) {
      console.error("Lỗi kích hoạt dịch vụ:", error);
      throw error;
    }
  };

  const createComboService = async (serviceData) => {
    try {
      const response = await createComboServiceRequest(serviceData);
      return response.data;
    } catch (error) {
      console.error("Lỗi tạo combo service:", error);
      throw error;
    }
  };

  const searchServiceByName = async (name) => {
    try {
      const response = await getServices({ name });
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error(" Lỗi tìm kiếm service:", error);
      console.error(" Error response:", error.response?.data);
      console.error(" Error status:", error.response?.status);
      throw error;
    }
  };

  // Load services
  const loadServices = useCallback(async () => {
    try {
      const response = await getServices();
      const data = toArray(response.data);
      setServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
      message.error(NOTIFICATION_MESSAGES.SERVICE.LOAD_FAILED);
    }
  }, []);

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Handlers
  const handleAddService = () => {
    setEditingService(null);
    setIsComboService(false);
    form.resetFields();
    setIsServiceModalVisible(true);
  };

  const handleAddComboService = async () => {
    setEditingService(null);
    setIsComboService(true);
    form.resetFields();
    // Load available services for combo
    const services = await fetchAvailableServices();
    setAvailableServices(services);
    setIsServiceModalVisible(true);
  };

  const handleEditService = async (record) => {
    try {
      const serviceDetail = await fetchServiceById(record.id);
      setEditingService(serviceDetail);

      const formData = {
        ...serviceDetail,
        duration: serviceDetail.duration || null,
      };
      form.setFieldsValue(formData);
      setIsServiceModalVisible(true);
    } catch (error) {
      console.error("Lỗi lấy chi tiết dịch vụ:", error);
      message.error(NOTIFICATION_MESSAGES.SERVICE.DETAIL_LOAD_FAILED);
    }
  };

  const handleViewServiceDetail = async (record) => {
    try {
      const detail = await fetchServiceById(record.id);
      setServiceDetail(detail);
      setIsServiceDetailModalVisible(true);
    } catch (error) {
      console.error("Lỗi lấy chi tiết dịch vụ:", error);
      message.error(NOTIFICATION_MESSAGES.SERVICE.DETAIL_LOAD_FAILED);
    }
  };

  const handleToggleServiceStatus = async (record) => {
    try {
      if (record.isActive) {
        await deactivateService(record.id);
        message.success(NOTIFICATION_MESSAGES.SERVICE.DEACTIVATE_SUCCESS);
      } else {
        await activateService(record.id);
        message.success(NOTIFICATION_MESSAGES.SERVICE.ACTIVATE_SUCCESS);
      }

      await loadServices();
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái dịch vụ:", error);
      message.error(NOTIFICATION_MESSAGES.SERVICE.STATUS_UPDATE_FAILED);
    }
  };

  // Handle adding regular service
  const handleAddRegularService = async () => {
    try {
      const values = await form.validateFields();
      const serviceData = {
        name: values.name,
        description: values.description,
        duration: values.duration ? parseInt(values.duration) : null,
        type: values.type,
        price: values.price ? parseFloat(values.price) : 0,
        isCombo: false,
        specializationIds: values.specializationIds || [],
        discountPercent: values.discountPercent
          ? parseFloat(values.discountPercent)
          : 0,
      };

      await addService(serviceData);

      // Close modal and reset
      setIsServiceModalVisible(false);
      form.resetFields();
      setEditingService(null);
      setIsComboService(false);

      await loadServices();
      message.success(NOTIFICATION_MESSAGES.SERVICE.CREATE_SUCCESS);
    } catch (error) {
      console.error(" Lỗi tạo dịch vụ thường:", error);
      message.error(NOTIFICATION_MESSAGES.SERVICE.CREATE_FAILED);
    }
  };

  // Handle submitting combo service form
  const handleSubmitComboService = async () => {
    try {
      const values = await form.validateFields();
      const comboData = {
        name: values.name,
        description: values.description,
        duration: values.duration ? parseInt(values.duration) : null,
        type: values.type,
        isCombo: true,
        specializationIds: values.specializationIds || [],
        subServiceIds: values.subServiceIds || [],
        discountPercent: values.discountPercent
          ? parseFloat(values.discountPercent)
          : 0,
      };

      await createComboService(comboData);

      // Close modal and reset
      setIsServiceModalVisible(false);
      form.resetFields();
      setEditingService(null);
      setIsComboService(false);

      await loadServices();
      message.success(NOTIFICATION_MESSAGES.SERVICE.COMBO_CREATE_SUCCESS);
    } catch (error) {
      console.error(" Lỗi tạo gói dịch vụ:", error);
      message.error(NOTIFICATION_MESSAGES.SERVICE.COMBO_CREATE_FAILED);
    }
  };

  // Handle updating existing service
  const handleUpdateService = async () => {
    try {
      const values = await form.validateFields();
      await updateService(editingService.id, values);

      // Close modal and reset
      setIsServiceModalVisible(false);
      form.resetFields();
      setEditingService(null);
      setIsComboService(false);

      await loadServices();
      message.success(NOTIFICATION_MESSAGES.SERVICE.UPDATE_SUCCESS);
    } catch (error) {
      console.error(" Lỗi cập nhật dịch vụ:", error);
      message.error(NOTIFICATION_MESSAGES.SERVICE.UPDATE_FAILED);
    }
  };

  // Main handler that routes to appropriate function
  const handleServiceModalOk = async () => {
    if (editingService) {
      await handleUpdateService();
    } else if (isComboService) {
      await handleSubmitComboService();
    } else {
      await handleAddRegularService();
    }
  };

  const handleServiceModalCancel = () => {
    setIsServiceModalVisible(false);
    setEditingService(null);
    form.resetFields();
    setIsComboService(false);
  };

  const handleServiceDetailModalCancel = () => {
    setIsServiceDetailModalVisible(false);
    setServiceDetail(null);
  };

  // Handle search service
  const handleSearchService = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      setSearchTerm("");
      return;
    }

    try {
      setIsSearching(true);
      setSearchTerm(value);
      const results = await searchServiceByName(value.trim());
      const searchData = toArray(results);
      setSearchResults(searchData);
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      setSearchResults([]);
      message.error(NOTIFICATION_MESSAGES.SERVICE.NOT_FOUND);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const serviceColumns = createServiceManagementColumns({
    getServiceTypeColor,
    onEdit: handleEditService,
    onToggleStatus: handleToggleServiceStatus,
    onViewDetail: handleViewServiceDetail,
  });

  return (
    <>
      <Card
        title={SERVICE_MANAGEMENT_MESSAGES.ui.title}
        extra={
          <Space>
            <Input.Search
              placeholder={SERVICE_MANAGEMENT_MESSAGES.ui.searchPlaceholder}
              allowClear
              loading={isSearching}
              onSearch={handleSearchService}
              onChange={(e) => {
                if (!e.target.value) {
                  handleClearSearch();
                }
              }}
              className="service-management__search"
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddService}
            >
              {SERVICE_MANAGEMENT_MESSAGES.ui.addService}
            </Button>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={handleAddComboService}
              className="service-management__combo-button"
            >
              {SERVICE_MANAGEMENT_MESSAGES.ui.addComboService}
            </Button>
          </Space>
        }
      >
        {searchTerm && (
          <div className="service-management__search-summary">
            <Tag color="blue">
              Kết quả tìm kiếm cho: "{searchTerm}" ({searchResults.length} tìm
              thấy)
            </Tag>
            <Button type="link" size="small" onClick={handleClearSearch}>
              {SERVICE_MANAGEMENT_MESSAGES.ui.clearSearch}
            </Button>
          </div>
        )}
        <Table
          columns={serviceColumns}
          dataSource={searchTerm ? searchResults : services}
          rowKey="id"
          locale={{
            emptyText: searchTerm
              ? SERVICE_MANAGEMENT_MESSAGES.ui.noSearchResults(searchTerm)
              : SERVICE_MANAGEMENT_MESSAGES.ui.noServices,
          }}
        />
      </Card>

      {/* Service Modal */}
      <ServiceModal
        visible={isServiceModalVisible}
        onOk={handleServiceModalOk}
        onCancel={handleServiceModalCancel}
        form={form}
        editingService={editingService}
        isComboService={isComboService}
        setIsComboService={setIsComboService}
        availableServices={availableServices}
        setAvailableServices={setAvailableServices}
      />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        visible={isServiceDetailModalVisible}
        onCancel={handleServiceDetailModalCancel}
        serviceDetail={serviceDetail}
      />
    </>
  );
};

export default ServiceManagement;
