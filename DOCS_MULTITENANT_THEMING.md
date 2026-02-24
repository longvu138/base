# DOCS: Hệ thống Multi-Tenant Theming

> **Tài liệu này giải thích toàn bộ luồng hoạt động** từ lúc người dùng chọn tenant, cho đến khi giao diện thay đổi theo đúng config theme của tenant đó.

---

## 📐 Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                         Người dùng chọn Tenant                  │
│                    (Dropdown trong Header/Sider)                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ dispatchTenantChange('gobiz')
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              localStorage + CustomEvent: 'app:tenant-changed'   │
└──────────┬──────────────────────────────────────────────────────┘
           │
    ┌──────▼──────┐           ┌────────────────────────────────┐
    │   App.tsx   │──fetch──▶ │  API: /api/tenants/:key/config │
    │  (listener) │           │  (localhost:3003 local server) │
    └──────┬──────┘           └────────────────────────────────┘
           │ setGlobalTenantConfig(data)
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ThemeContext (React Context)                 │
│   tenantConfig: FullTenantResponse                              │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  tenantConfig.tenantConfig.themeConfig:                 │   │
│   │    variant: 'gd1' | 'gd3'                               │   │
│   │    colorPrimary: '#FF6B35'                              │   │
│   │    colorPrimaryDark: '#FF8C5A'                          │   │
│   │    borderRadius: 8                                      │   │
│   │    uiLib: 'antd' | 'mui'                                │   │
│   │    variants: { login: 'LoginStyle2', ... }              │   │
│   └─────────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────────┘
                 │
     ┌───────────┴────────────┐
     │                        │
     ▼                        ▼
┌─────────────┐      ┌─────────────────────────────────┐
│ AntD Theme  │      │  CSS Variables (document.root)  │
│ ConfigProv  │      │  --tenant-primary-color: #FF6B35 │
│ (token +    │      │  --tenant-bg-container: ...      │
│  component  │      │  --tenant-radius-antd: 8px       │
│  overrides) │      └─────────────────────────────────┘
└─────────────┘
```

---

## 🔄 Luồng chi tiết từng bước

### Bước 1 — Khởi động & load tenant từ cache

```typescript
// App.tsx
const [selectedTenantId, setSelectedTenantId] = useState(() => {
    // Đọc tenant đã chọn lần trước từ localStorage
    return localStorage.getItem('selected-tenant') || 'baogam';
});

useEffect(() => {
    // Nếu đã có cache từ session trước, apply ngay để tránh flash trắng
    const cached = localStorage.getItem('full-tenant-data');
    if (cached && !globalTenantConfig) {
        setGlobalTenantConfig(JSON.parse(cached));
    }
}, []);
```

### Bước 2 — Lắng nghe sự kiện thay đổi tenant

```typescript
// App.tsx — lắng nghe CustomEvent từ bất kỳ component nào
useEffect(() => {
    const handleTenantChange = (e: any) => {
        setSelectedTenantId(e.detail); // 'gobiz', 'baogam', ...
    };
    window.addEventListener('app:tenant-changed', handleTenantChange);
    return () => window.removeEventListener('app:tenant-changed', handleTenantChange);
}, []);
```

### Bước 3 — Fetch config từ API khi tenant thay đổi

```typescript
// App.tsx — mỗi khi selectedTenantId đổi, gọi API lấy full config
useEffect(() => {
    fetchTenantConfigFromAPI(selectedTenantId).then(data => {
        setGlobalTenantConfig(data);  // lưu vào Context
        localStorage.setItem('full-tenant-data', JSON.stringify(data)); // cache lại
    });
}, [selectedTenantId]);

// API endpoint format:
// GET http://localhost:3003/api/tenants/gobiz/config
// Response: FullTenantResponse
```

### Bước 4 — Apply config vào AntD và CSS Variables

```typescript
// App.tsx — đồng bộ mỗi khi tenantConfig thay đổi
const tenantConfig = globalTenantConfig?.tenantConfig?.themeConfig;

// 4a. Apply CSS Variables lên document.documentElement
updateTenantCSSVariables(tenantConfig, isDark);
// → --tenant-primary-color, --tenant-bg-container, ...

// 4b. Merge vào AntD ConfigProvider token
const baseTheme = isDark ? webDarkAntdTheme : webAntdTheme;
const finalTheme = applyTenantConfig(baseTheme, tenantConfig, isDark);
// → token.colorPrimary, token.borderRadius, component overrides
```

### Bước 5 — Kích hoạt thay đổi từ UI

```typescript
// Bất kỳ component nào (VD: Dropdown chọn tenant trong Header)
import { dispatchTenantChange } from '@repo/tenant-config';

