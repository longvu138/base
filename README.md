# 📘 TenantOS - Multi-Tenant Monorepo Documentation

Dự án sử dụng kiến trúc **Monorepo** với **Turborepo**, tối ưu cho việc phát triển các ứng dụng SaaS hỗ trợ nhiều Tenant (khách hàng thuê bao) với giao diện và cấu hình riêng biệt.

---

## 📂 1. Cấu trúc Dự án

```bash
.
├── apps
│   ├── web                 # Web Application (React + Vite + Ant Design)
│   └── mobile              # Mobile Application (Optional)
├── packages                # Shared Logic & UI Libraries
│   ├── config              # Global Config (Theme defs)
│   ├── ui                  # Reusable Component Library
│   ├── hooks               # Business Logic Hooks
│   ├── i18n                # Multilingual System
│   ├── tenant-config       # Tenant Management System
│   ├── theme-provider      # React Context for Theming
│   ├── types               # TypeScript Interfaces
│   └── util                # Helper Utilities
```

---

## 🛠 2. Component Library (`@repo/ui`)

Bộ thư viện UI được thiết kế để tách biệt logic hiển thị khỏi logic dữ liệu.

### 2.1 TableComponent
Component bảng nâng cao, bao gồm header, actions và loading state. Không bao gồm phân trang (đã tách riêng).

**Props:**
- `title`: Tiêu đề bảng.
- `extra`: Khu vực chứa các nút hành động (Export, Create).
- `loading`: Trạng thái loading.
- `showEmpty`: Hiển thị empty state khi không có dữ liệu.

**Cách dùng:**
```tsx
<TableComponent 
    title="Danh sách đơn hàng"
    extra={<Button>Tạo mới</Button>}
    loading={isLoading}
>
    <Table columns={columns} dataSource={data} pagination={false} />
</TableComponent>
```

### 2.2 FilterPanel
Component bộ lọc thông minh, hỗ trợ form layout, collapse/expand.

**Cách dùng:**
```tsx
<FilterPanel
    form={form} // Antd Form Instance
    onSearch={handleSearch}
    onReset={handleReset}
    primaryContent={<Input name="query" />} // Luôn hiển thị
    secondaryContent={<Select name="status" />} // Ẩn/Hiện khi bấm nút mở rộng
/>
```

### 2.3 Pagination
Component phân trang tách rời, giúp dễ dàng tùy biến vị trí và giao diện theo từng Tenant.

**Cách dùng:**
```tsx
<Pagination 
    current={page} 
    pageSize={pageSize} 
    total={total} 
    onChange={(p, s) => setPage(p)} 
/>
```

---

## 🎨 3. Cấu hình Multi-Tenant & Theme

Hệ thống cho phép mỗi Tenant có một bộ màu sắc và cấu hình riêng biệt.

### 3.1 Cấu hình Màu sắc (`@repo/tenant-config`)
File: `packages/tenant-config/src/index.ts`

Để thêm một Tenant mới:
1. Mở file cấu hình.
2. Thêm object mới vào `tenantExamples`:

```typescript
my_tenant: {
    name: 'Tên Tenant',
    config: {
        colorPrimary: '#FF5733',        // Màu chủ đạo (Brand Color)
        colorBgLayout: '#FFF5F5',       // Màu nền App
        colorBgContainer: '#FFFFFF',    // Màu nền Card/Table
        borderRadius: 12,               // Độ bo góc
    }
}
```

### 3.2 Sử dụng màu trong Code (Tailwind)
Hệ thống tự động map các biến CSS vào Tailwind class:

| Class Tailwind | Ý nghĩa |
| :--- | :--- |
| `bg-primary` | Màu chủ đạo của Tenant. |
| `text-primary` | Chữ màu chủ đạo. |
| `bg-layout` | Màu nền tổng thể trang web. |
| `bg-container-bg` | Màu nền của các khối nội dung (Card). |

---

## 🌍 4. Đa Ngôn ngữ (`@repo/i18n`)

Sử dụng `i18next` để quản lý đa ngôn ngữ.

### Cấu hình:
- File dịch: `packages/i18n/src/locales/{vi,en}/translation.json`.
- Hook sử dụng: `useTranslation`.

**Cách dùng trong Component:**
```tsx
import { useTranslation } from '@repo/i18n';

const MyComponent = () => {
    const { t } = useTranslation();
    return <h1>{t('orders.title')}</h1>;
}
```

---

## 🎣 5. Hooks (`@repo/hooks`)

Logic nghiệp vụ được tách ra thành các Custom Hooks để tái sử dụng giữa Mobile và Web.

- **`usePaginationWithURL`**: Quản lý phân trang, tự động đồng bộ `page` và `pageSize` lên URL query params.
- **`useFilterWithURL`**: Quản lý bộ lọc form, đồng bộ filter values lên URL.
- **`useListOrderQuery`**: Gọi API lấy danh sách đơn hàng (React Query).
- **`useLogin` / `useLogout`**: Quản lý xác thực người dùng.

---

