# Luồng hoạt động: Thay đổi màu sắc từ API Tenant Config

> Tài liệu mô tả chi tiết luồng kỹ thuật từ lúc gọi API đến lúc màu sắc thực sự thay đổi trên giao diện,
> áp dụng chung cho cả **Web** (`apps/web`) và **Mobile** (`apps/mobile`).

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SHARED PACKAGES (monorepo)                         │
│                                                                             │
│  @repo/tenant-config          @repo/theme-provider        @repo/antd-config │
│  ┌──────────────────┐         ┌──────────────────┐        ┌──────────────┐  │
│  │ SimpleTenantConfig│         │  ThemeContext     │        │webAntdTheme  │  │
│  │ applyTenantConfig│         │  ThemeProvider    │        │mobileAntdTheme│ │
│  │ updateTenantCSS  │         │  useTheme()       │        │darkAntdTheme │  │
│  └──────────────────┘         └──────────────────┘        └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
           ▲                           ▲                          ▲
           │ import                    │ import                   │ import
  ┌────────┴──────────┐      ┌─────────┴────────┐
  │   apps/web/App.tsx│      │apps/mobile/App.tsx│
  └───────────────────┘      └──────────────────┘
```

---

## 2. Luồng khởi động (App mount lần đầu)

```
App mount
   │
   ▼
[1] ThemeProvider (packages/theme-provider)
   │  - Khởi tạo state: theme='light'|'dark' (đọc từ localStorage)
   │  - Khởi tạo state: tenantConfig = null
   │  - Gắn class 'dark' lên <html> nếu dark mode
   │
   ▼
[2] AppContent render lần đầu
   │  - Đọc selectedTenantId từ localStorage (mặc định: 'baogam')
   │  - antdTheme = applyTenantConfig(baseTheme, undefined) → dùng base theme
   │  - Giao diện render với màu mặc định từ @repo/antd-config
   │
   ▼
[3] useEffect: đăng ký lắng nghe sự kiện tenant thay đổi
   │  window.addEventListener('app:tenant-changed', ...)
   │
   ▼
[4] useEffect: gọi fetchAppData(selectedTenantId)
      ── LUỒNG API (xem mục 3) ──▶
```

---

## 3. Luồng gọi API và áp dụng config

```
fetchAppData(tenantId)
   │
   ├── [Song song] GET /api/tenants/:tenantId/config  → { themeConfig, variantCode, ... }
   └── [Song song] GET /api/ui-variants               → [{ code, name, config }]
   │
   ▼ Promise.all resolve
[5] Merge kết quả:
   │  data = { ...tenantData, uiVariants: variantsData }
   │
   ▼ .then(data => ...)
[6] setGlobalTenantConfig(data)
   │  → cập nhật ThemeContext (React re-render toàn cây)
   │
[7] localStorage.setItem('full-tenant-data', JSON.stringify(data))
   │  → cache cho lần sau nếu API lỗi
   │
[8] setUiLib(data.tenantConfig?.themeConfig?.uiLib)
      → cập nhật uiLib trong ThemeContext ('antd' | 'mui')
```

**Trường hợp API lỗi:**
```
.catch(err)
   │
   ├── Có cache localStorage?
   │     └── YES → setGlobalTenantConfig(JSON.parse(cached))
   │
   └── NO  → setGlobalTenantConfig(FALLBACK_TENANT_CONFIG)
                { variantCode: 'gd1', themeConfig: {} }
```

---

## 4. Luồng áp dụng màu sau khi có config

Sau bước [6], React re-render `AppContent`. Có **2 luồng song song**:

### 4A. Luồng Ant Design Token (component styles)

```
themeConfig thay đổi
   │
   ▼
useMemo: antdTheme = ...
   │
   ├── [Web]    base = isDark ? webDarkAntdTheme   : webAntdTheme
   └── [Mobile] base = isDark ? mobileDarkAntdTheme : mobileAntdTheme
   │            (từ @repo/antd-config — font/size/radius khác nhau)
   │
   ▼
applyTenantConfig(base, themeConfig, isDark)  ← packages/tenant-config
   │
   ├── getResolvedConfig(themeConfig, isDark):
   │     - Nếu isDark=true: ghi đè colorPrimary/colorBgLayout/...
   │       bằng các giá trị *Dark (colorPrimaryDark, colorBgLayoutDark...)
   │
   └── return {
           ...base,
           token: { ...base.token, ...resolvedConfig },
           components: merge(base.components, resolvedConfig.components)
       }
   │
   ▼
<ConfigProvider theme={antdTheme}>
   │
   └── antd CSS-in-JS sinh lại toàn bộ token → button/input/table/...
       đổi màu theo colorPrimary, colorBgLayout, borderRadius, v.v.
```

**Sự khác nhau giữa Web và Mobile ở bước này:**

| Tham số base theme     | Web            | Mobile         |
|------------------------|----------------|----------------|
| `fontSize`             | 14px           | 16px           |
| `borderRadius`         | 8px            | 12px           |
| `controlHeight`        | 32px           | 44px           |
| `lineHeight`           | (mặc định)     | 1.6            |

> Tenant config (màu) ghi đè lên base theme, nhưng size/font do từng app tự định nghĩa.

---

### 4B. Luồng CSS Variables (dùng cho Tailwind / CSS thuần)

```
themeConfig hoặc isDark thay đổi
   │
   ▼
