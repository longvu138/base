const express = require('express');
const cors = require('cors');

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

/**
 * Simplified Tenant Data: Each tenant has its own fixed theme and Dark/Light colors.
 */
const tenants = {
  'baogam': {
    id: "baogam00-769c-4f16-b934-7e4fd4036db1",
    name: "Báo Gấm",
    code: "baogam",
    tenantConfig: {
      themeConfig: {
        uiLib: 'antd',
        variants: { orders: 'gd1' },
        // Light Mode
        colorPrimary: '#1890ff',
        colorBgLayout: '#f5f8ff',
        // Dark Mode
        colorPrimaryDark: '#ffd666',
        colorBgLayoutDark: '#0a0c10',
        borderRadius: 8,
      }
    }
  },
  'gobiz': {
    id: "gobiz-1111-2222-3333-444444444444",
    name: "Gobiz Logistics",
    code: "gobiz",
    tenantConfig: {
      themeConfig: {
        uiLib: 'mui',
        variants: { orders: 'gd2' },
        // Light Mode
        colorPrimary: '#722ed1',
        colorBgLayout: '#f9f5ff',
        // Dark Mode
        colorPrimaryDark: '#9254de',
        colorBgLayoutDark: '#121212',
        borderRadius: 4,
      }
    }
  }
};

app.get('/api/tenants/:id/config', (req, res) => {
  const tenantId = req.params.id;
  console.log(`Fetching config for: ${tenantId}`);
  
  // Return specific tenant or default to baogam
  const tenant = tenants[tenantId] || tenants['baogam'];
  
  setTimeout(() => {
    res.json(tenant);
  }, 200);
});

app.listen(port, () => {
  console.log(`Mock API Server (Final Structure) running at http://localhost:${port}`);
});
