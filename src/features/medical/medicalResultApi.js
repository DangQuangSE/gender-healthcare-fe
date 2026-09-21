import apiClient from "../../shared/api/client";
import MEDICAL_RESULT_VALIDATION_MESSAGES from "./medicalResultMessages";

export const submitMedicalResult = (result) =>
  apiClient.post("/v1/medical-results/consultations", result);

export const getMedicalResult = (resultId) =>
  apiClient.get(`/v1/medical-results/${resultId}`);

export const updateMedicalResult = (resultId, result) =>
  apiClient.put(`/v1/medical-results/${resultId}`, result);

export const deleteMedicalResult = (resultId) =>
  apiClient.delete(`/v1/medical-results/${resultId}`);

export const submitLabTestResult = (result) =>
  apiClient.post("/v1/medical-results/lab-tests", result);

export const submitConsultationResult = (result) =>
  apiClient.post("/v1/medical-results/consultations", result);

export const getMedicalResultsByAppointmentDetail = (appointmentDetailId) =>
  apiClient.get(
    `/v1/medical-results/appointment-details/${appointmentDetailId}`
  );

export const validateMedicalResultData = (result = {}) => {
  const errors = {};
  const warnings = {};
  const messages = MEDICAL_RESULT_VALIDATION_MESSAGES;
  const requiredFields = [
    ["appointmentDetailId", messages.APPOINTMENT_DETAIL_REQUIRED],
    ["resultType", messages.RESULT_TYPE_REQUIRED],
    ["testName", messages.TEST_NAME_REQUIRED],
    ["testResult", messages.TEST_RESULT_REQUIRED],
    ["testStatus", messages.TEST_STATUS_REQUIRED],
  ];

  requiredFields.forEach(([field, message]) => {
    if (!result[field]) {
      errors[field] = message;
    }
  });

  if (!result.diagnosis) {
    warnings.diagnosis = messages.DIAGNOSIS_RECOMMENDED;
  }

  if (!result.treatmentPlan) {
    warnings.treatmentPlan = messages.TREATMENT_PLAN_RECOMMENDED;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

export const formatMedicalResultForAPI = (formData = {}) => ({
  appointmentDetailId: Number.parseInt(formData.appointmentDetailId, 10),
  resultType: formData.resultType || "LAB_TEST",
  description: formData.description || "",
  diagnosis: formData.diagnosis || "",
  treatmentPlan: formData.treatmentPlan || "",
  testName: formData.testName || "",
  testResult: formData.testResult || "",
  normalRange: formData.normalRange || "",
  testMethod: formData.testMethod || "",
  specimenType: formData.specimenType || "",
  testStatus: formData.testStatus || "PENDING",
  sampleCollectedAt: formData.sampleCollectedAt || new Date().toISOString(),
  labNotes: formData.labNotes || "",
  treatmentProtocolId: formData.treatmentProtocolId || null,
});
