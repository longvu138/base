import { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
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
import {
  FilterOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { quantityFormat } from "@repo/util";
import { FilterPanel } from "@repo/ui";
import { useLieferscheinePage } from "./hooks/useLieferscheinePage";
import { LieferscheineList } from "./LieferscheineShared";

export const LieferscheineStyleThanhla = () => {
  const { token } = theme.useToken();
  const [filterOpen, setFilterOpen] = useState(false);
  const page = useLieferscheinePage();
  const total = page.listData?.total || 0;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card>
        <Flex justify="space-between" align="center" gap={token.marginMD} wrap>
          <Space size="small" align="center">
            <Typography.Title level={3} style={{ margin: 0 }}>
              Danh sách phiếu giao
            </Typography.Title>
            <Tag color="blue">{quantityFormat(total)}</Tag>
          </Space>
          <Space wrap>
            <Form form={page.form} component={false}>
              <Form.Item name="query" noStyle>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Mã phiếu giao"
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

      <LieferscheineList page={page} />

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
          primaryContent={
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="query" label="Mã phiếu giao" style={{ marginBottom: 0 }}>
                  <Input allowClear prefix={<SearchOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="orderCode" label="Mã đơn" style={{ marginBottom: 0 }}>
                  <Input allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="issueDateFrom" label="Ngày tạo từ" style={{ marginBottom: 0 }}>
                  <DatePicker
                    showTime={{ format: "HH:mm" }}
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY HH:mm"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="issueDateTo" label="Đến" style={{ marginBottom: 0 }}>
                  <DatePicker
                    showTime={{ format: "HH:mm" }}
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY HH:mm"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="status" label="Trạng thái" style={{ marginBottom: 0 }}>
                  <Checkbox.Group>
                    <Space wrap>
                      {page.statuses.map((item) => (
                        <Checkbox key={item.value} value={item.value}>
                          {item.label}
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>
                </Form.Item>
              </Col>
            </Row>
          }
        />
      </Drawer>
    </Space>
  );
};

export default LieferscheineStyleThanhla;
