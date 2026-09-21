// Ví dụ sử dụng Toast Utility trong các component

import { showToast, toastMessages } from './toast';

// ===== CÁCH SỬ DỤNG CƠ BẢN =====

// 1. Toast đơn giản
export const basicToastExamples = {
  success: () => showToast.success("Thành công!"),
  error: () => showToast.error("Có lỗi xảy ra!"),
  info: () => showToast.info("Thông tin quan trọng"),
  warning: () => showToast.warning("Cảnh báo!"),
};

// 2. Toast với preset messages
export const presetMessageExamples = {
  saveSuccess: () => showToast.success(toastMessages.success.save),
  saveError: () => showToast.error(toastMessages.error.save),
  loginSuccess: () => showToast.success(toastMessages.success.login),
  networkError: () => showToast.error(toastMessages.error.network),
};

// 3. Toast với custom config
export const customConfigExamples = {
  longDuration: () => showToast.success("Toast hiển thị lâu", { autoClose: 5000 }),
  topRight: () => showToast.info("Toast ở góc trên phải", { position: "top-right" }),
  noAutoClose: () => showToast.warning("Toast không tự đóng", { autoClose: false }),
};

// 4. Toast với icon
export const iconToastExamples = {
  successWithIcon: () => showToast.successWithIcon("Lưu thành công!", "💾"),
  errorWithIcon: () => showToast.errorWithIcon("Lỗi kết nối!", "🌐"),
};

// ===== CÁCH SỬ DỤNG NÂNG CAO =====

// 5. Loading toast
export const loadingToastExample = async () => {
  const toastId = showToast.loading("Đang xử lý...");
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update to success
    showToast.updateLoading(toastId, "Xử lý thành công!", "success");
  } catch {
    // Update to error
    showToast.updateLoading(toastId, "Xử lý thất bại!", "error");
  }
};

// 6. Dismiss toasts
export const dismissExamples = {
  dismissAll: () => showToast.dismissAll(),
  dismissSpecific: (toastId) => showToast.dismiss(toastId),
};

// ===== INTEGRATION VỚI API CALLS =====

// 7. Ví dụ với API call
export const apiCallExample = async (apiFunction, successMessage, errorMessage) => {
  const loadingToastId = showToast.loading("Đang tải...");
  
  try {
    const result = await apiFunction();
    showToast.updateLoading(loadingToastId, successMessage, "success");
    return result;
  } catch (error) {
    const errorMsg = error.response?.data?.message || errorMessage;
    showToast.updateLoading(loadingToastId, errorMsg, "error");
    throw error;
  }
};

// 8. Ví dụ sử dụng trong React component
export const componentExample = `
import React from 'react';
import { showToast, toastMessages } from '../utils/toast';

const MyComponent = () => {
  const handleSave = async () => {
    try {
      const loadingId = showToast.loading("Đang lưu...");
      
      // API call
      await saveData();
      
      showToast.updateLoading(loadingId, toastMessages.success.save, "success");
    } catch (error) {
      showToast.error(toastMessages.error.save);
    }
  };

  const handleDelete = () => {
    showToast.warning("Bạn có chắc chắn muốn xóa?", {
      autoClose: false,
      closeButton: true
    });
  };

  return (
    <div>
      <button onClick={handleSave}>Lưu</button>
      <button onClick={handleDelete}>Xóa</button>
    </div>
  );
};
`;

// ===== BEST PRACTICES =====

/*
BEST PRACTICES KHI SỬ DỤNG TOAST:

1. SỬ DỤNG PRESET MESSAGES:
   - Sử dụng toastMessages để đảm bảo consistency
   - Tránh hardcode message trong component

2. LOADING STATES:
   - Luôn sử dụng loading toast cho API calls
   - Update loading toast thành success/error

3. ERROR HANDLING:
   - Hiển thị error message từ API response
   - Fallback to generic error message

4. POSITIONING:
   - Mặc định: bottom-center (ít gây phiền nhiễu)
   - Top positions: cho notifications quan trọng
   - Bottom positions: cho feedback actions

5. DURATION:
   - Success: 2.5s (đủ để user nhận biết)
   - Error: 3s (lâu hơn để user đọc)
   - Warning: 3s hoặc không tự đóng
   - Loading: không tự đóng

6. ICONS:
   - Sử dụng emoji hoặc icon phù hợp
   - Giúp user nhận biết nhanh loại message

7. CUSTOM CONFIG:
   - Chỉ override khi thực sự cần thiết
   - Giữ consistency trong toàn bộ app
*/

export default {
  basicToastExamples,
  presetMessageExamples,
  customConfigExamples,
  iconToastExamples,
  loadingToastExample,
  dismissExamples,
  apiCallExample,
  componentExample,
};
