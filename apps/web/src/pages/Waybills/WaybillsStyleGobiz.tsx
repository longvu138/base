import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Drawer,
  Flex,
  Input,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  DownloadOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { quantityFormat } from "@repo/util";
import { FilterPanel } from "@repo/ui";
import { useWaybillsPage } from "./hooks/useWaybillsPage";
import {
  WaybillCreateModal,
  WaybillExportModal,
  WaybillFilterFields,
  WaybillListCard,
} from "./WaybillsShared";

export const WaybillsStyleGobiz = () => {
  const { token } = theme.useToken();
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const page = useWaybillsPage();
  const total = page.listData?.total || 0;

  useEffect(() => {
    setSearchText(typeof page.filters.query === "string" ? page.filters.query : "");
  }, [page.filters.query]);

  const handleHeaderSearch = () => {
    page.form.setFieldValue("query", searchText);
    page.handleSearch();
  };

  const handleFilterSearch = () => {
    const values = page.form.getFieldsValue(true);
    setSearchText(typeof values.query === "string" ? values.query : "");
    page.handleSearch();
  };

  const handleReset = () => {
    setSearchText("");
    page.handleReset();
  };

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
            <Input
              allowClear
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onPressEnter={handleHeaderSearch}
              placeholder="Nhập mã vận đơn"
              style={{ width: 320 }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleHeaderSearch}>
              {page.t("common.search")}
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
            <Button icon={<SyncOutlined />} onClick={handleReset}>
              {page.t("order.filter_refresh")}
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

      <Card className="mb-4 shadow-sm">
        <FilterPanel
          form={page.form}
          onSearch={handleFilterSearch}
          onReset={handleReset}
          searchText={page.t("order.search")}
          resetText={page.t("order.filter_refresh")}
          primaryContent={<WaybillFilterFields page={page} />}
        />
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
            handleFilterSearch();
            setFilterOpen(false);
          }}
          onReset={handleReset}
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

export default WaybillsStyleGobiz;
