const express = require("express");
const cors = require("cors");

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, override) {
  if (!isPlainObject(base)) return override;
  if (!isPlainObject(override)) return base;

  const result = { ...base };
  Object.entries(override).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  });
  return result;
}

const VARIANT_NAMES = {
  default: "Giao diện mặc định",
  thanhla: "Giao diện Thanhla",
  gobiz: "Giao diện Gobiz",
};

const PLAN_PRESETS = {
  free: {
    tenantConfig: {
      themeConfig: {
        colorPrimary: "#1677ff",
        colorBgLayout: "#f5f8ff",
        colorBorder: "#d9d9d9",
        borderRadius: 8,
        colorBgLayoutDark: "#0d1b2a",
      },
    },
  },
  paid: {
    tenantConfig: {
      themeConfig: {
        colorPrimary: "#722ed1",
        colorBgLayout: "#f9f5ff",
        colorBorder: "#c7b5eb",
        borderRadius: 12,
        colorBgLayoutDark: "#1a0f2e",
      },
    },
  },
};

/**
 * === ĐỊNH NGHĨA CÁC BIẾN MÀU (THEME VARIABLES) ===
 * Các biến màu dưới đây được cấu hình trong themeConfig để tuỳ biến giao diện (Ant Design) cho từng Tenant:
 *
 * 1. colorPrimary:
 *    - Là màu gì: Màu sắc chủ đạo (Primary color) đại diện cho thương hiệu.
 *    - Dùng ở đâu: Dùng cho các nút bấm chính (Primary Button), viền của Input/Select khi focus, màu chữ của đường link, trạng thái active của Menu/Tabs, và các thành phần nhấn mạnh (Call to Action).
 *
 * 2. colorBgLayout:
 *    - Là màu gì: Màu nền tổng thể của Layout (áp dụng cho giao diện Sáng - Light mode).
 *    - Dùng ở đâu: Dùng làm màu nền nằm dưới các khối nội dung (Card/Panel), giúp tạo không gian phân cách và làm nổi bật các khối nội dung chính.
 *
 * 3. colorBgLayoutDark:
 *    - Là màu gì: Màu nền tổng thể của Layout (áp dụng cho giao diện Tối - Dark mode).
 *    - Dùng ở đâu: Chức năng tương tự như colorBgLayout nhưng được sử dụng làm nền tổng thể khi ứng dụng chuyển sang chế độ Dark mode (thường là các màu tối sâu như đen, xanh đen).
 *
 * === CẤU HÌNH TENANTS ===
 * Khôi phục đầy đủ màu sắc và cấu hình lồng ghép đúng như ban đầu.
 */
const tenants = {
  baogam: {
    name: "Báo Gấm",
    planCode: "free",
    variantCode: "default",
    override: {
      tenantConfig: {
        themeConfig: {
          colorPrimary: "#1890ff",
        },
      },
    },
  },
  thien_long: {
    name: "Thiên Long Express",
    planCode: "free",
    variantCode: "default",
    override: {
      tenantConfig: {
        themeConfig: {
          colorPrimary: "#ff4d4f",
          colorBgLayout: "#fff1f0",
          colorBgLayoutDark: "#2d0a0a",
          borderRadius: 4,
        },
      },
    },
  },
  free_sample_3: {
    name: "Free Tenant 3",
    planCode: "free",
    variantCode: "default",
    override: {
      tenantConfig: {
        themeConfig: {
          colorPrimary: "#13c2c2",
          colorBorder: "#36cfc9",
        },
      },
    },
  },
  gobiz: {
    name: "Gobiz Logistics",
    planCode: "paid",
    variantCode: "gobiz",
    override: {
      tenantConfig: {
        themeConfig: {
          colorPrimary: "#722ed1",
          colorBorder: "#9254de",
        },
      },
    },
  },
  tetetete: {
    name: "Te te nè Express",
    planCode: "paid",
    variantCode: "thanhla",
    override: {
      tenantConfig: {
        themeConfig: {
          colorPrimary: "#ff4d4f",
          colorBgLayout: "#fff1f0",
          colorBgLayoutDark: "#000000",
        },
      },
    },
  },
  thanhla: {
    name: "Thanhla Logistics",
    planCode: "paid",
    variantCode: "thanhla",
    override: {
      tenantConfig: {
        themeConfig: {
          colorPrimary: "#0ea5e9",
          colorBorder: "#7dd3fc",
          borderRadius: 10,
        },
      },
    },
  },
};

function resolveTenantConfig(tenantId) {
  console.log(`Resolving tenant config for ${tenantId}`);
  const fallbackId = "baogam";
  const tenant = tenants[tenantId] || tenants[fallbackId];
  const variantCode = VARIANT_NAMES[tenant.variantCode]
    ? tenant.variantCode
    : "default";
  const plan = PLAN_PRESETS[tenant.planCode] || PLAN_PRESETS.free;

  const resolved = deepMerge(plan, tenant.override || {});

  const resolvedId = tenants[tenantId] ? tenantId : fallbackId;
  return {
    id: resolvedId,
    tenant: resolvedId,
    name: tenant.name,
    variantCode,
    ...resolved,
  };
}

app.get("/api/tenants/:id/config", (req, res) => {
  const tenantId = req.params.id;
  res.json(resolveTenantConfig(tenantId));
});

app.listen(port, () => {
  console.log(`UI Server mapping running at http://localhost:${port}`);
});
