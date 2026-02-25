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
      // Có thể định nghĩa thêm các trang đặc thù nếu cần
        pages: {
        orders: 'OrdersCombined',
        claims: 'ClaimsStyle3',
        transactions: 'TransactionsStyle3',
        deliveryRequests: 'DeliveryRequestsStyle3',
        shipments: 'ShipmentsStyle3',
        withdrawalSlips: 'WithdrawalSlipStyle3'
      }
    }
  }
];

/**
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
        borderRadius: 16,
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
