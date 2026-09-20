import NOTIFICATION_MESSAGES from "../../../shared/constants/notificationMessages";

export const CERTIFICATE_MESSAGES = {
  ...NOTIFICATION_MESSAGES.CERTIFICATE,
  IMAGE_REQUIRED: "Vui lòng chọn hình ảnh chứng chỉ",
};

export const CERTIFICATE_TEXT = {
  EDIT_TITLE: "Chỉnh sửa chứng chỉ",
  MANAGE_TITLE: "Quản lý chứng chỉ",
  CANCEL: "Hủy",
  UPDATE: "Cập nhật",
  SAVE: "Lưu",
  ITEM_TITLE: (index) => `Chứng chỉ #${index + 1}`,
  NAME_LABEL: "Tên chứng chỉ",
  NAME_PLACEHOLDER: "Ví dụ: Chứng chỉ tiếng Anh IELTS",
  ISSUER_LABEL: "Đơn vị cấp",
  ISSUER_PLACEHOLDER: "Ví dụ: British Council",
  DATE_LABEL: "Ngày cấp",
  DATE_PLACEHOLDER: "Chọn ngày cấp",
  IMAGE_LABEL: "Hình ảnh chứng chỉ",
  CHANGE_IMAGE: "Thay đổi ảnh",
  CHOOSE_IMAGE: "Chọn ảnh",
  ADD: "Thêm chứng chỉ",
  IMAGE_ALT: "Chứng chỉ",
};

export const createEmptyCertificate = () => ({
  name: "",
  issuer: "",
  date: null,
  imageUrl: "",
  imageFile: null,
});

export const normalizeCertificates = (certificates = []) =>
  certificates.length
    ? certificates.map((certificate) => ({
        ...certificate,
        imageFile: null,
      }))
    : [createEmptyCertificate()];
