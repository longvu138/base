# 🎨 Hệ thống Multi-Tenant & Dynamic Theming

Tài liệu này giải thích cách hệ thống quản lý nhiều giao diện và màu sắc động cho từng khách hàng (Tenant).

## 1. Luồng dữ liệu (Data Flow)
1. **Source of Truth (Backend)**: File `apps/tenant-server/src/index.js` định nghĩa cấu hình cho từng Tenant.
   - `variants`: Định nghĩa trang nào dùng giao diện (`Style`) nào.
   - `themeConfig`: Định nghĩa bộ màu thương hiệu.
2. **Provider (Frontend)**: `TenantProvider` (trong `packages/theme-provider`) chịu trách nhiệm:
   - Lắng nghe Tenant ID hiện tại.
   - Fetch cấu hình từ API.
   - Bơm màu vào CSS thông qua biến `--tenant-*`.
3. **Trình hiển thị (Page Loader)**:
   - Các file `index.tsx` ở mỗi trang (Login, Orders) sử dụng `DynamicVariant` để tự động load file `.tsx` tương ứng.

## 2. Cách thêm một Tenant mới
1. Mở `apps/tenant-server/src/index.js`.
2. Thêm một bản ghi mới vào object `tenants`. Định nghĩa màu và variant.
3. Không cần sửa code Frontend.

## 3. Cách thêm một Giao diện (Style) mới
1. Tạo file mới tại thư mục trang đó (Ví dụ: `apps/web/src/pages/Orders/OrdersStyle4.tsx`).
2. Export component với cùng tên file (`export const OrdersStyle4 = ...`).
3. Cập nhật API ở Backend trả về `orders: 'OrdersStyle4'`.

## 4. Quản lý Màu sắc (CSS Variables)
Hệ thống sử dụng các biến CSS sau:
- `--tenant-primary-color`: Màu chủ đạo.
- `--tenant-bg-layout`: Màu nền toàn ứng dụng.
- `--tenant-bg-container`: Màu nền các khối nội dung (Card, Modal).
- `--tenant-radius-antd`: Độ bo góc.

---

*Lưu ý: Luôn ưu tiên sử dụng các utility class như `bg-layout` hoặc `text-primary` thay vì hardcode mã màu.*
