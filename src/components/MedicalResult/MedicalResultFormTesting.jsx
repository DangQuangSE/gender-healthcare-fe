import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  ConfigProvider,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Space,
  Typography,
  Tag,
  message,
} from "antd";
import {
  ExperimentOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import customParseFormat from "dayjs/plugin/customParseFormat";
// import locale from "antd/es/date-picker/locale/vi_VN";
import { submitLabTestResult } from "../../features/medical/medicalResultApi";
import "./MedicalResultFormTesting.css";
import { getTreatmentProtocols } from "../../features/medical/medicalApi";
import {
  MEDICAL_RESULT_MESSAGES,
} from "../../features/medical/medicalResultMessages";
import { getApiErrorMessage } from "../../shared/api/errors";

dayjs.extend(customParseFormat);
dayjs.locale("vi");

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

/**
 * Medical Result Form for Testing Services
 * Form chuyên dụng cho dịch vụ xét nghiệm
 */

const MedicalResultFormTesting = ({
  appointmentDetail,
  onSuccess,
  onCancel,
  initialData = {},
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingProtocols, setLoadingProtocols] = useState(false);
  const [treatmentProtocols, setTreatmentProtocols] = useState([]);

  // Fetch treatment protocols
  const fetchTreatmentProtocols = async () => {
    try {
      setLoadingProtocols(true);
      const response = await getTreatmentProtocols();
      setTreatmentProtocols(response.data || []);
    } catch {
      setTreatmentProtocols([]);
    } finally {
      setLoadingProtocols(false);
    }
  };

  // Load treatment protocols on component mount
  useEffect(() => {
    fetchTreatmentProtocols();
  }, []);

  // Set initial form values
  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const formValues = { ...initialData };
      if (formValues.sampleCollectedAt) {
        formValues.sampleCollectedAt = dayjs(formValues.sampleCollectedAt);
      }
      form.setFieldsValue(formValues);
    }
  }, [form, initialData]);
  const handleFieldChange = (field, value) => {
    form.setFieldValue(field, value);
  };
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Convert dayjs to ISO string
      const submitData = {
        ...values,
        appointmentDetailId: appointmentDetail?.id,
        resultType: "LAB_TEST",
        sampleCollectedAt: values.sampleCollectedAt
          ? dayjs(values.sampleCollectedAt).toISOString()
          : null,
        treatmentProtocolId: values.treatmentProtocolId || null,
      };

      const response = await submitLabTestResult(submitData);
      message.success(MEDICAL_RESULT_MESSAGES.LAB_SAVE_SUCCESS);
      onSuccess?.(response.data);
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        MEDICAL_RESULT_MESSAGES.LAB_SAVE_ERROR_FALLBACK
      );

      message.error(MEDICAL_RESULT_MESSAGES.SAVE_FAILED(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info(MEDICAL_RESULT_MESSAGES.FORM_RESET);
  };

  return (
    <Card
      className="medical-result-form-testing"
      title={
        <div className="form-title">
          <ExperimentOutlined />
          <span>Kết quả xét nghiệm</span>
          {appointmentDetail && <Tag color="blue">#{appointmentDetail.id}</Tag>}
        </div>
      }
      extra={
        <div className="form-extra-buttons">
          <Button
            className="reset-button"
            icon={<ReloadOutlined />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button className="cancel-button" onClick={onCancel}>
            Hủy
          </Button>
        </div>
      }
    >
      {/* Patient Info */}
      {appointmentDetail && (
        <Alert
          className="patient-info-alert"
          message="Thông tin bệnh nhân"
          description={
            <div>
              <Text strong>Dịch vụ: </Text>
              {appointmentDetail.serviceName}
              <br />
              <Text strong>Loại dịch vụ: </Text>
              TESTING
              <br />
              <Text strong>Bệnh nhân: </Text>
              {appointmentDetail.customerName || "N/A"}
              <br />
              <Text strong>Thời gian: </Text>
              {new Date(appointmentDetail.slotTime).toLocaleDateString("vi-VN")}
            </div>
          }
          type="info"
          showIcon
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={() => {
          message.error(MEDICAL_RESULT_MESSAGES.FORM_VALIDATION_FAILED);
        }}
      >
        <Row gutter={24}>
          {/* Left Column - Thông tin xét nghiệm */}
          <Col span={12}>
            <Card
              className="form-section-card test-info-section"
              size="small"
              title="Thông tin xét nghiệm"
            >
              <Form.Item
                name="testName"
                label="Tên xét nghiệm"
                rules={[
                  {
                    required: true,
                    message:
                      MEDICAL_RESULT_MESSAGES.VALIDATION.TEST_NAME_REQUIRED,
                  },
                ]}
              >
                <Input placeholder="Ví dụ: HIV Ag/Ab Combo Test" />
              </Form.Item>

              <Form.Item
                name="testMethod"
                label="Phương pháp xét nghiệm"
                rules={[
                  {
                    required: true,
                    message: MEDICAL_RESULT_MESSAGES.VALIDATION.TEST_METHOD_REQUIRED,
                  },
                ]}
              >
                <Select placeholder="Chọn phương pháp">
                  <Option value="ELISA">ELISA</Option>
                  <Option value="PCR">PCR</Option>
                  <Option value="Western Blot">Western Blot</Option>
                  <Option value="Rapid Test">Rapid Test</Option>
                  <Option value="Culture">Culture</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="specimenType"
                label="Loại mẫu bệnh phẩm"
                rules={[
                  {
                    required: true,
                    message:
                      MEDICAL_RESULT_MESSAGES.VALIDATION.SPECIMEN_TYPE_REQUIRED,
                  },
                ]}
              >
                <Select placeholder="Chọn loại mẫu">
                  <Option value="Blood">Máu</Option>
                  <Option value="Urine">Nước tiểu</Option>
                  <Option value="Saliva">Nước bọt</Option>
                  <Option value="Swab">Dịch tiết</Option>
                  <Option value="Tissue">Mô</Option>
                </Select>
              </Form.Item>

              {/* <Form.Item
                name="sampleCollectedAt"
                label="Thời gian lấy mẫu"
                rules={[
                  {
                    required: true,
                    message:
                      MEDICAL_RESULT_MESSAGES.VALIDATION.SAMPLE_TIME_REQUIRED,
                  },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject(
                          new Error("Vui lòng chọn thời gian lấy mẫu!")
                        );
                      }
                      if (!dayjs.isDayjs(value) && !dayjs(value).isValid()) {
                        return Promise.reject(
                          new Error("Thời gian lấy mẫu không hợp lệ!")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <ConfigProvider locale={locale}>
                  <DatePicker
                    className="date-picker-full-width"
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn thời gian lấy mẫu"
                    style={{ width: "100%" }}
                    allowClear
                  />
                </ConfigProvider>
              </Form.Item> */}
            </Card>
          </Col>

          {/* Right Column - Kết quả */}
          <Col span={12}>
            <Card
              className="form-section-card test-result-section"
              size="small"
              title="Kết quả xét nghiệm"
            >
              <Form.Item
                name="testResult"
                label="Kết quả"
                rules={[
                  {
                    required: true,
                    message: MEDICAL_RESULT_MESSAGES.VALIDATION.TEST_RESULT_REQUIRED,
                  },
                ]}
              >
                <Input placeholder="Ví dụ: Non-reactive" />
              </Form.Item>

              <Form.Item
                name="normalRange"
                label="Giá trị tham chiếu"
                rules={[
                  {
                    required: true,
                    message:
                      MEDICAL_RESULT_MESSAGES.VALIDATION.NORMAL_RANGE_REQUIRED,
                  },
                ]}
              >
                <Input placeholder="Ví dụ: Non-reactive" />
              </Form.Item>

              <Form.Item
                name="testStatus"
                label="Trạng thái kết quả"
                rules={[
                  {
                    required: true,
                    message: MEDICAL_RESULT_MESSAGES.VALIDATION.TEST_STATUS_REQUIRED,
                  },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="NORMAL">Bình thường</Option>
                  <Option value="ABNORMAL">Bất thường</Option>
                  <Option value="CRITICAL">Nguy hiểm</Option>
                  <Option value="PENDING">Chờ kết quả</Option>
                  <Option value="INVALID">Không hợp lệ</Option>
                </Select>
              </Form.Item>

              <Form.Item name="labNotes" label="Ghi chú phòng lab">
                <TextArea
                  className="form-field-textarea"
                  rows={3}
                  placeholder="Ví dụ: Mẫu đạt chất lượng, kết quả tin cậy"
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* Clinical Assessment */}
        <Card
          className="clinical-assessment-card clinical-assessment-section"
          size="small"
          title="Đánh giá lâm sàng"
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="description"
                label="Mô tả triệu chứng"
                rules={[
                  {
                    required: true,
                    message:
                      MEDICAL_RESULT_MESSAGES.VALIDATION.DESCRIPTION_REQUIRED,
                  },
                  {
                    min: 10,
                    message: MEDICAL_RESULT_MESSAGES.VALIDATION.DESCRIPTION_MIN,
                  },
                ]}
              >
                <TextArea
                  className="form-field-textarea"
                  rows={4}
                  placeholder="Ví dụ: Kiểm tra định kỳ HIV theo yêu cầu của bệnh nhân"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="diagnosis"
                label="Chẩn đoán"
                rules={[
                  {
                    required: true,
                    message: MEDICAL_RESULT_MESSAGES.VALIDATION.DIAGNOSIS_REQUIRED,
                  },
                  {
                    min: 10,
                    message: MEDICAL_RESULT_MESSAGES.VALIDATION.DIAGNOSIS_MIN,
                  },
                ]}
              >
                <TextArea
                  className="form-field-textarea"
                  rows={4}
                  placeholder="Ví dụ: Âm tính với HIV, không phát hiện kháng thể"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="treatmentPlan"
                label="Kế hoạch điều trị"
                rules={[
                  {
                    required: true,
                    message:
                      MEDICAL_RESULT_MESSAGES.VALIDATION.TREATMENT_PLAN_REQUIRED,
                  },
                  {
                    min: 10,
                    message: MEDICAL_RESULT_MESSAGES.VALIDATION.TREATMENT_PLAN_MIN,
                  },
                ]}
              >
                <TextArea
                  className="form-field-textarea"
                  rows={4}
                  placeholder="Ví dụ: Không cần điều trị, kiểm tra lại sau 6 tháng"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="treatmentProtocolId"
                label="Phác đồ điều trị"
                extra="Chọn phác đồ điều trị có sẵn (không bắt buộc)"
              >
                <Select
                  placeholder="Chọn phác đồ điều trị..."
                  loading={loadingProtocols}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  onChange={(value) =>
                    handleFieldChange("treatmentProtocolId", value)
                  }
                >
                  {treatmentProtocols.map((protocol) => (
                    <Option key={protocol.id} value={protocol.id}>
                      {protocol.diseaseName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Submit Buttons */}
        <div className="submit-buttons-container">
          <Space>
            <Button className="cancel-button" onClick={onCancel}>
              Hủy
            </Button>
            <Button
              className="submit-button"
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Lưu kết quả xét nghiệm
            </Button>
          </Space>
        </div>
      </Form>
    </Card>
  );
};

export default MedicalResultFormTesting;