// Gọi hàm này khi user chọn tenant
dispatchTenantChange('gobiz');

// Nội bộ hàm này làm 2 việc:
// 1. Ghi vào localStorage: 'selected-tenant' = 'gobiz'
// 2. Phát sự kiện: window.dispatchEvent(new CustomEvent('app:tenant-changed', { detail: 'gobiz' }))
```

---

## 🎨 Cơ chế phát hiện & chuyển giao diện (Variant)

Đây là phần cốt lõi để mỗi tenant hiển thị đúng giao diện riêng.

### Config tenant mẫu

```json
// Response từ GET /api/tenants/gobiz/config
{
  "id": "gobiz",
  "name": "Gobiz Logistics",
  "code": "gobiz",
  "tenantConfig": {
    "themeConfig": {
      "variant": "gd3",          // ← Bộ giao diện toàn cục
      "colorPrimary": "#1677FF",
      "colorPrimaryDark": "#4096FF",
      "borderRadius": 12,
      "uiLib": "antd",
      "variants": {              // ← Override giao diện cho trang cụ thể (tùy chọn)
        "login": "LoginStyle2",  // Ghi đè: trang login dùng Style2
        "orders": "OrdersCombined"
      }
    }
  }
}
```

### `useVariant(pageKey)` — Hook resolve tên component

```typescript
// packages/theme-provider/src/ThemeContext.tsx

export function useVariant(pageKey: string): string {
    const globalVariant = useVariantCode(); // 'gd1', 'gd3', ...

    // 1. Ưu tiên override cụ thể trong config
    if (themeConfig?.variants?.[pageKey]) {
        return themeConfig.variants[pageKey]; // VD: 'LoginStyle2'
    }

    // 2. Quy tắc đặc biệt (layout riêng)
    if (pageKey === 'layout') {
        const layoutMap = { 'gd3': 'SpecializedLayout' };
        return layoutMap[globalVariant] || 'VerticalLayout';
    }

    // 3. Quy tắc kết hợp đặc biệt
    if (globalVariant === 'gd3' && pageKey === 'orders') return 'OrdersCombined';

    // 4. Convention mặc định: gd1→Style1, gd2→Style2, gd3→Style3
    const styleNumber = globalVariant.replace(/\D/g, '') || '1'; // 'gd3' → '3'
    return `${capitalize(pageKey)}Style${styleNumber}`;          // 'DeliveryRequestsStyle3'
}
```

### Bảng ánh xạ Variant → Component

| Tenant | Variant | Trang | Component được load |
|--------|---------|-------|---------------------|
| Baogam | `gd1` | `/orders` | `OrdersStyle1` |
| Baogam | `gd1` | `/shipments` | `ShipmentsStyle1` (Shipments.tsx) |
| Baogam | `gd1` | `/delivery-requests` | `DeliveryRequestsStyle1` |
| Gobiz | `gd3` | `/orders` | `OrdersCombined` (quy tắc đặc biệt) |
| Gobiz | `gd3` | `/delivery-requests` | `DeliveryRequestsStyle3` |

### `DynamicVariant` — Load component đúng theo variant

```typescript
// pages/Orders/index.tsx
export const Orders = () => {
    const variant = useVariant('orders'); // → 'OrdersStyle1' hoặc 'OrdersCombined'

    // Vite glob import: scan tất cả .tsx trong thư mục hiện tại
    const modules = import.meta.glob('./*.tsx');

    return (
        <DynamicVariant
            variantName={variant}        // Tên file cần load
            modules={modules}            // Tất cả file có thể load
            fallbackName="OrdersStyle1"  // Nếu không tìm thấy, dùng default
            featureName="Orders"
        />
    );
};
```

`DynamicVariant` hoạt động như sau:
1. Tìm trong `modules` entry có key chứa `variantName` (VD: `'./OrdersStyle3.tsx'`)
2. Gọi **dynamic `import()`** — Vite sẽ code-split, chỉ tải file đó
3. Render component được export

---

## 🌗 Dark Mode

Dark mode hoạt động độc lập với tenant. `ThemeContext` theo dõi cả 2:

```typescript
// ThemeContext.tsx
const [theme, setTheme] = useState<'light' | 'dark'>('light');

useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
}, [theme]);
```

Khi dark mode bật, `updateTenantCSSVariables(config, isDark=true)` sẽ:
- Dùng `colorPrimaryDark` thay vì `colorPrimary`
- Dùng `colorBgContainerDark` thay vì `colorBgContainer`
- v.v.

Tailwind dark mode đọc class `.dark` trên `<html>`, CSS variables automatically reflect giá trị dark.

---

## 🗂 Cấu trúc file quan trọng

```
packages/
├── config/
│   └── app.ts                    # Env vars (APP_X_TENANT, APP_API_URL, ...)
├── tenant-config/
│   └── src/index.ts              # Types, applyTenantConfig, updateTenantCSSVariables, dispatchTenantChange
├── theme-provider/
│   └── src/ThemeContext.tsx      # ThemeProvider, useTheme, useVariant, useVariantCode
└── util/
    └── src/Api/interceptor.ts    # Tự động gắn X-tenant header vào mọi API request

apps/web/src/
├── App.tsx                       # Fetch tenant config, apply vào AntD + CSS
├── routes.tsx                    # Khai báo routes
├── pages/
│   ├── Orders/
│   │   ├── index.tsx             # DynamicVariant wrapper
│   │   ├── OrdersStyle1.tsx      # Giao diện Baogam
│   │   └── OrdersStyle3.tsx      # Giao diện Gobiz
│   └── DeliveryRequests/
│       ├── index.tsx             # DynamicVariant wrapper
│       ├── DeliveryRequestsStyle1.tsx  # Giao diện Baogam
│       └── DeliveryRequestsStyle3.tsx  # Giao diện Gobiz
└── components/Layout/
    ├── Navigation.ts             # Menu items theo variant
    └── VerticalLayout.tsx        # Sidebar + Header layout
```

---

## ➕ Cách thêm Tenant mới

### 1. Thêm vào `tenantExamples` (hiển thị trong dropdown)
```typescript
// packages/tenant-config/src/index.ts
export const tenantExamples = {
    baogam: { name: 'Báo Gấm' },
    gobiz: { name: 'Gobiz Logistics' },
    my_tenant: { name: 'Tenant Mới' }, // ← Thêm vào đây
};
```

### 2. Thêm config trong API server (`localhost:3003`)
```json
// API: GET /api/tenants/my_tenant/config
{
  "tenantConfig": {
    "themeConfig": {
      "variant": "gd1",
      "colorPrimary": "#8B5CF6"
    }
  }
}
```

### 3. (Tùy chọn) Tạo CSS file cho tenant
```css
/* apps/web/src/styles/tenants/my_tenant.css */
:root {
    --tenant-primary-color: #8B5CF6;
}
```

---

## ➕ Cách thêm trang mới hỗ trợ Multi-Tenant

### 1. Tạo API + Hook
```bash
packages/api/src/MyFeatureApi.ts      # API methods
packages/hooks/src/useMyFeatureHooks.ts  # React Query hooks
```

### 2. Tạo các Style variant
```bash
apps/web/src/pages/MyFeature/
├── MyFeatureStyle1.tsx   # Baogam (gd1)
├── MyFeatureStyle3.tsx   # Gobiz (gd3)
└── index.tsx             # DynamicVariant wrapper
```

### 3. `index.tsx` — luôn theo template này
```typescript
export const MyFeature = () => {
    const variant = useVariant('myFeature'); // 'MyFeatureStyle1' hoặc 'MyFeatureStyle3'
    const modules = import.meta.glob('./*.tsx');
    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="MyFeatureStyle1"
            featureName="MyFeature"
        />
    );
};
```

### 4. Thêm route trong `routes.tsx`
```tsx
<Route path="my-feature" element={<MyFeature />} />
```

### 5. Thêm vào `Navigation.ts`
```typescript
{ key: '/my-feature', icon: React.createElement(SomeIcon), label: 'Tính năng mới', path: '/my-feature' }
```

> **Convention tự động**: `gd1` → `MyFeatureStyle1`, `gd3` → `MyFeatureStyle3`.  
> Không cần thêm bất kỳ mapping nào nếu tuân theo naming convention.

---

## 🔍 Debug: Kiểm tra tenant đang active

Mở DevTools Console:
```javascript
// Xem tenant đang active
localStorage.getItem('selected-tenant')

// Xem full config đang dùng
JSON.parse(localStorage.getItem('full-tenant-data'))

// Xem CSS variables đang áp dụng
getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary-color')

// Tự kích hoạt chuyển tenant (không cần UI)
window.dispatchEvent(new CustomEvent('app:tenant-changed', { detail: 'gobiz' }))
```
