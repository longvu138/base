const express = require('express');
const cors = require('cors');

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

const tenants = {
  'baogam': {
    id: "baogam-id",
    name: "Báo Gấm",
    code: "baogam",
    tenantConfig: {
      themeConfig: {
        uiLib: 'antd',
        variant: 'gd1', // Tự động hiểu: VerticalLayout, LoginStyle1, OrdersStyle1...
        colorPrimary: '#1890ff',
        colorBgLayout: '#f5f8ff',
        borderRadius: 8,
        colorBgLayoutDark: '#0d1b2a',
      }
    }
  },
  'gobiz': {
    id: "gobiz-id",
    name: "Gobiz Logistics",
    code: "gobiz",
    tenantConfig: {
      themeConfig: {
        uiLib: 'antd',
        variant: 'gd3', // Tự động hiểu: SpecializedLayout. 
        // Riêng trang orders muốn dùng tên khác thì mới cần khai báo ở đây:
        // variants: { orders: 'OrdersCombined' }, 
        colorPrimary: '#722ed1',
        colorBgLayout: '#f9f5ff',
        borderRadius: 16,
        colorBgLayoutDark: '#1a0f2e',
      }
    }
  },
  'thien_long': {
    id: "thien-long-id",
    name: "Thiên Long Express",
    code: "thien_long",
    tenantConfig: {
      themeConfig: {
        uiLib: 'antd',
        variant: 'gd1',
        colorPrimary: '#ff4d4f',
        colorBgLayout: '#fff1f0',
        borderRadius: 4,
        colorBgLayoutDark: '#2d0a0a',
      }
    }
  }
};

app.get('/api/tenants/:id/config', (req, res) => {
  const tenantId = req.params.id;
  const tenant = tenants[tenantId] || tenants['baogam'];
  res.json(tenant);
});

app.listen(port, () => {
  console.log(`Mock API Server running at http://localhost:${port}`);
});
