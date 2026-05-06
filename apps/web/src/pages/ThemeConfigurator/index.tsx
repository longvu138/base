import { useState, useMemo, useCallback } from 'react';
import {
  ConfigProvider, Button, Input, Select, Table, Modal, Form,
  Menu, Card, Tabs, Tag, Pagination, Switch, Badge, Tooltip,
  Space, Typography, Divider, message, ColorPicker,
  InputNumber, Row, Col, Alert,
} from 'antd';
import {
  CopyOutlined, ReloadOutlined,
  SearchOutlined, UserOutlined, MailOutlined,
  EditOutlined, DeleteOutlined, EyeOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  BellOutlined, SettingOutlined, HomeOutlined,
  AppstoreOutlined, DatabaseOutlined,
} from '@ant-design/icons';
import { TOKEN_GROUPS, type TokenDef } from './tokenDefinitions';

const { Title, Text } = Typography;

/**
 * Theme Configurator Page
 * - Chỉnh sửa trực quan tất cả token antd
 * - Preview component realtime
 * - Copy JSON config để paste vào backend tenant config
 */
export default function ThemeConfigurator() {
  // State: tất cả token đã thay đổi (chỉ lưu những token khác default)
  const [globalTokens, setGlobalTokens] = useState<Record<string, any>>({});
  const [componentTokens, setComponentTokens] = useState<Record<string, Record<string, any>>>({});
  const [activeGroup, setActiveGroup] = useState('_global');

  // Update 1 global token
  const updateGlobal = useCallback((key: string, value: any) => {
    setGlobalTokens(prev => {
      const next = { ...prev };
      if (value === undefined || value === null || value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }, []);

  // Update 1 component token
  const updateComponent = useCallback((component: string, key: string, value: any) => {
    setComponentTokens(prev => {
      const next = { ...prev };
      if (!next[component]) next[component] = {};
      if (value === undefined || value === null || value === '') {
        delete next[component][key];
        if (Object.keys(next[component]).length === 0) delete next[component];
      } else {
        next[component][key] = value;
      }
      return next;
    });
  }, []);

  // Reset all
  const resetAll = useCallback(() => {
    setGlobalTokens({});
    setComponentTokens({});
    message.success('Đã reset về mặc định!');
  }, []);

  // Build antd ThemeConfig for live preview
  const previewTheme = useMemo(() => {
    const cfg: any = { token: { ...globalTokens } };
    if (Object.keys(componentTokens).length > 0) {
      cfg.components = {};
      Object.entries(componentTokens).forEach(([comp, tokens]) => {
        cfg.components[comp] = { ...tokens };
      });
    }
    return cfg;
  }, [globalTokens, componentTokens]);

  // Build JSON cho backend config
  const configJSON = useMemo(() => {
    const config: any = {};
    // Global tokens → flat vào themeConfig
    Object.entries(globalTokens).forEach(([k, v]) => {
      config[k] = v;
    });
    // Component tokens → components: { Button: { ... } }
    if (Object.keys(componentTokens).length > 0) {
      config.components = {};
      Object.entries(componentTokens).forEach(([comp, tokens]) => {
        config.components[comp] = { ...tokens };
      });
    }
    return JSON.stringify(config, null, 2);
  }, [globalTokens, componentTokens]);

  const copyConfig = useCallback(() => {
    navigator.clipboard.writeText(configJSON);
    message.success('Đã copy config JSON!');
  }, [configJSON]);

  // Count changes
  const changeCount = useMemo(() => {
    let count = Object.keys(globalTokens).length;
    Object.values(componentTokens).forEach(tokens => {
      count += Object.keys(tokens).length;
    });
    return count;
  }, [globalTokens, componentTokens]);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Top Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🎨</span>
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            Theme Configurator
          </Title>
          {changeCount > 0 && (
            <Badge count={changeCount} style={{ backgroundColor: '#52c41a' }}>
              <Tag color="white" style={{ color: '#333' }}>thay đổi</Tag>
            </Badge>
          )}
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={resetAll}>Reset</Button>
          <Button icon={<CopyOutlined />} type="primary" onClick={copyConfig}>
            Copy Config JSON
          </Button>
        </Space>
      </div>

      <Row gutter={0} style={{ height: 'calc(100vh - 64px)' }}>
        {/* ═══════ LEFT: Token Editor ═══════ */}
        <Col span={8} style={{
          height: '100%', overflow: 'auto',
          background: '#fff', borderRight: '1px solid #f0f0f0',
        }}>
          {/* Component tabs as vertical menu */}
          <div style={{ padding: '12px 16px 0' }}>
            <Text strong style={{ fontSize: 13, color: '#888' }}>COMPONENTS</Text>
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            padding: '8px 16px 12px',
          }}>
            {TOKEN_GROUPS.map(g => (
              <Tag
                key={g.component}
                color={activeGroup === g.component ? 'blue' : undefined}
                style={{ cursor: 'pointer', fontSize: 13, padding: '2px 10px' }}
                onClick={() => setActiveGroup(g.component)}
              >
                {g.icon} {g.label}
              </Tag>
            ))}
          </div>

          <Divider style={{ margin: '0 0 8px' }} />

          {/* Token editors for selected group */}
          <div style={{ padding: '0 16px 24px' }}>
            {TOKEN_GROUPS.filter(g => g.component === activeGroup).map(group => (
              <div key={group.component}>
                <Title level={5} style={{ margin: '0 0 12px' }}>
                  {group.icon} {group.label} Token
                </Title>
                {group.tokens.map(token => (
                  <TokenEditor
                    key={`${group.component}-${token.key}`}
                    token={token}
                    value={
                      group.component === '_global'
                        ? globalTokens[token.key]
                        : componentTokens[group.component]?.[token.key]
                    }
                    onChange={(val) => {
                      if (group.component === '_global') {
                        updateGlobal(token.key, val);
                      } else {
                        updateComponent(group.component, token.key, val);
                      }
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </Col>

        {/* ═══════ MIDDLE: Live Preview ═══════ */}
        <Col span={10} style={{
          height: '100%', overflow: 'auto',
          background: '#fafafa', padding: 20,
        }}>
          <ConfigProvider theme={previewTheme}>
            <ComponentPreviews />
          </ConfigProvider>
        </Col>

        {/* ═══════ RIGHT: JSON Output ═══════ */}
        <Col span={6} style={{
          height: '100%', overflow: 'auto',
          background: '#1e1e1e', padding: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text strong style={{ color: '#ccc', fontSize: 13 }}>📋 CONFIG JSON</Text>
            <Button
              size="small" type="primary" ghost
              icon={<CopyOutlined />}
              onClick={copyConfig}
            >
              Copy
            </Button>
          </div>

          <Alert
            message="Paste vào themeConfig trong tenant-server/index.js"
            type="info"
            showIcon
            style={{ marginBottom: 12, fontSize: 12 }}
          />

          <pre style={{
            background: '#2d2d2d',
            color: '#d4d4d4',
            padding: 16,
            borderRadius: 8,
            fontSize: 12,
            lineHeight: 1.6,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            border: '1px solid #3e3e3e',
          }}>
            {configJSON || '{\n  // Chưa có thay đổi\n}'}
          </pre>

          <Divider style={{ borderColor: '#333' }} />

          <Text style={{ color: '#888', fontSize: 12 }}>
            💡 Config này sẽ được merge vào <code style={{ color: '#9cdcfe' }}>tenantConfig.themeConfig</code> trong backend.
            Các global token nằm ở top level, component token nằm trong key <code style={{ color: '#9cdcfe' }}>components</code>.
          </Text>
        </Col>
      </Row>
    </div>
  );
}

/**
 * Token Editor Widget — render input phù hợp theo kiểu token
 */
function TokenEditor({
  token,
  value,
  onChange,
}: {
  token: TokenDef;
  value: any;
  onChange: (val: any) => void;
}) {
  const isModified = value !== undefined && value !== null;

  return (
    <div style={{
      marginBottom: 12,
      padding: '8px 12px',
      borderRadius: 8,
      background: isModified ? '#f0f5ff' : '#fafafa',
      border: isModified ? '1px solid #91caff' : '1px solid transparent',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Text strong style={{ fontSize: 13 }}>
          {token.label}
          {isModified && <span style={{ color: '#1677ff', marginLeft: 6 }}>●</span>}
        </Text>
        {isModified && (
          <Button
            size="small" type="link" danger
            onClick={() => onChange(undefined)}
            style={{ padding: 0, height: 'auto', fontSize: 11 }}
          >
            Reset
          </Button>
        )}
      </div>
      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>
        {token.description} <Text code style={{ fontSize: 10 }}>{token.key}</Text>
      </Text>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {token.type === 'color' && (
          <>
            <ColorPicker
              size="small"
              value={value ?? token.defaultValue}
              onChange={(_, hex) => onChange(hex)}
            />
            <Input
              size="small"
              value={value ?? ''}
              placeholder={String(token.defaultValue)}
              onChange={e => onChange(e.target.value || undefined)}
              style={{ flex: 1 }}
            />
          </>
        )}

        {token.type === 'number' && (
          <InputNumber
            size="small"
            value={value}
            placeholder={String(token.defaultValue)}
            onChange={val => onChange(val)}
            style={{ width: '100%' }}
          />
        )}

        {token.type === 'string' && (
          <Input
            size="small"
            value={value ?? ''}
            placeholder={String(token.defaultValue)}
            onChange={e => onChange(e.target.value || undefined)}
          />
        )}

        {token.type === 'boolean' && (
          <Switch
            size="small"
            checked={value ?? token.defaultValue}
            onChange={val => onChange(val)}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Component Previews — hiển thị tất cả component với theme hiện tại
 */
function ComponentPreviews() {
  const [modalOpen, setModalOpen] = useState(false);

  const tableData = [
    { key: '1', name: 'Nguyễn Văn A', email: 'nva@email.com', status: 'active', amount: 1500000 },
    { key: '2', name: 'Trần Thị B', email: 'ttb@email.com', status: 'pending', amount: 2300000 },
    { key: '3', name: 'Lê Văn C', email: 'lvc@email.com', status: 'error', amount: 890000 },
  ];

  const tableColumns = [
    { title: 'Tên', dataIndex: 'name', key: 'name', sorter: true },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s: string) => (
        <Tag color={s === 'active' ? 'success' : s === 'pending' ? 'warning' : 'error'}>
          {s === 'active' ? 'Hoạt động' : s === 'pending' ? 'Chờ duyệt' : 'Lỗi'}
        </Tag>
      ),
    },
    {
      title: 'Số tiền', dataIndex: 'amount', key: 'amount',
      render: (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v),
    },
    {
      title: 'Hành động', key: 'action',
      render: () => (
        <Space size="small">
          <Tooltip title="Xem"><Button size="small" icon={<EyeOutlined />} /></Tooltip>
          <Tooltip title="Sửa"><Button size="small" icon={<EditOutlined />} /></Tooltip>
          <Tooltip title="Xóa"><Button size="small" danger icon={<DeleteOutlined />} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>🖼️ Live Preview</Title>

      {/* ── Buttons ── */}
      <Card title="Button" size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
          <Button danger type="primary">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>
          <Button type="primary" loading>Loading</Button>
        </Space>
      </Card>

      {/* ── Input & Select ── */}
      <Card title="Input & Select" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Input placeholder="Nhập thông tin..." prefix={<UserOutlined />} />
          <Input.Password placeholder="Mật khẩu..." />
          <Input.Search placeholder="Tìm kiếm..." enterButton />
          <Input addonBefore="https://" addonAfter=".com" placeholder="domain" />
          <Input status="error" placeholder="Input lỗi" />
          <Input status="warning" placeholder="Input cảnh báo" />
          <Select
            placeholder="Chọn một mục..."
            style={{ width: '100%' }}
            options={[
              { label: 'Tùy chọn A', value: 'a' },
              { label: 'Tùy chọn B', value: 'b' },
              { label: 'Tùy chọn C', value: 'c' },
            ]}
          />
          <Select
            mode="multiple"
            placeholder="Chọn nhiều mục..."
            style={{ width: '100%' }}
            defaultValue={['a']}
            options={[
              { label: 'Tag 1', value: 'a' },
              { label: 'Tag 2', value: 'b' },
              { label: 'Tag 3', value: 'c' },
            ]}
          />
        </Space>
      </Card>

      {/* ── Form ── */}
      <Card title="Form" size="small" style={{ marginBottom: 16 }}>
        <Form layout="vertical" requiredMark>
          <Form.Item label="Tên" name="name" required>
            <Input placeholder="Nhập tên..." />
          </Form.Item>
          <Form.Item label="Email" name="email" required>
            <Input prefix={<MailOutlined />} placeholder="email@example.com" />
          </Form.Item>
          <Form.Item label="Vai trò" name="role">
            <Select placeholder="Chọn vai trò" options={[
              { label: 'Admin', value: 'admin' },
              { label: 'User', value: 'user' },
            ]} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary">Lưu</Button>
              <Button>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* ── Table ── */}
      <Card title="Table" size="small" style={{ marginBottom: 16 }}>
        <Table
          columns={tableColumns}
          dataSource={tableData}
          pagination={{ pageSize: 5, total: 3 }}
          size="small"
        />
      </Card>

      {/* ── Tabs ── */}
      <Card title="Tabs" size="small" style={{ marginBottom: 16 }}>
        <Tabs defaultActiveKey="1" items={[
          { key: '1', label: 'Tab 1', children: <Text>Nội dung tab 1</Text> },
          { key: '2', label: 'Tab 2', children: <Text>Nội dung tab 2</Text> },
          { key: '3', label: 'Tab 3', children: <Text>Nội dung tab 3</Text> },
        ]} />
        <Tabs defaultActiveKey="1" type="card" items={[
          { key: '1', label: 'Card Tab 1', children: <Text>Card style</Text> },
          { key: '2', label: 'Card Tab 2', children: <Text>Card style</Text> },
        ]} />
      </Card>

      {/* ── Tags & Badges ── */}
      <Card title="Tag & Badge" size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Tag>Default</Tag>
          <Tag color="success">Success</Tag>
          <Tag color="processing">Processing</Tag>
          <Tag color="error">Error</Tag>
          <Tag color="warning">Warning</Tag>
          <Tag icon={<CheckCircleOutlined />} color="success">Hoàn thành</Tag>
          <Tag icon={<CloseCircleOutlined />} color="error">Thất bại</Tag>
        </Space>
        <Divider />
        <Space size={24}>
          <Badge count={5}><Button icon={<BellOutlined />} /></Badge>
          <Badge count={0} showZero><Button icon={<MailOutlined />} /></Badge>
          <Badge dot><Button icon={<SettingOutlined />} /></Badge>
          <Badge count={99} overflowCount={10}><Button>Thông báo</Button></Badge>
        </Space>
      </Card>

      {/* ── Menu ── */}
      <Card title="Menu" size="small" style={{ marginBottom: 16 }}>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['home']}
          items={[
            { key: 'home', icon: <HomeOutlined />, label: 'Trang chủ' },
            { key: 'app', icon: <AppstoreOutlined />, label: 'Ứng dụng' },
            { key: 'data', icon: <DatabaseOutlined />, label: 'Dữ liệu' },
            { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
          ]}
        />
      </Card>

      {/* ── Switch & Pagination ── */}
      <Card title="Switch & Pagination" size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Switch defaultChecked />
          <Switch />
          <Switch checkedChildren="Bật" unCheckedChildren="Tắt" defaultChecked />
        </Space>
        <Divider />
        <Pagination defaultCurrent={1} total={50} showSizeChanger showQuickJumper />
      </Card>

      {/* ── Modal trigger ── */}
      <Card title="Modal" size="small" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setModalOpen(true)}>
          Mở Modal
        </Button>
        <Modal
          title="Modal Preview"
          open={modalOpen}
          onOk={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
        >
          <p>Đây là nội dung modal. Preview để kiểm tra màu sắc header, content, footer.</p>
          <Form.Item label="Tên" required>
            <Input placeholder="Test input trong modal..." />
          </Form.Item>
        </Modal>
      </Card>

      {/* ── Alert ── */}
      <Card title="Alert" size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert message="Thông tin" type="info" showIcon />
          <Alert message="Thành công" type="success" showIcon />
          <Alert message="Cảnh báo" type="warning" showIcon />
          <Alert message="Lỗi" description="Chi tiết lỗi ở đây" type="error" showIcon />
        </Space>
      </Card>
    </div>
  );
}