## 🚀 6. Hướng dẫn thêm Tính năng Mới

Ví dụ: **Thêm trang Quản lý Sản phẩm**.

1.  **Khai báo Type**: Thêm interface `Product` vào `packages/types`.
2.  **Tạo API Hook**: Thêm `useProductListQuery` vào `packages/hooks`.
3.  **Tạo Trang**: Tạo thư mục `apps/web/src/pages/Products`.
4.  **Dựng Giao diện**:
    -   Sử dụng `FilterPanel` để tạo bộ lọc.
    -   Sử dụng `TableComponent` để hiển thị dữ liệu.
    -   Sử dụng `Pagination` ở dưới cùng.
    -   Kết nối dữ liệu bằng hook `useProductListQuery`.
5.  **Đăng ký Route**: Thêm route vào `apps/web/src/routes.tsx` (trong PrivateRoute).

---

## ⚡ Start Project

```bash
pnpm install
pnpm dev
```
Truy cập: `http://localhost:3000`

---

## 💡 7. Case Study: Triển khai nhanh Trang "Đơn Ký Gửi"

Giả sử bạn cần tạo trang quản lý **Đơn Ký Gửi (Consignments)**. Đây là quy trình "Fast Track" sử dụng hệ sinh thái có sẵn.

### Bước 1: Chuẩn bị Hooks (Logic)
Tạo hook API `packages/hooks/src/useConsignmentsQuery.ts`.
Bạn có thể copy `useListOrderQuery` và sửa endpoint.

```typescript
// packages/hooks/src/useConsignmentsQuery.ts
import { useQuery } from '@tanstack/react-query';
// import { ConsignmentApi } from '@repo/api'; // Giả sử đã có API

export const useConsignmentsQuery = (params: any) => {
    return useQuery({
        queryKey: ['consignments', params],
        queryFn: async () => {
            // const res = await ConsignmentApi.getList(params);
            // return res.data;
            return { data: [], total: 0 }; // Mock tạm
        }
    });
};
```

### Bước 2: Dựng Trang (Giao diện)
Tạo file `apps/web/src/pages/Consignments/index.tsx`.
Copy template chuẩn dưới đây để có ngay **Filter + Table + Pagination** hoạt động với URL.

```tsx
import { Form, Input, Table } from 'antd';
import { FilterPanel, TableComponent, Pagination, Status } from '@repo/ui';
import { useFilterWithURL, usePaginationWithURL } from '@repo/hooks';
import { useConsignmentsQuery } from '@repo/hooks'; // Hook vừa tạo

export const ConsignmentsPage = () => {
    // 1. Setup Form & Hooks
    const [form] = Form.useForm();
    
    // Tự động đồng bộ page/pageSize với URL (?page=1&size=20)
    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL(); 
    
    // Tự động đồng bộ filters với URL (?q=abc&status=PENDING)
    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    // 2. Gọi API (Tự động refetch khi page/filters thay đổi)
    const { data, isLoading } = useConsignmentsQuery({
        page: page - 1,
        size: pageSize,
        ...filters
    });

    // 3. Define Columns
    const columns = [
        { title: 'Mã đơn', dataIndex: 'code', render: (t) => <b className="text-primary">{t}</b> },
        { title: 'Khách hàng', dataIndex: 'customerName' },
        { title: 'Trạng thái', dataIndex: 'status', render: (s) => <Status status={s} /> },
    ];

    // 4. Render Table UI
    return (
        <div className="space-y-4 p-6">
            {/* Bộ lọc */}
            <FilterPanel
                form={form}
                onSearch={() => applyFilters(form.getFieldsValue())}
                onReset={clearFilters}
                primaryContent={
                    <div className="grid grid-cols-4 gap-4">
                        <Form.Item name="q" label="Tìm kiếm">
                            <Input placeholder="Mã đơn, SĐT..." />
                        </Form.Item>
                        <Form.Item name="status" label="Trạng thái">
                            <Input placeholder="Chọn trạng thái..." />
                        </Form.Item>
                    </div>
                }
            />

            {/* Bảng dữ liệu */}
            <TableComponent
                title="Danh sách Đơn Ký Gửi"
                loading={isLoading}
                totalCount={data?.total || 0}
            >
                <Table
                    columns={columns}
                    dataSource={data?.data || []}
                    pagination={false} // Tắt pagination mặc định của Antd Table
                    rowKey="id"
                />
            </TableComponent>

            {/* Phân trang rời (Kết nối Hook) */}
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

### Tại sao cách này nhanh và đúng?
1.  **No Boilerplate**: Hook `usePaginationWithURL` và `useFilterWithURL` đã xử lý hết logic đồng bộ URL state phức tạp. Bạn không cần viết `useEffect` hay `history.push` thủ công.
2.  **No UI duplication**: `TableComponent` và `FilterPanel` đã lo phần layout, loading state, header title.
3.  **Consistency**: Tất cả các trang (Order, Consignment, Product...) đều có hành vi giống hệt nhau (Reload trang vẫn giữ filter, back button hoạt động đúng).
