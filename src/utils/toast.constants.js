export const DEFAULT_TOAST_CONFIG = Object.freeze({
  position: "bottom-center",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  newestOnTop: false,
  rtl: false,
});

export const TOAST_MESSAGES = Object.freeze({
  success: Object.freeze({
    save: "Lưu thành công!",
    update: "Cập nhật thành công!",
    delete: "Xóa thành công!",
    create: "Tạo mới thành công!",
    login: "Đăng nhập thành công!",
    logout: "Đăng xuất thành công!",
    upload: "Tải lên thành công!",
    download: "Tải xuống thành công!",
  }),
  error: Object.freeze({
    save: "Lỗi khi lưu dữ liệu!",
    update: "Lỗi khi cập nhật!",
    delete: "Lỗi khi xóa!",
    create: "Lỗi khi tạo mới!",
    login: "Đăng nhập thất bại!",
    network: "Lỗi kết nối mạng!",
    permission: "Bạn không có quyền thực hiện hành động này!",
    validation: "Dữ liệu không hợp lệ!",
    upload: "Lỗi khi tải lên!",
    download: "Lỗi khi tải xuống!",
  }),
  info: Object.freeze({
    loading: "Đang tải dữ liệu...",
    processing: "Đang xử lý...",
    waiting: "Vui lòng đợi...",
  }),
  warning: Object.freeze({
    unsaved: "Bạn có thay đổi chưa được lưu!",
    confirm: "Bạn có chắc chắn muốn thực hiện hành động này?",
    limit: "Bạn đã đạt giới hạn cho phép!",
  }),
});
