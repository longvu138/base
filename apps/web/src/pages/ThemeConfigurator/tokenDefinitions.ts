/**
 * Định nghĩa tất cả các design token có thể override trong tenant config.
 * Mỗi nhóm tương ứng với 1 component antd hoặc global token.
 */

export interface TokenDef {
  key: string;
  label: string;
  type: 'color' | 'number' | 'string' | 'boolean';
  defaultValue: string | number | boolean;
  description: string;
}

export interface TokenGroup {
  component: string;
  label: string;
  icon: string;
  tokens: TokenDef[];
}

export const TOKEN_GROUPS: TokenGroup[] = [
  // ─── Global Seed Tokens ───
  {
    component: '_global',
    label: 'Global Token',
    icon: '🌐',
    tokens: [
      { key: 'colorPrimary', label: 'Primary Color', type: 'color', defaultValue: '#1890ff', description: 'Màu thương hiệu chủ đạo' },
      { key: 'colorSuccess', label: 'Success Color', type: 'color', defaultValue: '#52c41a', description: 'Màu thành công' },
      { key: 'colorWarning', label: 'Warning Color', type: 'color', defaultValue: '#faad14', description: 'Màu cảnh báo' },
      { key: 'colorError', label: 'Error Color', type: 'color', defaultValue: '#ff4d4f', description: 'Màu lỗi' },
      { key: 'colorInfo', label: 'Info Color', type: 'color', defaultValue: '#1890ff', description: 'Màu thông tin' },
      { key: 'colorLink', label: 'Link Color', type: 'color', defaultValue: '#1890ff', description: 'Màu hyperlink' },
      { key: 'colorBgLayout', label: 'Layout Background', type: 'color', defaultValue: '#f5f5f5', description: 'Màu nền tổng thể trang' },
      { key: 'colorBgContainer', label: 'Container Background', type: 'color', defaultValue: '#ffffff', description: 'Màu nền component (Card, Input...)' },
      { key: 'colorBgElevated', label: 'Elevated Background', type: 'color', defaultValue: '#ffffff', description: 'Màu nền modal/popup' },
      { key: 'colorText', label: 'Text Color', type: 'color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Màu chữ chính' },
      { key: 'colorTextSecondary', label: 'Text Secondary', type: 'color', defaultValue: 'rgba(0,0,0,0.65)', description: 'Màu chữ phụ' },
      { key: 'colorBorder', label: 'Border Color', type: 'color', defaultValue: '#d9d9d9', description: 'Màu viền mặc định' },
      { key: 'colorBorderSecondary', label: 'Border Secondary', type: 'color', defaultValue: '#f0f0f0', description: 'Màu viền nhạt hơn' },
      { key: 'borderRadius', label: 'Border Radius', type: 'number', defaultValue: 8, description: 'Bo góc cơ bản (px)' },
      { key: 'fontSize', label: 'Font Size', type: 'number', defaultValue: 14, description: 'Cỡ chữ mặc định (px)' },
      { key: 'controlHeight', label: 'Control Height', type: 'number', defaultValue: 32, description: 'Chiều cao input/button (px)' },
      { key: 'wireframe', label: 'Wireframe Mode', type: 'boolean', defaultValue: false, description: 'Chuyển sang giao diện wireframe' },
    ],
  },

  // ─── Button ───
  {
    component: 'Button',
    label: 'Button',
    icon: '🔘',
    tokens: [
      { key: 'contentFontSize', label: 'Font Size', type: 'number', defaultValue: 14, description: 'Cỡ chữ nút' },
      { key: 'fontWeight', label: 'Font Weight', type: 'number', defaultValue: 400, description: 'Độ đậm chữ' },
      { key: 'primaryColor', label: 'Primary Text Color', type: 'color', defaultValue: '#ffffff', description: 'Màu chữ nút Primary' },
      { key: 'primaryShadow', label: 'Primary Shadow', type: 'string', defaultValue: '0 2px 0 rgba(5,145,255,0.1)', description: 'Shadow nút Primary' },
      { key: 'defaultBg', label: 'Default Background', type: 'color', defaultValue: '#ffffff', description: 'Nền nút Default' },
      { key: 'defaultColor', label: 'Default Text Color', type: 'color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Màu chữ nút Default' },
      { key: 'defaultBorderColor', label: 'Default Border', type: 'color', defaultValue: '#d9d9d9', description: 'Viền nút Default' },
      { key: 'defaultHoverBg', label: 'Hover Background', type: 'color', defaultValue: '#ffffff', description: 'Nền hover nút Default' },
      { key: 'defaultHoverColor', label: 'Hover Text Color', type: 'color', defaultValue: '#4096ff', description: 'Chữ hover nút Default' },
      { key: 'defaultHoverBorderColor', label: 'Hover Border', type: 'color', defaultValue: '#4096ff', description: 'Viền hover nút Default' },
      { key: 'dangerColor', label: 'Danger Text Color', type: 'color', defaultValue: '#ffffff', description: 'Màu chữ nút Danger' },
      { key: 'dangerShadow', label: 'Danger Shadow', type: 'string', defaultValue: '0 2px 0 rgba(255,38,5,0.06)', description: 'Shadow nút Danger' },
      { key: 'paddingInline', label: 'Horizontal Padding', type: 'number', defaultValue: 15, description: 'Padding ngang (px)' },
      { key: 'textHoverBg', label: 'Text Btn Hover Bg', type: 'color', defaultValue: 'rgba(0,0,0,0.06)', description: 'Nền hover nút Text' },
    ],
  },

  // ─── Input ───
  {
    component: 'Input',
    label: 'Input',
    icon: '📝',
    tokens: [
      { key: 'inputFontSize', label: 'Font Size', type: 'number', defaultValue: 14, description: 'Cỡ chữ input' },
      { key: 'paddingInline', label: 'Horizontal Padding', type: 'number', defaultValue: 11, description: 'Padding ngang (px)' },
      { key: 'paddingBlock', label: 'Vertical Padding', type: 'number', defaultValue: 4, description: 'Padding dọc (px)' },
      { key: 'addonBg', label: 'Addon Background', type: 'color', defaultValue: 'rgba(0,0,0,0.02)', description: 'Nền addon prefix/suffix' },
      { key: 'hoverBorderColor', label: 'Hover Border', type: 'color', defaultValue: '#4096ff', description: 'Viền khi hover' },
      { key: 'activeBorderColor', label: 'Active Border', type: 'color', defaultValue: '#1677ff', description: 'Viền khi focus' },
      { key: 'hoverBg', label: 'Hover Background', type: 'color', defaultValue: '#ffffff', description: 'Nền khi hover' },
      { key: 'activeBg', label: 'Active Background', type: 'color', defaultValue: '#ffffff', description: 'Nền khi focus' },
    ],
  },

  // ─── Select ───
  {
    component: 'Select',
    label: 'Select',
    icon: '📋',
    tokens: [
      { key: 'optionSelectedBg', label: 'Selected Option Bg', type: 'color', defaultValue: '#e6f4ff', description: 'Nền option được chọn' },
      { key: 'optionActiveBg', label: 'Active Option Bg', type: 'color', defaultValue: 'rgba(0,0,0,0.04)', description: 'Nền option đang hover' },
      { key: 'optionSelectedColor', label: 'Selected Option Color', type: 'color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Chữ option được chọn' },
      { key: 'optionFontSize', label: 'Option Font Size', type: 'number', defaultValue: 14, description: 'Cỡ chữ option' },
      { key: 'optionHeight', label: 'Option Height', type: 'number', defaultValue: 32, description: 'Chiều cao option' },
      { key: 'selectorBg', label: 'Selector Background', type: 'color', defaultValue: '#ffffff', description: 'Nền ô select' },
      { key: 'hoverBorderColor', label: 'Hover Border', type: 'color', defaultValue: '#4096ff', description: 'Viền khi hover' },
      { key: 'activeBorderColor', label: 'Active Border', type: 'color', defaultValue: '#1677ff', description: 'Viền khi focus' },
      { key: 'multipleItemBg', label: 'Multi Tag Background', type: 'color', defaultValue: 'rgba(0,0,0,0.06)', description: 'Nền tag multi-select' },
    ],
  },

  // ─── Table ───
  {
    component: 'Table',
    label: 'Table',
    icon: '📊',
    tokens: [
      { key: 'headerBg', label: 'Header Background', type: 'color', defaultValue: '#fafafa', description: 'Nền header bảng' },
      { key: 'headerColor', label: 'Header Text Color', type: 'color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Chữ header bảng' },
      { key: 'headerSortActiveBg', label: 'Sort Active Bg', type: 'color', defaultValue: '#f0f0f0', description: 'Nền header khi sort' },
      { key: 'rowHoverBg', label: 'Row Hover Bg', type: 'color', defaultValue: '#fafafa', description: 'Nền hàng khi hover' },
      { key: 'rowSelectedBg', label: 'Row Selected Bg', type: 'color', defaultValue: '#e6f4ff', description: 'Nền hàng được chọn' },
      { key: 'rowSelectedHoverBg', label: 'Selected+Hover Bg', type: 'color', defaultValue: '#bae0ff', description: 'Nền hàng chọn + hover' },
      { key: 'borderColor', label: 'Border Color', type: 'color', defaultValue: '#f0f0f0', description: 'Màu viền bảng' },
      { key: 'cellPaddingBlock', label: 'Cell Vertical Padding', type: 'number', defaultValue: 16, description: 'Padding dọc ô' },
      { key: 'cellPaddingInline', label: 'Cell Horizontal Padding', type: 'number', defaultValue: 16, description: 'Padding ngang ô' },
      { key: 'cellFontSize', label: 'Cell Font Size', type: 'number', defaultValue: 14, description: 'Cỡ chữ ô bảng' },
      { key: 'headerBorderRadius', label: 'Header Radius', type: 'number', defaultValue: 8, description: 'Bo góc header' },
      { key: 'footerBg', label: 'Footer Background', type: 'color', defaultValue: '#fafafa', description: 'Nền footer bảng' },
    ],
  },

  // ─── Modal ───
  {
    component: 'Modal',
    label: 'Modal',
    icon: '🪟',
    tokens: [
      { key: 'headerBg', label: 'Header Background', type: 'color', defaultValue: 'transparent', description: 'Nền header modal' },
      { key: 'contentBg', label: 'Content Background', type: 'color', defaultValue: '#ffffff', description: 'Nền vùng nội dung' },
      { key: 'footerBg', label: 'Footer Background', type: 'color', defaultValue: 'transparent', description: 'Nền footer modal' },
      { key: 'titleColor', label: 'Title Color', type: 'color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Màu tiêu đề' },
      { key: 'titleFontSize', label: 'Title Font Size', type: 'number', defaultValue: 16, description: 'Cỡ chữ tiêu đề' },
    ],
  },

  // ─── Form ───
  {
    component: 'Form',
    label: 'Form',
    icon: '📄',
    tokens: [
      { key: 'labelColor', label: 'Label Color', type: 'color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Màu chữ label' },
      { key: 'labelFontSize', label: 'Label Font Size', type: 'number', defaultValue: 14, description: 'Cỡ chữ label' },
      { key: 'labelRequiredMarkColor', label: 'Required Mark Color', type: 'color', defaultValue: '#ff4d4f', description: 'Màu dấu * bắt buộc' },
      { key: 'itemMarginBottom', label: 'Item Margin Bottom', type: 'number', defaultValue: 24, description: 'Khoảng cách giữa form item' },
    ],
  },

  // ─── Menu ───
  {
    component: 'Menu',
    label: 'Menu',
    icon: '📑',
    tokens: [
      { key: 'itemColor', label: 'Item Text Color', type: 'color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Màu chữ menu item' },
      { key: 'itemSelectedColor', label: 'Selected Color', type: 'color', defaultValue: '#1677ff', description: 'Màu chữ item chọn' },
      { key: 'itemSelectedBg', label: 'Selected Background', type: 'color', defaultValue: '#e6f4ff', description: 'Nền item chọn' },
      { key: 'itemHoverBg', label: 'Hover Background', type: 'color', defaultValue: 'rgba(0,0,0,0.04)', description: 'Nền item hover' },
      { key: 'itemHoverColor', label: 'Hover Color', type: 'color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Chữ item hover' },
      { key: 'itemActiveBg', label: 'Active Background', type: 'color', defaultValue: '#e6f4ff', description: 'Nền item active' },
      { key: 'subMenuItemBg', label: 'SubMenu Item Bg', type: 'color', defaultValue: 'transparent', description: 'Nền submenu item' },
      { key: 'darkItemColor', label: 'Dark Item Color', type: 'color', defaultValue: 'rgba(255,255,255,0.65)', description: 'Chữ item dark mode' },
      { key: 'darkItemSelectedBg', label: 'Dark Selected Bg', type: 'color', defaultValue: '#1677ff', description: 'Nền item chọn dark' },
      { key: 'darkItemSelectedColor', label: 'Dark Selected Color', type: 'color', defaultValue: '#ffffff', description: 'Chữ item chọn dark' },
    ],
  },

  // ─── Layout ───
  {
    component: 'Layout',
    label: 'Layout',
    icon: '🏗️',
    tokens: [
      { key: 'headerBg', label: 'Header Background', type: 'color', defaultValue: '#001529', description: 'Nền header layout' },
      { key: 'colorBgBody', label: 'Body Background', type: 'color', defaultValue: '#f5f5f5', description: 'Nền body layout' },
      { key: 'colorBgTrigger', label: 'Trigger Background', type: 'color', defaultValue: '#002140', description: 'Nền nút thu gọn sider' },
      { key: 'siderBg', label: 'Sider Background', type: 'color', defaultValue: '#001529', description: 'Nền sider' },
      { key: 'headerHeight', label: 'Header Height', type: 'number', defaultValue: 64, description: 'Chiều cao header (px)' },
    ],
  },

  // ─── Card ───
  {
    component: 'Card',
    label: 'Card',
    icon: '🃏',
    tokens: [
      { key: 'headerBg', label: 'Header Background', type: 'color', defaultValue: 'transparent', description: 'Nền header card' },
      { key: 'headerFontSize', label: 'Header Font Size', type: 'number', defaultValue: 16, description: 'Cỡ chữ header card' },
      { key: 'headerHeight', label: 'Header Height', type: 'number', defaultValue: 56, description: 'Chiều cao header card' },
      { key: 'actionsBg', label: 'Actions Background', type: 'color', defaultValue: '#ffffff', description: 'Nền vùng actions' },
    ],
  },

  // ─── Tabs ───
  {
    component: 'Tabs',
    label: 'Tabs',
    icon: '📂',
    tokens: [
      { key: 'titleFontSize', label: 'Title Font Size', type: 'number', defaultValue: 14, description: 'Cỡ chữ tab' },
      { key: 'inkBarColor', label: 'Ink Bar Color', type: 'color', defaultValue: '#1677ff', description: 'Màu thanh active' },
      { key: 'itemColor', label: 'Item Color', type: 'color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Màu chữ tab' },
      { key: 'itemSelectedColor', label: 'Selected Color', type: 'color', defaultValue: '#1677ff', description: 'Màu chữ tab đang chọn' },
      { key: 'itemHoverColor', label: 'Hover Color', type: 'color', defaultValue: '#1677ff', description: 'Màu chữ tab hover' },
      { key: 'cardBg', label: 'Card Tab Bg', type: 'color', defaultValue: 'rgba(0,0,0,0.02)', description: 'Nền tab kiểu card' },
      { key: 'cardHeight', label: 'Card Tab Height', type: 'number', defaultValue: 40, description: 'Chiều cao tab card' },
    ],
  },

  // ─── Tag ───
  {
    component: 'Tag',
    label: 'Tag',
    icon: '🏷️',
    tokens: [
      { key: 'defaultBg', label: 'Default Background', type: 'color', defaultValue: 'rgba(0,0,0,0.02)', description: 'Nền tag mặc định' },
      { key: 'defaultColor', label: 'Default Color', type: 'color', defaultValue: 'rgba(0,0,0,0.88)', description: 'Chữ tag mặc định' },
    ],
  },

  // ─── Pagination ───
  {
    component: 'Pagination',
    label: 'Pagination',
    icon: '📄',
    tokens: [
      { key: 'itemBg', label: 'Item Background', type: 'color', defaultValue: '#ffffff', description: 'Nền item pagination' },
      { key: 'itemActiveBg', label: 'Active Item Bg', type: 'color', defaultValue: '#ffffff', description: 'Nền item đang active' },
      { key: 'itemSize', label: 'Item Size', type: 'number', defaultValue: 32, description: 'Kích thước item' },
    ],
  },

  // ─── Switch ───
  {
    component: 'Switch',
    label: 'Switch',
    icon: '🔀',
    tokens: [
      { key: 'trackHeight', label: 'Track Height', type: 'number', defaultValue: 22, description: 'Chiều cao track' },
      { key: 'trackMinWidth', label: 'Track Min Width', type: 'number', defaultValue: 44, description: 'Độ rộng tối thiểu track' },
      { key: 'handleSize', label: 'Handle Size', type: 'number', defaultValue: 18, description: 'Kích thước handle' },
    ],
  },
];
