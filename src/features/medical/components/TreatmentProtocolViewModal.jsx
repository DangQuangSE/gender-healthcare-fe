import React from "react";
import { Button, Modal } from "antd";
import { TREATMENT_PROTOCOL_MESSAGES } from "../medicalMessages";

const TreatmentProtocolViewModal = ({ visible, onClose, protocol }) => {
  const fields = [
    [TREATMENT_PROTOCOL_MESSAGES.DISEASE_NAME, protocol?.diseaseName],
    [TREATMENT_PROTOCOL_MESSAGES.DIAGNOSIS, protocol?.diagnosis],
    [TREATMENT_PROTOCOL_MESSAGES.TREATMENT, protocol?.treatment],
    [TREATMENT_PROTOCOL_MESSAGES.FOLLOW_UP, protocol?.followUp],
  ];

  if (protocol?.notes) {
    fields.push([TREATMENT_PROTOCOL_MESSAGES.NOTES, protocol.notes]);
  }

  return (
    <Modal
      title={TREATMENT_PROTOCOL_MESSAGES.TITLE}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          {TREATMENT_PROTOCOL_MESSAGES.CLOSE}
        </Button>,
      ]}
      width={700}
    >
      {protocol && (
        <div style={{ padding: "16px 0" }}>
          {fields.map(([label, value]) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <strong>{label}:</strong>
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default TreatmentProtocolViewModal;
