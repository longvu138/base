import { Card, Divider, Form, Space } from "antd";
import { useWaybillsPage } from "./hooks/useWaybillsPage";
import {
  WaybillCreateModal,
  WaybillExportModal,
  WaybillFilterActions,
  WaybillFilterFields,
  WaybillListCard,
} from "./WaybillsShared";

export const WaybillsStyle1 = () => {
  const page = useWaybillsPage();

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card>
        <Form form={page.form} layout="vertical">
          <WaybillFilterFields page={page} />
          <Divider style={{ margin: "8px 0 16px" }} />
          <WaybillFilterActions page={page} />
        </Form>
      </Card>
      <WaybillListCard page={page} />
      <WaybillCreateModal page={page} />
      <WaybillExportModal page={page} />
    </Space>
  );
};

export default WaybillsStyle1;
