# 🎨 Hướng Dẫn Cấu Hình Theme & Giao Diện Theo Tenant

> **Dành cho:** Backend Developer / DevOps / Tenant Admin  
> **Cập nhật:** 2026-02-24

---

## 📋 Tổng Quan Kiến Trúc

Hệ thống sử dụng **mô hình cấu hình đơn giản**:

```
Backend API
    └── /api/tenants/{tenantKey}/config    → Màu sắc, variantCode, token design
```

Client khi khởi động sẽ fetch từ API → áp dụng tự động:
- Ant Design token (màu sắc, border radius...)
- CSS Variables (dùng cho Tailwind & CSS custom)
- Component variant (resolve ở frontend bằng quy tắc tenant-specific + naming convention)

---

## 🟡 Phần 1: Cấu Hình Màu Sắc

### 1.1 Cấu Trúc JSON Trả Về Từ API

```json
{
  "id": "gobiz",
  "name": "Gobiz Logistics",
  "variantCode": "gd3",
  "tenantConfig": {
    "themeConfig": {
      "colorPrimary": "#6366f1",
      "colorPrimaryDark": "#818cf8",

      "colorBgContainer": "#ffffff",
      "colorBgContainerDark": "#1e293b",

      "colorBgLayout": "#f8fafc",
      "colorBgLayoutDark": "#0f172a",

      "colorBorder": "#e2e8f0",
      "colorBorderDark": "#334155",

      "colorText": "#1e293b",
      "colorTextDark": "#e2e8f0",

      "colorSuccess": "#22c55e",
      "colorWarning": "#f59e0b",
      "colorError": "#ef4444",

      "borderRadius": 12
    }
  }
}
```

### 1.2 Danh Sách Các Trường Màu Hỗ Trợ

| Trường                  | Ý Nghĩa                                  | Light Mode | Dark Mode |
|-------------------------|------------------------------------------|:----------:|:---------:|
| `colorPrimary`          | Màu chủ đạo (button, link, tab active)   | ✅         |           |
| `colorPrimaryDark`      | Màu chủ đạo riêng cho dark mode          |            | ✅        |
| `colorBgContainer`      | Nền card, panel, modal                   | ✅         |           |
| `colorBgContainerDark`  | Nền card, panel, modal (dark)            |            | ✅        |
| `colorBgLayout`         | Nền toàn trang (body background)         | ✅         |           |
| `colorBgLayoutDark`     | Nền toàn trang (dark)                    |            | ✅        |
| `colorBorder`           | Màu border mặc định                      | ✅         |           |
| `colorBorderDark`       | Màu border (dark)                        |            | ✅        |
| `colorText`             | Màu chữ chính                            | ✅         |           |
| `colorTextDark`         | Màu chữ chính (dark)                     |            | ✅        |
| `colorSuccess`          | Màu xanh thành công (dùng chung 2 mode)  | ✅         | ✅        |
| `colorWarning`          | Màu vàng cảnh báo                        | ✅         | ✅        |
| `colorError`            | Màu đỏ lỗi                               | ✅         | ✅        |
| `borderRadius`          | Độ bo góc (tính bằng `px`)              | ✅         | ✅        |

> **Lưu ý:** Khi Dark mode được bật, hệ thống tự động dùng giá trị `*Dark` thay thế. Nếu không khai báo `*Dark`, màu Light Mode sẽ được dùng cho cả 2 mode.

### 1.3 CSS Variables Tự Động Được Áp Dụng

Mỗi giá trị màu được ánh xạ sang CSS variable trên `<html>`:

| Trường JSON       | CSS Variable               | Dùng Trong                          |
|-------------------|----------------------------|--------------------------------------|
| `colorPrimary`    | `--tenant-primary-color`   | `text-primary`, `bg-primary`, ...   |
| `colorBgLayout`   | `--tenant-bg-layout`       | `body`, `.bg-layout`                |
| `colorBgContainer`| `--tenant-bg-container`    | Card, panel backgrounds             |
| `colorBorder`     | `--tenant-border-color`    | Custom border styles                |
| `colorText`       | `--tenant-text-color`      | Default text color                  |
| `borderRadius`    | `--tenant-radius-antd`     | Custom border radius                |

**Sử dụng trong Tailwind CSS:**
```jsx
<div className="bg-primary text-primary border-primary/20">...</div>
```

**Sử dụng trong CSS thuần:**
```css
.my-component {
  background: var(--tenant-bg-container);
  border-color: var(--tenant-border-color);
  color: var(--tenant-text-color);
}
```

### 1.4 Ví Dụ Màu Sắc Theo Tenant

