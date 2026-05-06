const express = require('express');
const cors = require('cors');

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

/**
 * === DANH SÁCH CẤU HÌNH GIAO DIỆN MẪU (UI VARIANTS) ===
 * Chứa các "quy tắc" chung cho từng bộ giao diện.
 * Cấu trúc này giúp bạn thay đổi giao diện hàng loạt mà không cần sửa từng Tenant.
 */
const UI_VARIANTS = [
  {
    code: 'gd1',
    name: 'Giao diện Phổ thông',
    config: {
      layout: 'VerticalLayout',
      menu: {
        hiddenKeys: [],
        labelOverrides: {}
      },
      pages: {
        orderDetail: 'OrderDetailStyle1',
      }
    }
  },
  {
    code: 'gd2',
    name: 'Giao diện Hiện đại',
    config: {
      layout: 'VerticalLayout',
      menu: {
        hiddenKeys: [],
        labelOverrides: {}
      },
      pages: {
        orderDetail: 'OrderDetailStyle1',
      }
    }
  },
  {
    code: 'gd3',
    name: 'Giao diện Premium (Gobiz Theme)',
    config: {
      layout: 'SpecializedLayout',
      menu: {
        hiddenKeys: ['/shipments'],
        labelOverrides: {
          '/orders': 'Quản lý Tổng hợp'
        }
      },
      features: {
        shipmentStatusDisplay: 'tabs'
      },
      pages: {
        orders: 'OrdersCombined',
        orderDetail: 'OrderDetailStyle3',
        claims: 'ClaimsStyle3',
        transactions: 'TransactionsStyle3',
        deliveryRequests: 'DeliveryRequestsStyle3',
        shipments: 'ShipmentsStyle3',
        withdrawalSlips: 'WithdrawalSlipStyle3',
        profile: 'ProfileStyle3'
      }
    }
  }
];

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
  'baogam': {
    name: "Báo Gấm",
    variantCode: "gd1",
    tenantConfig: {
      themeConfig: {
        uiLib: 'antd',
        colorPrimary: '#1890ff',
        colorBgLayout: '#f5f8ff',
        borderRadius: 8,
        colorBgLayoutDark: '#0d1b2a',
      }
    }
  },
  'gobiz': {
    name: "Gobiz Logistics",
    variantCode: "gd3",
    tenantConfig: {
      themeConfig: {
        uiLib: 'antd',
        colorPrimary: '#722ed1',
        colorBgLayout: '#f9f5ff',
        borderRadius: 12,
        colorBgLayoutDark: '#1a0f2e',
      }
    }
  },
  'thien_long': {
    name: "Thiên Long Express",
    variantCode: "gd1",
    tenantConfig: {
      themeConfig: {
        uiLib: 'antd',
        colorPrimary: '#ff4d4f',
        colorBgLayout: '#fff1f0',
        borderRadius: 4,
        colorBgLayoutDark: '#2d0a0a',
        // Override đặc thù cho Thiên Long
        variants: {
          // shipmentStatusDisplay: 'tabs' 
        }
      }
    }
  },
  'tetetete': {
    name: "Te te nè Express",
    variantCode: "gd2",
    tenantConfig: {
      themeConfig: {
        uiLib: 'antd',
        colorPrimary: '#ff4d4f',
        colorBgLayout: '#fff1f0',
        borderRadius: 12,
        colorBgLayoutDark: '#000000',
        // Override đặc thù cho Thiên Long
        variants: {
          // shipmentStatusDisplay: 'tabs' 
        }
      }
    }
  }
};

app.get('/api/tenants/:id/config', (req, res) => {
  const tenantId = req.params.id;
  const tenant = tenants[tenantId] || tenants['baogam'];
  res.json({
    id: tenantId,
    ...tenant
  });
});

app.get('/api/ui-variants', (req, res) => {
  res.json(UI_VARIANTS);
});

app.listen(port, () => {
  console.log(`UI Server mapping running at http://localhost:${port}`);
});
