# Dự án Multi-Tenant Monorepo (Turbo)

Dự án này sử dụng cấu trúc Monorepo với bộ công cụ Turbo, React, Vite, Ant Design và Tailwind CSS, tập trung vào khả năng tùy biến giao diện linh hoạt cho nhiều Tenant khác nhau.

## 📁 Cấu trúc thư mục

### 📱 Applications (`/apps`)
- **`web`**: Ứng dụng quản trị/người dùng trên trình duyệt (Cổng 3000).
- **`mobile`**: Ứng dụng tối ưu cho thiết bị di động (Cổng 3001).

### 📦 Shared Packages (`/packages`)
Để dự án gọn gàng và dễ quản lý, hệ thống cấu hình giao diện đã được chia nhỏ:
- **`@repo/antd-config`**: Chứa Token của Ant Design (Màu sắc, Font, Border Radius mặc định).
- **`@repo/tailwind-config`**: Chứa cấu hình Tailwind dùng chung, kết nối các Class Tailwind với biến CSS.
- **`@repo/tenant-config`**: Chứa logic xử lý Tenant, Mock data của các Tenant và hàm cập nhật CSS Variables.
- **`@repo/theme-provider`**: Chứa React Context quản lý Dark/Light mode và các Component điều chuyển Theme.

---

## 🛠 Hướng dẫn tùy chỉnh Giao diện

### 1. Thêm hoặc Sửa Tenant mới
Để thêm một Tenant mới với bộ nhận diện thương hiệu riêng, bạn vào file:
`packages/tenant-config/src/index.ts`

Tìm đến biến `tenantExamples` và thêm cấu hình mới:
```typescript
{
    my_new_tenant: {
        name: 'Tên Công Ty Mới',
        config: {
            colorPrimary: '#mã_màu_hex',    // Màu chủ đạo
            borderRadius: 10,               // Độ bo góc
            colorSuccess: '#mã_màu_thành_công',
            // ... các token khác của Ant Design
        },
    }
}
```

### 2. Thêm màu mới vào Tailwind
Nếu bạn muốn thêm một thuộc tính màu mới có thể thay đổi theo Tenant qua Tailwind, hãy làm theo 2 bước:

**Bước A: Định nghĩa biến CSS**
Trong file `packages/tenant-config/src/index.ts`, cập nhật hàm `updateTenantCSSVariables`:
```typescript
if (config.myNewColor) root.style.setProperty('--tenant-custom-color', config.myNewColor);
```

**Bước B: Khai báo trong Tailwind**
Tại file `apps/web/tailwind.config.cjs` (hoặc mobile), thêm vào mục `colors`:
```javascript
colors: {
    'custom-color': 'var(--tenant-custom-color)',
}
```
Sau đó bạn có thể dùng class: `text-custom-color` hoặc `bg-custom-color`.

### 3. Sửa cấu hình Ant Design mặc định
Nếu muốn thay đổi style mặc định (Light/Dark mode) cho toàn bộ hệ thống, hãy chỉnh sửa tại:
`packages/antd-config/src/index.ts`

---

## 🚀 Cách chạy dự án

1. **Cài đặt thư viện**:
   ```bash
   pnpm install
   ```

2. **Chạy môi trường phát triển**:
   ```bash
   pnpm dev
   ```

3. **Lưu ý**: Khi bạn thực hiện các thay đổi lớn về cấu trúc gói (packages), hãy khởi động lại lệnh `pnpm dev` để đảm bảo hệ thống nhận diện đúng các liên kết mới.

---
*Dự án được thiết kế để tối ưu hóa khả năng mở rộng (Scalability) và tái sử dụng mã nguồn (Code Reusability).*
