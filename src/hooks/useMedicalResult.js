import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  submitMedicalResult,
  validateMedicalResultData,
  formatMedicalResultForAPI,
} from "../features/medical/medicalResultApi";
import { MEDICAL_RESULT_MESSAGES } from "../features/medical/medicalResultMessages";

/**
 * Custom hook for managing medical result operations
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export const useMedicalResult = (options = {}) => {
  const { onSuccess, onError } = options;

  // State management
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [lastSubmittedResult, setLastSubmittedResult] = useState(null);

  /**
   * Submit medical result
   * @param {Object} formData - Form data from UI
   * @returns {Promise<Object>} Submission result
   */
  const submitResult = useCallback(
    async (formData) => {
      try {
        setSubmitting(true);
        setErrors({});
        setWarnings({});

        // Validate data
        const validation = validateMedicalResultData(formData);

        if (!validation.isValid) {
          setErrors(validation.errors);
          setWarnings(validation.warnings);

          const errorMessages = Object.values(validation.errors);
          toast.error(MEDICAL_RESULT_MESSAGES.INVALID_DATA(errorMessages));

          return {
            success: false,
            errors: validation.errors,
            warnings: validation.warnings,
          };
        }

        // Show warnings if any
        if (Object.keys(validation.warnings).length > 0) {
          setWarnings(validation.warnings);
          const warningMessages = Object.values(validation.warnings);
          toast.warning(MEDICAL_RESULT_MESSAGES.WARNING(warningMessages));
        }

        // Format data for API
        const apiData = formatMedicalResultForAPI(formData);

        // Submit to API
        const response = await submitMedicalResult(apiData);

        // Update state
        setLastSubmittedResult(response.data);

        // Show success message
        toast.success(MEDICAL_RESULT_MESSAGES.SAVE_SUCCESS);

        // Call success callback
        if (onSuccess) {
          onSuccess(response.data);
        }

        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          MEDICAL_RESULT_MESSAGES.SAVE_ERROR_FALLBACK;

        setErrors({
          submit: errorMessage,
        });

        toast.error(MEDICAL_RESULT_MESSAGES.ERROR(errorMessage));

        // Call error callback
        if (onError) {
          onError(error);
        }

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setSubmitting(false);
      }
    },
    [onSuccess, onError]
  );

  /**
   * Clear errors and warnings
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setWarnings({});
  }, []);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setSubmitting(false);
    setErrors({});
    setWarnings({});
    setLastSubmittedResult(null);
  }, []);

  /**
   * Validate form data without submitting
   * @param {Object} formData - Form data to validate
   * @returns {Object} Validation result
   */
  const validateForm = useCallback((formData) => {
    const validation = validateMedicalResultData(formData);
    setErrors(validation.errors);
    setWarnings(validation.warnings);
    return validation;
  }, []);

  return {
    // State
    loading,
    submitting,
    errors,
    warnings,
    lastSubmittedResult,

    // Methods
    submitResult,
    clearErrors,
    reset,
    validateForm,

    // Computed state
    hasErrors: Object.keys(errors).length > 0,
    hasWarnings: Object.keys(warnings).length > 0,
    isValid: Object.keys(errors).length === 0,
  };
};

/**
 * Hook for managing medical result form state
 * @param {Object} initialData - Initial form data
 * @returns {Object} Form state and methods
 */
export const useMedicalResultForm = (initialData = {}) => {
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      // === REQUIRED FIELDS ===
      appointmentDetailId: "",
      resultType: "LAB_TEST", // CONSULTATION or LAB_TEST

      // === THÔNG TIN CHUNG (required) ===
      description: "", // Mô tả triệu chứng/vấn đề (min 10 chars)
      diagnosis: "", // Chẩn đoán (min 10 chars)
      treatmentPlan: "", // Kế hoạch điều trị (min 10 chars)

      // === THÔNG TIN XÉT NGHIỆM (optional, only for LAB_TEST) ===
      testName: "", // Tên xét nghiệm
      testResult: "", // Kết quả xét nghiệm
      normalRange: "", // Giá trị bình thường
      testMethod: "", // Phương pháp xét nghiệm
      specimenType: "Blood", // Loại mẫu: Blood, Urine, Saliva, etc.
      testStatus: "NORMAL", // NORMAL, ABNORMAL, CRITICAL, PENDING, INVALID
      sampleCollectedAt: new Date().toISOString(), // Thời gian lấy mẫu
      labNotes: "", // Ghi chú từ phòng lab

      ...initialData,
    };

    // No complex date validation needed anymore

    return defaultData;
  });

  /**
   * Update form field
   * @param {string} field - Field name
   * @param {any} value - Field value
   */
  const updateField = useCallback((field, value) => {
    setFormData((prev) => {
      let processedValue = value;

      // No special date handling needed anymore - all fields are simple

      return {
        ...prev,
        [field]: processedValue,
      };
    });
  }, []);

  /**
   * Update multiple fields
   * @param {Object} updates - Object with field updates
   */
  const updateFields = useCallback((updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData({
      appointmentDetailId: "",
      resultType: "LAB_TEST",
      description: "",
      diagnosis: "",
      treatmentPlan: "",
      testName: "",
      testResult: "",
      normalRange: "",
      testMethod: "",
      specimenType: "Blood",
      testStatus: "NORMAL",
      sampleCollectedAt: new Date().toISOString(), // Restored sampleCollectedAt field
      labNotes: "",
      ...initialData,
    });
  }, [initialData]);

  /**
   * Check if form has been modified
   */
  const isDirty = useCallback(() => {
    const initialKeys = Object.keys(initialData);
    const currentKeys = Object.keys(formData);

    if (initialKeys.length !== currentKeys.length) return true;

    return initialKeys.some((key) => formData[key] !== initialData[key]);
  }, [formData, initialData]);

  return {
    formData,
    updateField,
    updateFields,
    resetForm,
    isDirty: isDirty(),
  };
};
