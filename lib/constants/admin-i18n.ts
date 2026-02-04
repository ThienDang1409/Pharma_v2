/**
 * Admin Dashboard - Vietnamese Text Constants
 * Tất cả text hiển thị trong Admin Dashboard
 */

export const ADMIN_TEXT = {
  // Common Actions
  ACTIONS: {
    ADD: 'Thêm mới',
    EDIT: 'Chỉnh sửa',
    DELETE: 'Xóa',
    SAVE: 'Lưu',
    CANCEL: 'Hủy',
    SUBMIT: 'Gửi',
    BACK: 'Quay lại',
    SEARCH: 'Tìm kiếm',
    FILTER: 'Lọc',
    EXPORT: 'Xuất',
    IMPORT: 'Nhập',
    REFRESH: 'Làm mới',
    VIEW: 'Xem',
  },

  // Status
  STATUS: {
    LABEL: 'Trạng thái',
    DRAFT: 'Nháp',
    PUBLISHED: 'Đã xuất bản',
    ACTIVE: 'Hoạt động',
    INACTIVE: 'Không hoạt động',
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
  },

  // Blog/News Management
  BLOG: {
    TITLE: 'Quản lý bài viết',
    ADD_NEW: 'Thêm bài viết mới',
    EDIT_BLOG: 'Chỉnh sửa bài viết',
    BLOG_LIST: 'Danh sách bài viết',
    BLOG_TITLE: 'Tiêu đề bài viết',
    BLOG_TITLE_EN: 'Tiêu đề (English)',
    AUTHOR: 'Tác giả',
    CATEGORY: 'Danh mục',
    FEATURED_IMAGE: 'Hình đại diện',
    EXCERPT: 'Mô tả ngắn',
    EXCERPT_EN: 'Mô tả ngắn (English)',
    CONTENT: 'Nội dung',
    CONTENT_EN: 'Nội dung (English)',
    TAGS: 'Tags',
    SLUG: 'Đường dẫn (slug)',
    IS_PRODUCT: 'Đây là sản phẩm',
    PUBLISH_DATE: 'Ngày xuất bản',
    SAVE_DRAFT: 'Lưu nháp',
    PUBLISH_NOW: 'Xuất bản ngay',
    ADD_SECTION: 'Thêm section',
    SECTION_TITLE: 'Tiêu đề section',
    SECTION_CONTENT: 'Nội dung section',
  },

  // Category/Information Management
  CATEGORY: {
    TITLE: 'Quản lý danh mục',
    ADD_NEW: 'Thêm danh mục mới',
    EDIT_CATEGORY: 'Chỉnh sửa danh mục',
    CATEGORY_LIST: 'Danh sách danh mục',
    CATEGORY_NAME: 'Tên danh mục',
    CATEGORY_NAME_EN: 'Tên danh mục (English)',
    PARENT_CATEGORY: 'Danh mục cha',
    DESCRIPTION: 'Mô tả',
    DESCRIPTION_EN: 'Mô tả (English)',
    ICON: 'Icon',
    ORDER: 'Thứ tự',
    SELECT_CATEGORY: 'Chọn danh mục...',
  },

  // Image Management
  IMAGE: {
    TITLE: 'Quản lý hình ảnh',
    UPLOAD_IMAGE: 'Tải lên hình ảnh',
    SELECT_IMAGE: 'Chọn hình ảnh',
    IMAGE_GALLERY: 'Thư viện hình ảnh',
    FILE_NAME: 'Tên file',
    FILE_SIZE: 'Kích thước',
    DIMENSIONS: 'Kích thước (px)',
    UPLOADED_BY: 'Người tải lên',
    UPLOADED_AT: 'Ngày tải lên',
    FOLDER: 'Thư mục',
    DESCRIPTION: 'Mô tả',
    USED_IN: 'Được sử dụng trong',
    UNUSED_IMAGES: 'Hình ảnh chưa sử dụng',
  },

  // User Management
  USER: {
    TITLE: 'Quản lý người dùng',
    USER_LIST: 'Danh sách người dùng',
    ADD_USER: 'Thêm người dùng',
    EDIT_USER: 'Chỉnh sửa người dùng',
    EMAIL: 'Email',
    NAME: 'Họ tên',
    PHONE: 'Số điện thoại',
    ADDRESS: 'Địa chỉ',
    ROLE: 'Vai trò',
    PASSWORD: 'Mật khẩu',
    CURRENT_PASSWORD: 'Mật khẩu hiện tại',
    NEW_PASSWORD: 'Mật khẩu mới',
    CONFIRM_PASSWORD: 'Xác nhận mật khẩu',
    LAST_LOGIN: 'Đăng nhập lần cuối',
  },

  // Dashboard
  DASHBOARD: {
    TITLE: 'Bảng điều khiển',
    WELCOME: 'Chào mừng trở lại',
    OVERVIEW: 'Tổng quan',
    STATISTICS: 'Thống kê',
    RECENT_ACTIVITY: 'Hoạt động gần đây',
    TOTAL_BLOGS: 'Tổng số bài viết',
    TOTAL_CATEGORIES: 'Tổng số danh mục',
    TOTAL_IMAGES: 'Tổng số hình ảnh',
    TOTAL_USERS: 'Tổng số người dùng',
    PUBLISHED_BLOGS: 'Bài viết đã xuất bản',
    DRAFT_BLOGS: 'Bài viết nháp',
  },

  // Messages
  MESSAGE: {
    SUCCESS: {
      CREATED: 'Tạo mới thành công!',
      UPDATED: 'Cập nhật thành công!',
      DELETED: 'Xóa thành công!',
      SAVED: 'Lưu thành công!',
      PUBLISHED: 'Xuất bản thành công!',
      UPLOADED: 'Tải lên thành công!',
    },
    ERROR: {
      GENERIC: 'Có lỗi xảy ra, vui lòng thử lại',
      NOT_FOUND: 'Không tìm thấy dữ liệu',
      NETWORK: 'Lỗi kết nối mạng',
      UNAUTHORIZED: 'Bạn không có quyền thực hiện thao tác này',
      VALIDATION: 'Dữ liệu không hợp lệ',
      SERVER: 'Lỗi máy chủ, vui lòng thử lại sau',
    },
    CONFIRM: {
      DELETE: 'Bạn có chắc chắn muốn xóa?',
      LEAVE: 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang?',
      PUBLISH: 'Bạn có chắc muốn xuất bản?',
    },
  },

  // Form Validation
  VALIDATION: {
    REQUIRED: 'Trường này là bắt buộc',
    EMAIL_INVALID: 'Email không hợp lệ',
    PASSWORD_MIN: 'Mật khẩu phải có ít nhất {min} ký tự',
    PASSWORD_MISMATCH: 'Mật khẩu không khớp',
    URL_INVALID: 'URL không hợp lệ',
    NUMBER_INVALID: 'Giá trị phải là số',
    MIN_LENGTH: 'Tối thiểu {min} ký tự',
    MAX_LENGTH: 'Tối đa {max} ký tự',
    FILE_TOO_LARGE: 'File quá lớn (tối đa {max})',
    FILE_TYPE_INVALID: 'Loại file không được hỗ trợ',
  },

  // Navigation
  NAV: {
    DASHBOARD: 'Trang chủ',
    BLOGS: 'Bài viết',
    CATEGORIES: 'Danh mục',
    IMAGES: 'Hình ảnh',
    USERS: 'Người dùng',
    SETTINGS: 'Cài đặt',
    PROFILE: 'Hồ sơ',
    LOGOUT: 'Đăng xuất',
  },

  // Pagination
  PAGINATION: {
    SHOWING: 'Hiển thị',
    OF: 'của',
    RESULTS: 'kết quả',
    PREVIOUS: 'Trước',
    NEXT: 'Sau',
    PAGE: 'Trang',
  },

  // Common
  COMMON: {
    LOADING: 'Đang tải...',
    NO_DATA: 'Không có dữ liệu',
    ALL: 'Tất cả',
    SELECT: 'Chọn',
    SELECTED: 'Đã chọn',
    CLEAR: 'Xóa',
    APPLY: 'Áp dụng',
    CLOSE: 'Đóng',
    YES: 'Có',
    NO: 'Không',
    OR: 'Hoặc',
    AND: 'Và',
    FROM: 'Từ',
    TO: 'Đến',
    DATE: 'Ngày',
    TIME: 'Thời gian',
    CREATED_AT: 'Ngày tạo',
    UPDATED_AT: 'Ngày cập nhật',
    REQUIRED_FIELD: 'Trường bắt buộc',
    OPTIONAL_FIELD: 'Trường tùy chọn',
  },
} as const;

// Helper function to get nested text
export function getAdminText(path: string, params?: Record<string, any>): string {
  const keys = path.split('.');
  let value: any = ADMIN_TEXT;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return path;
  }
  
  if (typeof value !== 'string') return path;
  
  // Replace placeholders like {min}, {max}
  if (params) {
    Object.keys(params).forEach(key => {
      value = value.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
    });
  }
  
  return value;
}

// Examples:
// getAdminText('BLOG.ADD_NEW') => 'Thêm bài viết mới'
// getAdminText('VALIDATION.PASSWORD_MIN', { min: 6 }) => 'Mật khẩu phải có ít nhất 6 ký tự'