#### 🔵 Báo Gấm (gd1 — Style truyền thống)
```json
{
  "colorPrimary": "#1890ff",
  "colorBgLayout": "#f0f2f5",
  "borderRadius": 6
}
```

#### 🟣 Gobiz Logistics (gd3 — Style hiện đại)
```json
{
  "colorPrimary": "#6366f1",
  "colorPrimaryDark": "#818cf8",
  "colorBgLayout": "#f8fafc",
  "colorBgLayoutDark": "#0f172a",
  "colorBorder": "#e2e8f0",
  "colorBorderDark": "#334155",
  "borderRadius": 12
}
```

#### 🟢 Thiên Long Express
```json
{
  "colorPrimary": "#16a34a",
  "colorBgLayout": "#f0fdf4",
  "colorBgLayoutDark": "#052e16",
  "borderRadius": 8
}
```

---

## 🖼️ Phần 2: Cấu Hình Giao Diện (Frontend-Driven)

### 2.1 Nguyên Lý Hoạt Động

Mỗi trang (page) có **nhiều phiên bản giao diện** (Style) được đặt tên theo quy ước:

```
OrdersStyle1   → Giao diện truyền thống (gd1)
OrdersStyle2   → Giao diện nâng cao (gd2) 
OrdersStyle3   → Giao diện Gobiz premium (gd3)
OrdersCombined → Giao diện tổng hợp Orders + Shipments
```

Hệ thống chọn component nào để render theo **2 cấp ưu tiên**:

```
1️⃣ TENANT-SPECIFIC RULES  (hardcode ở frontend)   ← Cao nhất
2️⃣ NAMING CONVENTION      (pageKey + variantCode) ← Mặc định
```

### 2.2 Cách 1: Dùng `variantCode` + convention (Khuyến nghị)

Khai báo `variantCode` — frontend map tự động theo tên file:

```json
{
  "variantCode": "gd3"
}
```

Ví dụ mapping tự động theo từng `variantCode`:

| `variantCode` | Orders       | Claims       | Shipments       | Layout        |
|---------------|--------------|--------------|-----------------|---------------|
| `gd1`         | OrdersStyle1 | ClaimsStyle1 | Shipments       | MainLayout    |
| `gd2`         | OrdersStyle2 | ClaimsStyle2 | ShipmentsStyle2 | MainLayout    |
| `gd3`         | OrdersCombined | ClaimsStyle3 | ShipmentsStyle3 | MainLayout |

> **Lưu ý kỹ thuật:** Convention mặc định là `{PageKey}Style{số}` (ví dụ: `gd3` → style số `3` → `OrdersStyle3`).

### 2.3 Cách 2: Quy tắc tenant-specific ở frontend

Nếu một tenant cần UI khác hẳn (ví dụ layout/menu/tabs riêng), xử lý trực tiếp ở frontend theo `tenantConfig.id`:

```json
{
  "id": "gobiz",
  "tenantConfig": {
    "themeConfig": {
      "colorPrimary": "#6366f1"
    }
  }
}
```

Phần layout/menu logic đặc thù được code ở frontend (ví dụ `useVariant`, `useNavigation`, các page component).

---

## 🗂️ Phần 3: File Structure Liên Quan

```
apps/web/src/
├── App.tsx                     ← Fetch tenant config, apply theme/CSS vars
├── index.css                   ← CSS variables defaults + Tailwind
└── pages/
    ├── Orders/
    │   ├── index.tsx           ← Entry: useVariant('orders') → load đúng Style
    │   ├── OrdersStyle1.tsx    ← Giao diện gd1
    │   ├── OrdersStyle3.tsx    ← Giao diện gd3
    │   └── OrdersCombined.tsx  ← Giao diện tổng hợp
    ├── Claims/
    │   ├── index.tsx
    │   ├── ClaimsStyle1.tsx
    │   └── ClaimsStyle3.tsx
    └── ...                     ← Tương tự các trang khác

packages/
├── tenant-config/src/index.ts  ← Types + helper functions (applyTenantConfig, updateTenantCSSVariables)
├── theme-provider/src/         ← ThemeContext, useVariant() hook
│   ├── ThemeContext.tsx        ← useTheme(), useVariant()
│   └── ThemeSwitcher.tsx       ← Toggle Dark/Light UI
└── antd-config/src/index.ts   ← Base AntD theme (light + dark)
```

---

## 🔧 Phần 4: Hướng Dẫn Tạo Tenant Mới

### Bước 1: Thêm Tenant Vào Mock (Development)

Trong `packages/tenant-config/src/index.ts`:

