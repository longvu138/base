import { useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import { FilterOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { quantityFormat } from "@repo/util";
import { useDeliveryNotesPage } from "./hooks/useDeliveryNotesPage";
import { DeliveryNotesList } from "./DeliveryNotesShared";

export const DeliveryNotesStyle2 = ({ isTabView }: { isTabView?: boolean }) => {
  const { token } = theme.useToken();
  const [filterOpen, setFilterOpen] = useState(false);
  const page = useDeliveryNotesPage();
  const total = page.listData?.total || 0;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {!isTabView && (
        <Card>
          <Flex justify="space-between" align="center" wrap gap={token.marginMD}>
            <Space size="small" align="center">
              <Typography.Title level={3} style={{ margin: 0 }}>
                Danh sách phiếu xuất
              </Typography.Title>
              <Tag color="blue">{quantityFormat(total)}</Tag>
            </Space>
            <Space wrap>
              <Form form={page.form} component={false}>
                <Form.Item name="code" noStyle>
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder="Mã phiếu xuất"
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
              <Button icon={<SyncOutlined />} onClick={page.handleReset}>
                {page.t("order.filter_refresh")}
              </Button>
            </Space>
          </Flex>
        </Card>
      )}

      <DeliveryNotesList page={page} compactHeader={isTabView} />

      <Drawer
        title={page.t("common.filter")}
        open={filterOpen}
        width={720}
        onClose={() => setFilterOpen(false)}
        extra={
          <Space>
            <Button onClick={page.handleReset}>{page.t("order.filter_refresh")}</Button>
            <Button
              type="primary"
              onClick={() => {
                page.handleSearch();
                setFilterOpen(false);
              }}
            >
              {page.t("order.search")}
            </Button>
          </Space>
        }
      >
        <Form form={page.form} layout="vertical">
          <Row gutter={[20, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="code" label="Mã phiếu xuất">
                <Input allowClear prefix={<SearchOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="exportedAtFrom" label="Ngày bắt đầu">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="exportedAtTo" label="Ngày kết thúc">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </Space>
  );
};

export default DeliveryNotesStyle2;