useEffect → updateTenantCSSVariables(themeConfig, isDark)
   │
   ├── getResolvedConfig(themeConfig, isDark)
   │     → swap *Dark values nếu isDark=true
   │
   ├── Ghi các CSS var "active" lên document.documentElement:
   │     --tenant-primary-color  ← colorPrimary (đã resolved)
   │     --tenant-bg-container   ← colorBgContainer
   │     --tenant-bg-layout      ← colorBgLayout
   │     --tenant-border-color   ← colorBorder
   │     --tenant-text-color     ← colorText
   │
   ├── Ghi các CSS var "dark raw" (giá trị gốc, chưa swap):
   │     --tenant-primary-dark
   │     --tenant-bg-container-dark
   │     --tenant-bg-layout-dark
   │     --tenant-border-color-dark
   │     --tenant-text-color-dark
   │
   ├── Ghi thêm các màu trạng thái:
   │     --tenant-success-color  ← colorSuccess
   │     --tenant-warning-color  ← colorWarning
   │     --tenant-error-color    ← colorError
   │     --tenant-radius-antd    ← borderRadius + 'px'
   │
   └── Tính RGB từ colorPrimary (hex):
         --tenant-primary-rgb    ← "r g b"  (dùng cho rgba())
```

---

## 5. Luồng khi người dùng chuyển Tenant (runtime)

```
User chọn tenant khác trên UI
   │
   ▼
dispatchTenantChange(tenantKey)   ← packages/tenant-config
   │
   ├── localStorage.setItem('selected-tenant', tenantKey)
   └── window.dispatchEvent(new CustomEvent('app:tenant-changed', { detail: tenantKey }))
   │
   ▼
AppContent nhận sự kiện (listener đã đăng ký ở bước 3):
   setSelectedTenantId(tenantKey)
   │
   ▼ state thay đổi → useEffect[selectedTenantId] trigger
   → Quay lại luồng từ Bước [4] (mục 3)
```

---

## 6. Luồng khi người dùng chuyển Dark/Light Mode

```
User bấm toggle dark mode
   │
   ▼
toggleTheme()   ← ThemeContext
   │
   ├── setTheme('dark' | 'light')
   └── localStorage.setItem('theme-mode', ...)
       document.documentElement.classList.toggle('dark', ...)
   │
   ▼ isDark thay đổi → 2 useEffect trigger:

   [Luồng 4A] useMemo antdTheme tính lại:
               base = mobileDarkAntdTheme | webDarkAntdTheme
               applyTenantConfig(base, themeConfig, isDark=true)
               → colorPrimaryDark ghi đè colorPrimary
               → colorBgLayoutDark ghi đè colorBgLayout
               <ConfigProvider> re-render → antd component đổi màu

   [Luồng 4B] useEffect updateTenantCSSVariables(themeConfig, isDark=true):
               → CSS variables được cập nhật với giá trị *Dark
               → Tailwind class dark: / CSS var trên page thay đổi ngay
```

---

## 7. Sơ đồ tổng hợp (end-to-end)

```
Trigger: mount / tenant change / dark toggle
        │
        ▼
    fetchAppData()
    ├── GET /api/tenants/:id/config
    └── GET /api/ui-variants
        │
        ▼
    setGlobalTenantConfig(data)
    → ThemeContext cập nhật
        │
        ├──────────────────────────────────────────────────────┐
        ▼                                                      ▼
    [useMemo] antdTheme                              [useEffect] CSS Variables
        │                                                      │
    applyTenantConfig(base, themeConfig, isDark)    updateTenantCSSVariables(themeConfig, isDark)
        │                                                      │
    getResolvedConfig (swap *Dark nếu dark)         getResolvedConfig (swap *Dark)
        │                                                      │
    merge token: base + tenant                      ghi vào document.documentElement
        │                                            --tenant-primary-color
    <ConfigProvider theme={antdTheme}>              --tenant-bg-layout
        │                                            --tenant-primary-rgb
    antd CSS-in-JS sinh lại                         --tenant-radius-antd ...
    Button / Input / Table / ...                           │
    đổi màu theo token mới                         CSS thuần / Tailwind đọc var
                                                   → đổi màu tức thì
```

---

## 8. Điểm khác nhau giữa Web và Mobile

| Khía cạnh                  | Web (`apps/web`)                        | Mobile (`apps/mobile`)               |
|----------------------------|-----------------------------------------|--------------------------------------|
| Base theme Light           | `webAntdTheme`                          | `mobileAntdTheme`                    |
| Base theme Dark            | `webDarkAntdTheme`                      | `mobileDarkAntdTheme`                |
| fontSize cơ bản            | 14px                                    | 16px                                 |
| controlHeight (input/btn)  | 32px                                    | 44px                                 |
| borderRadius cơ bản        | 8px                                     | 12px                                 |
| URL tenant API             | `${appConfig.be}/api/...` (từ .env)     | `http://localhost:3003/api/...` (hardcode) |
| ReactQueryDevtools         | Không có                                | Có                                   |
| Tenant config token (màu)  | **Giống nhau** — đều dùng `applyTenantConfig` và `updateTenantCSSVariables` từ `@repo/tenant-config` |

> **Lưu ý**: Mobile đang hardcode URL `localhost:3003` thay vì đọc từ `appConfig.be` như Web.
> Cần cân nhắc thống nhất.
