import React from "react";
import { Col, Form, Input, Modal, Row } from "antd";
import STAFF_BOOKING_MESSAGES from "./staffBookingMessages";

const { ui } = STAFF_BOOKING_MESSAGES;

const StaffMedicalInfoModal = ({
  form,
  onCancel,
  onSubmit,
  patient,
  visible,
}) => (
  <Modal
    title={ui.medicalModalTitle(patient?.customerName)}
    open={visible}
    onOk={() => form.validateFields().then(onSubmit)}
    onCancel={onCancel}
    okText={ui.update}
    cancelText={ui.cancel}
    width={800}
  >
    <Form form={form} layout="vertical">
      <Form.Item name="customerId" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="serviceId" hidden>
        <Input />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="allergies"
            label={ui.allergies}
            tooltip={ui.allergiesTooltip}
          >
            <Input.TextArea rows={3} placeholder={ui.allergiesPlaceholder} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="chronicConditions"
            label={ui.chronicConditions}
            tooltip={ui.chronicConditionsTooltip}
          >
            <Input.TextArea
              rows={3}
              placeholder={ui.chronicConditionsPlaceholder}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="familyHistory"
        label={ui.familyHistory}
        tooltip={ui.familyHistoryTooltip}
      >
        <Input.TextArea rows={2} placeholder={ui.familyHistoryPlaceholder} />
      </Form.Item>
      <Form.Item
        name="lifestyleNotes"
        label={ui.lifestyleNotes}
        tooltip={ui.lifestyleNotesTooltip}
      >
        <Input.TextArea rows={3} placeholder={ui.lifestyleNotesPlaceholder} />
      </Form.Item>
      <Form.Item
        name="specialNotes"
        label={ui.specialNotes}
        tooltip={ui.specialNotesTooltip}
      >
        <Input.TextArea rows={3} placeholder={ui.specialNotesPlaceholder} />
      </Form.Item>
      <Form.Item
        name="emergencyContact"
        label={ui.emergencyContact}
        tooltip={ui.emergencyContactTooltip}
      >
        <Input placeholder={ui.emergencyContactPlaceholder} />
      </Form.Item>
    </Form>
  </Modal>
);

export default StaffMedicalInfoModal;
