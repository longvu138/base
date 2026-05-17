import { Card, Space } from "antd";
import { FilterPanel } from "@repo/ui";
import { useWaybillsPage } from "./hooks/useWaybillsPage";
import {
  WaybillCreateModal,
  WaybillExportModal,
  WaybillFilterFields,
  WaybillListCard,
} from "./WaybillsShared";

export const WaybillsStyle1 = () => {
  const page = useWaybillsPage();

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card className="mb-4 shadow-sm">
        <FilterPanel
          form={page.form}
          onSearch={page.handleSearch}
          onReset={page.handleReset}
          searchText={page.t("order.search")}
          resetText={page.t("order.filter_refresh")}
          primaryContent={<WaybillFilterFields page={page} />}
        />
      </Card>
      <WaybillListCard page={page} />
      <WaybillCreateModal page={page} />
      <WaybillExportModal page={page} />
    </Space>
  );
};

export default WaybillsStyle1;
