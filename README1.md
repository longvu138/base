# 📖 Tài liệu Hướng dẫn Dự án Monorepo Base

## 📋 Mục lục
1. [Cấu trúc Dự án](#1-cấu-trúc-dự-án)
2. [Chi tiết Folders & Files](#2-chi-tiết-folders--files)
3. [Hệ thống Đa ngôn ngữ (i18n)](#3-hệ-thống-đa-ngôn-ngữ-i18n)
4. [Hệ thống Màu sắc & Dark Mode](#4-hệ-thống-màu-sắc--dark-mode)
5. [Thêm Màu Mới (Secondary)](#5-thêm-màu-mới-ví-dụ-secondary)
6. [Component Dùng Chung](#6-component-dùng-chung)
7. [Workflow Phát triển](#7-workflow-phát-triển)

---

## 1. Cấu trúc Dự án

Dự án sử dụng **Turborepo** để quản lý monorepo, chia sẻ code giữa Web và Mobile.

```
base/
├── apps/                      # Ứng dụng
│   ├── web/                   # App React cho Web (Vite + React + Ant Design)
│   │   ├── src/
│   │   │   ├── pages/         # Các trang (Dashboard, Orders, Login...)
│   │   │   ├── components/    # Component riêng của web app
│   │   │   ├── routes.tsx     # Cấu hình routing
│   │   │   └── main.tsx       # Entry point
│   │   ├── public/            # Static assets
│   │   │   └── _redirects     # Config cho Cloudflare Pages
│   │   ├── tailwind.config.cjs # Config Tailwind riêng cho web
│   │   ├── vercel.json        # Config cho Vercel deployment
│   │   └── package.json
│   │
│   └── mobile/                # App React cho Mobile (giống web)
│       └── ...
│
├── packages/                  # Thư viện dùng chung
│   ├── ui/                    # Component Library
│   │   ├── src/
│   │   │   ├── Dashboard.tsx  # Component Dashboard
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── TableComponent.tsx
│   │   │   ├── Status.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── index.ts       # Export tất cả components
│   │   └── package.json
│   │
│   ├── hooks/                 # Custom Hooks
│   │   ├── src/
│   │   │   ├── useLogin.ts
│   │   │   ├── usePaginationWithURL.ts
│   │   │   ├── useFilterWithURL.ts
│   │   │   ├── useOrderHooks.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── i18n/                  # Đa ngôn ngữ
│   │   ├── src/
│   │   │   ├── locales/
│   │   │   │   ├── vi/
│   │   │   │   │   └── translation.json
│   │   │   │   └── en/
│   │   │   │       └── translation.json
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── tenant-config/         # Quản lý theme theo tenant
│   │   ├── src/
│   │   │   └── index.ts       # Logic ánh xạ màu vào CSS Variables
│   │   └── package.json
│   │
│   ├── theme-provider/        # Context quản lý Dark/Light mode
│   │   ├── src/
│   │   │   ├── ThemeContext.tsx
│   │   │   ├── ThemeSwitcher.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── tailwind-config/       # Config Tailwind chung
│   │   ├── src/
│   │   │   └── index.ts       # Định nghĩa màu, spacing...
│   │   └── package.json
│   │
│   ├── antd-config/           # Config Ant Design theme
│   │   └── ...
│   │
│   └── config/                # Cấu hình tĩnh (API URL, Client ID...)
│       └── ...
│
├── turbo.json                 # Config Turborepo
├── package.json               # Root package.json
└── pnpm-workspace.yaml        # Config workspace
```

---

## 2. Chi tiết Folders & Files

### 2.1. `/apps/web` và `/apps/mobile`

**Chức năng**: Chứa code ứng dụng cụ thể cho từng platform.

**Folders quan trọng**:
- `src/pages/`: Chứa các trang (Dashboard, Orders, Login...). Mỗi trang có thể có nhiều style variants (Style1, Style2...).
- `src/components/`: Component riêng của app (Layout, Header...).
- `src/routes.tsx`: Định nghĩa routing (React Router).
- `tailwind.config.cjs`: Override hoặc extend config Tailwind cơ bản với màu riêng của app.

**Files deployment**:
- `vercel.json`: Cấu hình rewrites cho Vercel (fix lỗi 404 khi reload).
- `public/_redirects`: Cấu hình redirect cho Cloudflare Pages.

### 2.2. `/packages/ui`

**Chức năng**: Thư viện component dùng chung giữa Web và Mobile.

**Components chính**:
- `Dashboard.tsx`: Layout và các card cho trang tổng quan.
- `FilterPanel.tsx`: Panel filter có chức năng collapse/expand.
- `TableComponent.tsx`: Wrapper cho Ant Design Table với header, actions.
- `Pagination.tsx`: Component phân trang độc lập.
- `Status.tsx`: Badge hiển thị trạng thái (tự động map màu từ API).
- `StatusFilter.tsx`: Radio group để filter theo status.

### 2.3. `/packages/hooks`

**Chức năng**: Business logic hooks, tách biệt logic khỏi UI.

**Hooks quan trọng**:
- `useLogin.ts`: Xử lý đăng nhập (credentials state, validation, API call).
- `usePaginationWithURL.ts`: Quản lý page/pageSize và đồng bộ với URL query params.
- `useFilterWithURL.ts`: Quản lý form filter và đồng bộ với URL.
- `useOrderHooks.ts`: Các hook liên quan đến Orders (useListOrderQuery, useOrderStatusesQuery...).

### 2.4. `/packages/i18n`

**Chức năng**: Quản lý đa ngôn ngữ.

**Structure**:
```
i18n/
└── src/
    ├── locales/
    │   ├── vi/
    │   │   └── translation.json    # Nội dung tiếng Việt
    │   └── en/
    │       └── translation.json    # Nội dung tiếng Anh
    └── index.ts                    # Config i18next, export hooks
```

### 2.5. `/packages/tenant-config`

**Chức năng**: Quản lý theme theo từng tenant (khách hàng).

**Logic chính**:
- Định nghĩa các bộ màu trong `tenantExamples` (default, luxury, tech...).
- Hàm `updateTenantCSSVariables()`: "Tiêm" màu vào CSS Variables dựa trên theme hiện tại (Light/Dark).
- Hỗ trợ màu riêng cho Dark mode (colorPrimaryDark, colorBgContainerDark...).

### 2.6. `/packages/theme-provider`

**Chức năng**: Quản lý trạng thái Dark/Light mode.

**Components**:
- `ThemeContext.tsx`: React Context cung cấp state `theme` ('light' | 'dark') và `toggleTheme()`.
- `ThemeSwitcher.tsx`: Component Switch UI để chuyển đổi theme.

### 2.7. `/packages/tailwind-config`

**Chức năng**: Cấu hình Tailwind CSS chung cho toàn bộ dự án.

**File**: `src/index.ts`
```typescript
export const baseTailwindConfig = {
    darkMode: 'class',           // Sử dụng class .dark để bật dark mode
    theme: {
        extend: {
            colors: {
                primary: "var(--tenant-primary-color)",     // Màu từ CSS Variable
                layout: "var(--tenant-bg-layout)",
                border: "var(--tenant-border-color)",
                // ...
            }
        }
    }
}
```

---

## 3. Hệ thống Đa ngôn ngữ (i18n)

### 3.1. Cấu trúc File

File dịch nằm trong `packages/i18n/src/locales/{lang}/translation.json`.

**Ví dụ** (`vi/translation.json`):
```json
{
  "common": {
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "create": "Tạo mới",
    "export": "Xuất file"
  },
  "orders": {
    "title": "Quản lý đơn hàng",
    "columns": {
      "code": "Mã đơn",
      "status": "Trạng thái",
      "total": "Tổng tiền"
    }
  }
}
```

### 3.2. Sử dụng trong Component

```tsx
import { useTranslation } from '@repo/i18n';

export const OrdersPage = () => {
    const { t } = useTranslation();
    
    return (
        <div>
            <h1>{t('orders.title')}</h1>
            <span>{t('orders.columns.code')}</span>
        </div>
    );
};
```

### 3.3. Chuyển đổi Ngôn ngữ

```tsx
import { useLanguage } from '@repo/i18n';

export const LanguageSwitcher = () => {
    const { currentLanguage, changeLanguage } = useLanguage();
    
    return (
        <Radio.Group 
            value={currentLanguage.code} 
            onChange={(e) => changeLanguage(e.target.value)}
        >
            <Radio.Button value="vi">🇻🇳 VI</Radio.Button>
            <Radio.Button value="en">🇺🇸 EN</Radio.Button>
        </Radio.Group>
    );
};
```

---

## 4. Hệ thống Màu sắc & Dark Mode

### 4.1. Cơ chế Hoạt động

Hệ thống sử dụng kết hợp **CSS Variables** + **Tailwind** + **Ant Design**:

1. **Class `.dark`**: Được thêm/xóa vào thẻ `<html>` khi toggle theme.
2. **CSS Variables**: Các màu trong Tailwind (`primary`, `layout`...) không hard-code màu Hex mà trỏ vào biến CSS (`var(--tenant-primary-color)`).
3. **Tenant Config**: Package `tenant-config` tính toán màu dựa trên mode (Light/Dark) và inject vào CSS Variables.

**Ví dụ Flow**:
```
User bấm Toggle Dark Mode
  → ThemeContext setState('dark')
  → Thêm class .dark vào <html>
  → tenant-config gọi updateTenantCSSVariables(config, isDark=true)
  → Ghi giá trị colorPrimaryDark vào --tenant-primary-color
  → Tailwind class bg-primary tự động dùng màu mới
```

### 4.2. Màu Có Sẵn trong Tailwind

| Class Tailwind | CSS Variable | Mô tả |
|----------------|--------------|-------|
| `bg-primary` / `text-primary` | `--tenant-primary-color` | Màu chủ đạo (Brand color) |
| `bg-layout` | `--tenant-bg-layout` | Màu nền app |
| `bg-container-bg` | `--tenant-bg-container` | Màu nền card/table |
| `border-border` | `--tenant-border-color` | Màu viền |
| `text-text-color` | `--tenant-text-color` | Màu chữ mặc định |

### 4.3. Sử dụng trong Code

```tsx
// Tự động thay đổi theo Dark/Light mode
<div className="bg-layout text-text-color">
    <h1 className="text-primary">Tiêu đề</h1>
    <div className="bg-container-bg border border-border p-4">
        Nội dung
    </div>
</div>
```

---

## 5. Thêm Màu Mới (Ví dụ: Secondary)

Giả sử bạn muốn thêm màu `secondary` có hỗ trợ Dark mode.

### Bước 1: Khai báo trong Tailwind Config Chung

**File**: `packages/tailwind-config/src/index.ts`

```typescript
export const baseTailwindConfig: Partial<Config> = {
    theme: {
        extend: {
            colors: {
                primary: "var(--tenant-primary-color)",
                secondary: "var(--tenant-secondary-color)",  // ← Thêm dòng này
                // ...
            }
        }
    }
};
```

### Bước 2: Cập nhật Interface trong Tenant Config

**File**: `packages/tenant-config/src/index.ts`

```typescript
export interface SimpleTenantConfig extends ThemeConfig {
    colorPrimary?: string;
    colorPrimaryDark?: string;
    
    // Thêm 2 dòng này
    colorSecondary?: string;
    colorSecondaryDark?: string;
    
    // ...
}
```

### Bước 3: Cập nhật CSS_VAR_MAP

**File**: `packages/tenant-config/src/index.ts`

```typescript
const CSS_VAR_MAP: Record<string, string> = {
    colorPrimary: '--tenant-primary-color',
    colorPrimaryDark: '--tenant-primary-dark',
    
    // Thêm 2 dòng này
    colorSecondary: '--tenant-secondary-color',
    colorSecondaryDark: '--tenant-secondary-dark',
    
    // ...
};
```

### Bước 4: Cập nhật Logic Resolve Dark Mode

**File**: `packages/tenant-config/src/index.ts`

Tìm hàm `getResolvedConfig`, thêm logic xử lý `colorSecondaryDark`:

```typescript
function getResolvedConfig(config: SimpleTenantConfig, isDark: boolean): SimpleTenantConfig {
    const {
        colorBgContainerDark, colorBgLayoutDark, colorBorderDark,
        colorTextDark, colorPrimaryDark,
        colorSecondaryDark,  // ← Thêm vào đây
        ...baseConfig
    } = config;

    const resolved = { ...baseConfig };

    if (isDark) {
        if (colorBgContainerDark) resolved.colorBgContainer = colorBgContainerDark;
        if (colorBgLayoutDark) resolved.colorBgLayout = colorBgLayoutDark;
        if (colorBorderDark) resolved.colorBorder = colorBorderDark;
        if (colorTextDark) resolved.colorText = colorTextDark;
        if (colorPrimaryDark) resolved.colorPrimary = colorPrimaryDark;
        
        // Thêm dòng này
        if (colorSecondaryDark) resolved.colorSecondary = colorSecondaryDark;
    }

    return resolved;
}
```

### Bước 5: Cập nhật hàm updateTenantCSSVariables

**File**: `packages/tenant-config/src/index.ts`

Tìm hàm `updateTenantCSSVariables`, thêm logic inject biến `secondary`:

```typescript
export function updateTenantCSSVariables(config?: SimpleTenantConfig, isDark?: boolean): void {
    // ... code hiện tại ...
    
    const ACTIVE_VARS: Record<string, string> = {
        colorPrimary: '--tenant-primary-color',
        colorSecondary: '--tenant-secondary-color',  // ← Thêm dòng này
        colorBgContainer: '--tenant-bg-container',
        // ...
    };
    
    // ... code inject các biến active ...
    
    const DARK_VARS: Record<string, string> = {
        colorPrimaryDark: '--tenant-primary-dark',
        colorSecondaryDark: '--tenant-secondary-dark',  // ← Thêm dòng này
        // ...
    };
    
    // ... code inject các biến dark ...
}
```

### Bước 6: Thêm giá trị vào Tenant Examples

**File**: `packages/tenant-config/src/index.ts`

```typescript
export const tenantExamples: Record<string, { name: string; config: SimpleTenantConfig }> = {
    default: {
        name: 'Màu 1',
        config: {
            colorPrimary: '#1890ff',
            colorPrimaryDark: '#ffd666',
            
            // Thêm 2 dòng này
            colorSecondary: '#52c41a',      // Màu secondary cho Light mode
            colorSecondaryDark: '#95de64',  // Màu secondary cho Dark mode
            
            // ...
        },
    },
    // ...
};
```

### Bước 7: Sử dụng trong Code

```tsx
// Bây giờ có thể dùng bg-secondary và text-secondary
<div className="bg-secondary text-white p-4">
    Màu Secondary
</div>

<button className="bg-secondary hover:opacity-90">
    Nút Secondary
</button>
```

---

## 6. Component Dùng Chung

### 6.1. FilterPanel

**Mục đích**: Tạo khu vực filter có thể thu gọn/mở rộng.

**Props**:
- `form`: Instance của Ant Design Form
- `onSearch`: Callback khi bấm nút Tìm kiếm
- `onReset`: Callback khi bấm nút Reset
- `showCollapseAll`: Hiển thị nút Thu gọn/Mở rộng
- `primaryContent`: Nội dung luôn hiển thị
- `secondaryContent`: Nội dung chỉ hiển thị khi mở rộng

**Ví dụ**:
```tsx
import { FilterPanel } from '@repo/ui';
import { Form, Input, Select } from 'antd';

const MyPage = () => {
    const [form] = Form.useForm();
    
    return (
        <FilterPanel
            form={form}
            onSearch={() => console.log('Search', form.getFieldsValue())}
            onReset={() => form.resetFields()}
            showCollapseAll={true}
            primaryContent={
                <div className="grid grid-cols-4 gap-4">
                    <Form.Item name="keyword" label="Từ khóa">
                        <Input placeholder="Nhập tìm kiếm..." />
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái">
                        <Select placeholder="Chọn..." />
                    </Form.Item>
                </div>
            }
            secondaryContent={
                <div className="pt-4 border-t">
                    <Form.Item name="advanced" label="Tùy chọn nâng cao">
                        <Input />
                    </Form.Item>
                </div>
            }
        />
    );
};
```

### 6.2. TableComponent

**Mục đích**: Wrapper cho Ant Design Table với header, actions, loading state chuẩn.

**Props**:
- `title`: Tiêu đề bảng
- `totalCount`: Tổng số bản ghi (hiển thị ở header)
- `extra`: Khu vực chứa các nút Action (Thêm mới, Xuất file...)
- `loading`: Trạng thái loading
- `showEmpty`: Hiển thị Empty state khi không có data

**Ví dụ**:
```tsx
import { TableComponent } from '@repo/ui';
import { Table, Button } from 'antd';
import { Plus, Download } from 'lucide-react';

const MyPage = () => {
    const { data, isLoading } = useMyQuery();
    
    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Tên', dataIndex: 'name' },
    ];
    
    return (
        <TableComponent
            title="Danh sách Sản phẩm"
            totalCount={data?.total || 0}
            loading={isLoading}
            showEmpty={!data?.list?.length}
            extra={
                <div className="flex gap-2">
                    <Button icon={<Download size={16} />}>Xuất Excel</Button>
                    <Button type="primary" icon={<Plus size={16} />}>Thêm mới</Button>
                </div>
            }
        >
            <Table 
                columns={columns} 
                dataSource={data?.list || []} 
                pagination={false}
                rowKey="id"
            />
        </TableComponent>
    );
};
```

### 6.3. Pagination

**Mục đích**: Component phân trang độc lập, tách riêng khỏi Table để dễ customize layout.

**Props**: Giống Ant Design Pagination.

**Ví dụ kết hợp với Hook**:
```tsx
import { Pagination } from '@repo/ui';
import { usePaginationWithURL } from '@repo/hooks';

const MyPage = () => {
    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { data } = useMyQuery({ page: page - 1, size: pageSize });
    
    return (
        <>
            <Table dataSource={data?.list} pagination={false} />
            
            <Pagination
                current={page}
                pageSize={pageSize}
                total={data?.total || 0}
                onChange={(p, s) => {
                    setPage(p);
                    if (s !== pageSize) setPageSize(s);
                }}
            />
        </>
    );
};
```

### 6.4. Dashboard

**Mục đích**: Layout chuyên dụng cho trang tổng quan, có Grid system và StatCard.

**Compound Components**:
- `Dashboard`: Layout chính
- `Dashboard.Section`: Grid section với cấu hình responsive
- `Dashboard.StatCard`: Card hiển thị chỉ số (số liệu, icon, trend)

**Ví dụ**:
```tsx
import { Dashboard } from '@repo/ui';
import { Wallet, ShoppingCart } from 'lucide-react';

const DashboardPage = ({ data }) => {
    return (
        <Dashboard title="Tổng quan">
            <Dashboard.Section columns={4} title="Chỉ số chính">
                <Dashboard.StatCard
                    title="Doanh thu tháng này"
                    value="1.000.000đ"
                    icon={<Wallet size={24} />}
                    variant="clean"
                    trend={{ value: "+12%", isPositive: true }}
                />
                <Dashboard.StatCard
                    title="Đơn hàng"
                    value={data.orderCount}
                    icon={<ShoppingCart size={24} />}
                    variant="clean"
                />
            </Dashboard.Section>
            
            <Dashboard.Section columns={2} title="Biểu đồ">
                {/* Chart components */}
            </Dashboard.Section>
        </Dashboard>
    );
};
```

### 6.5. Status

**Mục đích**: Hiển thị badge trạng thái, tự động map màu từ data API.

**Props**:
- `status`: Mã trạng thái (string)
- `statuses`: Danh sách status từ API (array có cấu trúc `{ code, name, color }`)

**Ví dụ**:
```tsx
import { Status } from '@repo/ui';

const OrderRow = ({ order, statusList }) => {
    return (
        <tr>
            <td>{order.code}</td>
            <td>
                <Status status={order.status} statuses={statusList} />
            </td>
        </tr>
    );
};
```

---

## 7. Workflow Phát triển

### 7.1. Tạo Trang Mới (Ví dụ: Trang Sản phẩm)

**Bước 1**: Tạo API Hook
```bash
# packages/hooks/src/useProductHooks.ts
```

```typescript
import { useQuery } from '@tanstack/react-query';

export const useProductListQuery = (params: any) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            // const res = await ProductApi.getList(params);
            // return res.data;
            return { data: [], total: 0 };
        }
    });
};
```

**Bước 2**: Tạo Component Trang
```bash
# apps/web/src/pages/Products/index.tsx
```

```tsx
import { Form, Input, Table } from 'antd';
import { FilterPanel, TableComponent, Pagination } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL, useProductListQuery } from '@repo/hooks';

export const ProductsPage = () => {
    const [form] = Form.useForm();
    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });
    
    const { data, isLoading } = useProductListQuery({
        page: page - 1,
        size: pageSize,
        ...filters
    });
    
    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Tên', dataIndex: 'name' },
    ];
    
    return (
        <div className="space-y-4 p-6">
            <FilterPanel
                form={form}
                onSearch={() => applyFilters(form.getFieldsValue())}
                onReset={clearFilters}
                primaryContent={
                    <Form.Item name="q" label="Tìm kiếm">
                        <Input placeholder="Nhập từ khóa..." />
                    </Form.Item>
                }
            />
            
            <TableComponent
                title="Danh sách Sản phẩm"
                loading={isLoading}
                totalCount={data?.total || 0}
            >
                <Table columns={columns} dataSource={data?.data || []} pagination={false} />
            </TableComponent>
            
            <Pagination
                current={page}
                pageSize={pageSize}
                total={data?.total || 0}
                onChange={(p, s) => {
                    setPage(p);
                    if (s !== pageSize) setPageSize(s);
                }}
            />
        </div>
    );
};
```

**Bước 3**: Đăng ký Route
```tsx
// apps/web/src/routes.tsx
import { ProductsPage } from './pages/Products';

// Trong PrivateRoute
<Route path="/products" element={<ProductsPage />} />
```

### 7.2. Thêm Nội dung Đa ngôn ngữ

**File**: `packages/i18n/src/locales/vi/translation.json`

```json
{
  "products": {
    "title": "Quản lý Sản phẩm",
    "columns": {
      "id": "ID",
      "name": "Tên sản phẩm",
      "price": "Giá"
    },
    "buttons": {
      "create": "Thêm sản phẩm"
    }
  }
}
```

**Sử dụng**:
```tsx
const { t } = useTranslation();
<h1>{t('products.title')}</h1>
```

### 7.3. Deploy Lên Production

**Lệnh Build**:
```bash
pnpm build
```

**Deploy lên Vercel**:
```bash
# Tự động detect và deploy từ Git
# Hoặc dùng CLI
vercel --prod
```

**Deploy lên Cloudflare Pages**:
```bash
# Upload thư mục dist/ lên Cloudflare Pages Dashboard
# File _redirects đã được copy tự động vào dist/
```

---

## 📌 Tóm tắt Quy tắc Vàng

1. **Component UI**: Luôn import từ `@repo/ui`, không tự tạo component trùng.
2. **Hooks**: Logic nghiệp vụ phải để trong `@repo/hooks`, không viết trong component.
3. **Màu sắc**: Dùng Tailwind class (`bg-primary`, `text-primary`), không hard-code Hex.
4. **Dark Mode**: Dùng `dark:` prefix của Tailwind hoặc rely vào CSS Variables tự động.
5. **i18n**: Mọi text hiển thị phải qua `t('key')`, không hard-code string.
6. **Pagination**: Luôn dùng `usePaginationWithURL` để đồng bộ với URL.
7. **Filter**: Luôn dùng `useFilterWithURL` để đồng bộ filter với URL.

---

## 🎯 Best Practices

✅ **DO**:
- Tái sử dụng component từ `@repo/ui`
- Dùng Hook để quản lý state và logic
- Dùng CSS Variables thay vì hard-code màu
- Đồng bộ state với URL (pagination, filter)

❌ **DON'T**:
- Tự tạo component tương tự đã có trong `@repo/ui`
- Viết logic nghiệp vụ trực tiếp trong component
- Hard-code màu Hex hoặc string text
- Quản lý pagination/filter bằng useState thông thường

---

**Hết** 🎉
