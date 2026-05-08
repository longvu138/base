# Quy Trình Thêm Tenant Mới với Giao Diện (UI) Riêng Biệt

Tài liệu này hướng dẫn các bước chi tiết để triển khai một Tenant mới (ví dụ: `newclient`) sử dụng một phong cách giao diện hoàn toàn mới (ví dụ: `gd4` - `Style4`) trong khi vẫn giữ nguyên 100% logic nghiệp vụ hiện có.

---

## Bước 1: Cấu hình Backend (Tenant Server)

Mở file `apps/tenant-server/src/index.js` và thêm cấu hình cho Tenant mới vào mảng `tenants`.

```javascript
{
    id: 'newclient',
    tenant: 'newclient',
    name: 'New Client Logistics',
    variantCode: 'gd4', // Mã giao diện mới (ví dụ: Style 4)
    tenantConfig: {
        themeConfig: {
            uiLib: 'antd',
            colorPrimary: '#ff4d4f', // Màu thương hiệu riêng (ví dụ: đỏ)
            borderRadius: 8,
            // Các token màu sắc khác nếu cần...
        }
    }
}
```

## Bước 2: Đăng ký Tenant tại Frontend

Mở file `packages/tenant-config/src/index.ts` và thêm ID của tenant mới vào danh sách `getTenantOptions` (để hiển thị trong bộ chọn ở header).

```typescript
// Thêm vào mảng tenant options
{ label: 'New Client', value: 'newclient' },
```

## Bước 3: Định nghĩa Mapping Giao Diện (Style Mapping)

Mở file `packages/theme-provider/src/variantDefaults.ts` để định nghĩa xem mã `gd4` sẽ sử dụng những Component Style nào cho từng trang.

```typescript
const VARIANT_DEFAULTS: Record<string, VariantDefaults> = {
    gd4: {
        componentOverrides: {
            layout: 'NewClientLayout', // Layout riêng (nếu cần)
            login: 'LoginStyle4',      // Trang login riêng
            register: 'RegisterStyle4', 
            orders: 'OrdersStyle4',
            // Trang nào chưa có Style 4 thì có thể trỏ về Style 1 để dùng tạm
        },
        menu: {
            preset: 'base', // hoặc 'gobiz'
            hiddenKeys: [],
        },
        features: {
            shipmentStatusDisplay: 'filter',
        },
    },
    // ...
}
```

## Bước 4: Tạo Layout mới (Nếu cần thiết)

Nếu Tenant yêu cầu cấu trúc khung (Header, Sidebar, Tabbar) khác biệt:
1.  Tạo file mới tại `apps/web/src/components/Layout/NewClientLayout.tsx`.
2.  Sử dụng `<Outlet />` để render nội dung các trang bên trong.
3.  Mapping tên `NewClientLayout` này vào bước 3.

## Bước 5: Triển khai các trang UI mới

Tại mỗi thư mục trang (ví dụ: `apps/web/src/pages/Login/`):
1.  Tạo file UI mới: `LoginStyle4.tsx`.
2.  **Nguyên tắc**: Copy cấu trúc nhận props (`form`, `onFinish`, `isLoading`,...) từ `LoginStyle1.tsx`.
3.  Chỉ thay đổi phần JSX (HTML/CSS), **tuyệt đối không** gọi API hay viết logic xử lý dữ liệu trong file này.
4.  Hệ thống `DynamicVariant` sẽ tự động quét và load file này.

> [!TIP]
> Bạn có thể sử dụng các script trong thư mục `scratch/` để tạo nhanh hàng loạt file "vỏ" (boilerplate) cho Style mới từ Style có sẵn, sau đó mới vào chỉnh sửa chi tiết.

## Bước 6: Kiểm tra (QA)

1.  **Backend**: Đảm bảo Tenant Server đang chạy.
2.  **Frontend**: Mở trình duyệt, chọn Tenant `newclient` từ bộ chọn.
3.  **Xác nhận**: Kiểm tra xem giao diện đã chuyển sang Style 4 chưa và các chức năng (logic) còn hoạt động chính xác không.

## Bước 7: Tùy biến Menu (Gộp, Ẩn hoặc Đổi tên mục)

Nếu Tenant mới yêu cầu cấu trúc Menu khác (ví dụ: Gộp "Đơn hàng" và "Ký gửi" thành "Quản lý đơn"), bạn có 2 cách tiếp cận:

### Cách A: Tùy biến nhanh (Dùng config)
Nếu bạn chỉ muốn ẩn bớt và đổi tên mục có sẵn để "giả" gộp menu, hãy sửa trong `packages/theme-provider/src/variantDefaults.ts`:

```typescript
gd4: {
    // ...
    menu: {
        preset: 'base',
        hiddenKeys: ['/shipments'], // Ẩn đơn ký gửi
        labelOverrides: { 
            '/orders': 'Quản lý đơn' // Đổi tên Đơn hàng thành Quản lý đơn
        },
    }
}
```

### Cách B: Tạo cấu trúc Menu riêng (Dùng Preset)
Nếu cấu trúc gộp phức tạp hơn (ví dụ: gộp nhiều mục thành 1 mục hoàn toàn mới với logic chuyển hướng riêng):
1. Mở `apps/web/src/components/Layout/Navigation.ts`.
2. Định nghĩa một mảng Menu mới (ví dụ: `NEWCLIENT_MENU_ITEMS`).
3. Cập nhật hook `useNavigation` để trả về mảng này khi gặp preset tương ứng.
4. Trong `variantDefaults.ts`, set `preset: 'newclient'`.

---

## Lưu ý quan trọng:
- **Tách biệt Logic**: Luôn sử dụng hooks từ `@repo/hooks` thông qua `index.tsx` của trang, không bao giờ import hooks trực tiếp vào file Style.
- **CSS**: Ưu tiên dùng Tailwind CSS để tránh xung đột style giữa các Tenant khác nhau.
- **Dùng lại (Reuse)**: Nếu một trang của Tenant mới không cần giao diện riêng, hãy để nó mặc định dùng `Style1` để tiết kiệm thời gian.
- **Tùy biến Menu**: Ưu tiên dùng `labelOverrides` và `hiddenKeys` (Cách A) để giữ code base sạch sẽ và dễ quản lý nhất.
