# Hệ Thống Quản Trị Đa Giao Diện & Đa Tenant (Ant Design)

Tài liệu này giải thích cấu trúc mã nguồn và cách triển khai bài toán **Multi-Tenant** (Nhiều khách hàng) kết hợp **Multi-Variant** (Nhiều bộ giao diện) trong cùng một dự án.

---

## 🏗 1. Cấu trúc Source Code

Dự án được tổ chức theo mô hình **Monorepo** (Quản lý nhiều gói trong một kho lưu trữ):

### 📂 `apps/` (Ứng dụng chính)
*   **`web/`**: Ứng dụng React frontend chính. 
    *   `src/components/Layout/`: Chứa các biến thể Layout (Sidebar dọc, Giao diện bo tròn, v.v.)
    *   `src/pages/`: Chứa logic nghiệp vụ. Mỗi trang quan trọng (như Orders) đều có một "Factory index" để chọn style.
*   **`tenant-server/`**: Mock API cung cấp cấu hình cho từng Tenant.

### 📂 `packages/` (Code dùng chung)
*   **`theme-provider/`**: Quản lý Context về giao diện, mã màu và cung cấp hook `useVariant()`.
*   **`tenant-config/`**: Định nghĩa cấu trúc cấu hình và các tiện ích để "nhuộm màu" (CSS Variables).
*   **`ui/`**: Các thành phần giao diện dùng chung (Table, Filter, Pagination).

---

## 🎨 2. Ba lớp triển khai Đa giao diện

### Lớp 1: Lớp Cấu hình (API Driven)
Mọi thông số của một Tenant được quyết định tại server. 
- **Variant**: Quyết định *kiểu dáng* (ví dụ: `gd1` là chuẩn, `gd3` là hiện đại).
- **Theme**: Quyết định *màu sắc* (mã màu Hex).

### Lớp 2: Lớp Điều phối (Factory Pattern)
Chúng ta sử dụng các "Xưởng sản xuất" để chọn Component dựa trên mã `variant` từ API.

*Ví dụ tại `Orders/index.tsx`:*
```tsx
const VARIANTS = {
    'standard': OrdersStyle1,
    'modern': OrdersStyle3,
    'combined': OrdersCombined 
};
```
Hệ thống sẽ tự động bốc Component tương ứng ra hiển thị mà không cần viết `if/else` chằng chịt.

### Lớp 3: Lớp Nhuộm màu (Tokens & Biến CSS)
Sử dụng **CSS Variables** để đồng bộ hóa màu sắc.
- Khi Tenant thay đổi, mã màu từ API được nạp vào biến `--ant-primary-color`.
- Toàn bộ code UI sử dụng biến này thay vì mã màu cố định.
- Ant Design `ConfigProvider` nhận mã màu này để cập nhật toàn bộ thư viện component.

---

## 🛠 3. Cách chạy dự án

1.  **Cài đặt dependencies**:
    ```bash
    pnpm install
    ```

2.  **Khởi chạy toàn bộ hệ thống** (bao gồm Web và Mock Server):
    ```bash
    pnpm dev
    ```
    *   Web chạy tại: `http://localhost:3000`
    *   Mock Server chạy tại: `http://localhost:3003`

---

## 🚀 4. Cách thêm một Tenant hoặc Giao diện mới

### Thêm Tenant mới (Cùng giao diện cũ, màu khác)
1.  Mở `apps/tenant-server/src/index.js`.
2.  Thêm một object khách hàng mới với `variant` có sẵn và `colorPrimary` tùy chọn.
3.  Cập nhật danh sách dropdown tại `packages/tenant-config/src/index.ts`.

### Thêm Giao diện mới (Style hoàn toàn mới)
1.  Tạo file Style mới trong thư mục trang tương ứng (ví dụ: `OrdersNewStyle.tsx`).
2.  Đăng ký mã variant mới vào file `index.tsx` của trang đó.
3.  Cập nhật cấu hình trên Server để sử dụng mã variant mới này.

---

## 💡 5. Tại sao cách này lại hiệu quả?
- **Tái sử dụng tối đa**: 100 Tenant có thể dùng chung 1 bộ code giao diện mà vẫn có màu sắc/thương hiệu riêng.
- **Dễ bảo trì**: Sửa logic nghiệp vụ chỉ cần sửa 1 nơi, giao diện nào cũng được hưởng lợi.
- **Tốc độ**: Thêm khách hàng mới chỉ mất 1 phút cấu hình JSON, không cần code lại UI.
