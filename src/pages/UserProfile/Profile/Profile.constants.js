import dayjs from "dayjs";
import NOTIFICATION_MESSAGES from "../../../shared/constants/notificationMessages";

export const PROFILE_ROLES = {
  CONSULTANT: "CONSULTANT",
};

export const PROFILE_MESSAGES = NOTIFICATION_MESSAGES.PROFILE;

export const PROFILE_TEXT = {
  TITLE: "Hồ sơ cá nhân",
  EDIT: "Chỉnh sửa",
  SAVE: "Lưu thay đổi",
  CANCEL: "Hủy",
  NAME_FALLBACK: "Chưa có tên",
  FULLNAME_LABEL: "Họ và tên",
  FULLNAME_PLACEHOLDER: "Nhập họ và tên",
  PHONE_LABEL: "Số điện thoại",
  PHONE_PLACEHOLDER: "Nhập số điện thoại",
  DATE_OF_BIRTH_LABEL: "Ngày sinh",
  DATE_OF_BIRTH_PLACEHOLDER: "Chọn ngày sinh",
  GENDER_LABEL: "Giới tính",
  GENDER_PLACEHOLDER: "Chọn giới tính",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "Email không thể thay đổi",
  ADDRESS_LABEL: "Địa chỉ",
  ADDRESS_PLACEHOLDER: "Nhập địa chỉ",
  GENDER_OPTIONS: [
    { value: "MALE", label: "Nam" },
    { value: "FEMALE", label: "Nữ" },
    { value: "OTHER", label: "Khác" },
  ],
};

export const PROFILE_VALIDATION = {
  FULLNAME_REQUIRED: "Vui lòng nhập họ và tên!",
  PHONE_REQUIRED: "Vui lòng nhập số điện thoại!",
  PHONE_INVALID: "Số điện thoại không hợp lệ!",
};

export const CERTIFICATE_SECTION_TEXT = {
  TITLE: "Chứng chỉ",
  MANAGE: "Quản lý chứng chỉ",
};

export const PROFILE_FORM_FIELDS = [
  "fullname",
  "phone",
  "address",
  "gender",
  "dateOfBirth",
];

export const toProfileFormValues = (user) => ({
  fullname: user?.fullname || "",
  phone: user?.phone || "",
  address: user?.address || "",
  gender: user?.gender || "",
  dateOfBirth: user?.dateOfBirth ? dayjs(user.dateOfBirth) : null,
});
