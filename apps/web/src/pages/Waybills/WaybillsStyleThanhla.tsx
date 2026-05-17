import { Button, Card, Drawer, Flex, Form, Input, Space, Tag, Typography, theme } from "antd";
import { DownloadOutlined, FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { quantityFormat } from "@repo/util";
import { useState } from "react";
import { FilterPanel } from "@repo/ui";
import { useWaybillsPage } from "./hooks/useWaybillsPage";
import {
  WaybillCreateModal,
  WaybillExportModal,
  WaybillFilterFields,
  WaybillListCard,
} from "./WaybillsShared";

export const WaybillsStyleThanhla = () => {
  const { token } = theme.useToken();
  const [filterOpen, setFilterOpen] = useState(false);
  const page = useWaybillsPage();
  const total = page.listData?.total || 0;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card>
        <Flex justify="space-between" align="center" gap={token.marginMD} wrap>
          <Space size="small" align="center">
            <Typography.Title level={3} style={{ margin: 0 }}>
              Vận đơn
            </Typography.Title>
            <Tag color="blue">{quantityFormat(total)}</Tag>
          </Space>
          <Space wrap>
            <Form form={page.form} component={false}>
              <Form.Item name="query" noStyle>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Nhập mã vận đơn"
                  style={{ width: 320 }}
                  onPressEnter={page.handleSearch}
                />
              </Form.Item>
            </Form>
            <Button type="primary" onClick={page.handleSearch}>
              {page.t("order.search")}
            </Button>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                page.syncFiltersToForm();
                setFilterOpen(true);
              }}
            >
              {page.t("common.filter")}
            </Button>
            <Button icon={<DownloadOutlined />} onClick={page.handleExportOpen}>
              {page.t("common.export")}
            </Button>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={page.handleCreateOpen}>
              Tạo vận đơn
            </Button>
          </Space>
        </Flex>
      </Card>

      <WaybillListCard page={page} />

      <Drawer
        title={page.t("common.filter")}
        open={filterOpen}
        width={960}
        onClose={() => setFilterOpen(false)}
      >
        <FilterPanel
          form={page.form}
          onSearch={() => {
            page.handleSearch();
            setFilterOpen(false);
          }}
          onReset={page.handleReset}
          searchText={page.t("order.search")}
          resetText={page.t("order.filter_refresh")}
          primaryContent={<WaybillFilterFields page={page} />}
        />
      </Drawer>

      <WaybillCreateModal page={page} />
      <WaybillExportModal page={page} />
    </Space>
  );
};

export default WaybillsStyleThanhla;