```ts
export const tenantExamples: Record<string, { name: string }> = {
    baogam: { name: 'Báo Gấm' },
    gobiz: { name: 'Gobiz Logistics' },
    my_new_tenant: { name: 'Tên Tenant Mới' },  // ← Thêm vào đây
};
```

### Bước 2: Cấu Hình Backend API

`GET /api/tenants/my_new_tenant/config` → Trả về:

```json
{
  "id": "my_new_tenant",
  "name": "Tên Tenant Mới",
  "variantCode": "gd3",
  "tenantConfig": {
    "themeConfig": {
      "colorPrimary": "#0ea5e9",
      "colorPrimaryDark": "#38bdf8",
      "colorBgLayout": "#f0f9ff",
      "colorBgLayoutDark": "#082f49",
      "colorBorder": "#bae6fd",
      "colorBorderDark": "#0c4a6e",
      "borderRadius": 10,
      "variants": {}
    }
  }
}
```

### Bước 3: Chọn Bộ Giao Diện

| Muốn giao diện | Đặt `variantCode` |
|----------------|-------------------|
| Truyền thống, đơn giản | `"gd1"` |
| Hiện đại, premium | `"gd3"` |
| Tổng hợp Orders+Shipments | `"gd3"` + xử lý tenant-specific ở frontend |

---

## 🎯 Phần 5: Tạo Giao Diện Mới (Developer Guide)

### 5.1 Thêm Style Mới Cho Một Trang

Ví dụ thêm `OrdersStyle4` cho tenant mới:

```bash
# 1. Tạo file mới
touch apps/web/src/pages/Orders/OrdersStyle4.tsx
```

```tsx
// apps/web/src/pages/Orders/OrdersStyle4.tsx
export const OrdersStyle4 = () => {
    // Implement giao diện mới tại đây
    return <div>...</div>;
};
```

```bash
# 2. File index.tsx đã tự động quét *.tsx — KHÔNG cần sửa gì thêm!
# import.meta.glob('./*.tsx') sẽ tự tìm thấy OrdersStyle4.tsx
```

Sau đó thêm rule frontend để tenant mục tiêu dùng `OrdersStyle4` (không cần lưu mapping UI vào backend/DB).

### 5.2 Thêm Biến Thể UI Mới

Không cần thêm API mapping. Chỉ cần:
- Tạo component style mới (`*Style4.tsx`)
- Đặt `variantCode` phù hợp hoặc thêm rule tenant-specific ở frontend
- Kiểm tra fallback để tránh văng UI nếu thiếu component

---

## ✅ Phần 6: Đánh Giá Tính Linh Hoạt

### Điểm Mạnh ✅

| Tính năng | Hỗ trợ | Ghi chú |
|-----------|:-------:|---------|
| Màu primary riêng per-tenant | ✅ | Light & Dark riêng biệt |
| Background riêng per-tenant | ✅ | Container + Layout |
| Border color riêng per-tenant | ✅ | Light & Dark |
| Border radius riêng per-tenant | ✅ | Áp dụng toàn bộ Ant Design |
| Dark mode | ✅ | Toggle real-time, CSS vars tự cập nhật |
| Giao diện khác nhau per-tenant | ✅ | Per-page override |
| Menu ẩn/hiện per-tenant | ✅ | Frontend tenant-specific rules |
| Label menu per-tenant | ✅ | Frontend tenant-specific rules |
| Thêm giao diện mới | ✅ | Chỉ cần tạo file, không sửa routing |
| UI Library (AntD / MUI) | ✅ | Switch per-tenant |
| Cấu hình từ API | ✅ | Không cần deploy lại frontend |

### Hạn Chế & Cải Tiến Đề Xuất 🔧

| Hạn chế | Đề Xuất |
|---------|---------|
| `ShadcnShowcase/index.tsx` có lint errors do thiếu export từ `@repo/ui` | Cần bổ sung các component vào `packages/ui/src/index.ts` |
| `index.css` không có CSS variable cho primary dark trong `:root` | Thêm `--tenant-primary-color-dark` vào `:root` defaults |
| Không có fallback khi API tenant fail | Thêm error boundary + local fallback config |
| Chưa có component-level theming riêng per-tenant | Xem xét thêm `components` override trong `themeConfig` |

---

## 🚀 Quick Reference

```bash
# Đổi màu tenant → Chỉ cần sửa trên backend API, không cần deploy frontend
# Đổi giao diện tenant → Đổi variantCode + rule frontend nếu cần tenant-specific
# Thêm giao diện mới → Tạo file *Style4.tsx, thêm rule frontend cho tenant mục tiêu
# Test local → Dropdown "TEST UI" ở trang Login để switch tenant
```
