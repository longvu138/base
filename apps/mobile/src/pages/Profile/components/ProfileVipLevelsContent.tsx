import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Flex,
  Form,
  Input,
  Pagination,
  Row,
  Space,
  Table,
  Typography,
  theme,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useProfileVipLevelsPage } from "@repo/hooks";

type ProfileVipLevelsContentProps = {
  t: (key: string) => string;
};

const quantityFormat = (value?: number) => Number(value || 0).toLocaleString();

export const ProfileVipLevelsContent = ({
  t,
}: ProfileVipLevelsContentProps) => {
  const { token } = theme.useToken();
  const logic = useProfileVipLevelsPage();

  const columns = [
    {
      title: t("customer_info.time"),
      dataIndex: "trxTime",
      width: 170,
      render: (value: string) =>
        value ? dayjs(value).format("HH:mm DD/MM/YYYY") : "---",
    },
    {
      title: t("customer_info.content"),
      dataIndex: "detail",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Typography.Text type="secondary">
            {t("customer_info.code")}: {record.id}
          </Typography.Text>
          <Typography.Text>{record.memo || "---"}</Typography.Text>
        </Space>
      ),
    },
    {
      title: t("customer_info.order_code"),
      dataIndex: "refId",
      width: 140,
      render: (value: string, record: any) => {
        const isShipment = Array.isArray(record.spendingSources)
          ? record.spendingSources.some((item: any) =>
              String(item.source || "").includes("shipment"),
            )
          : false;
        return value ? (
          <Link
            target="_blank"
            to={`/${isShipment ? "shipments" : "orders"}/${value}`}
          >
            #{value}
          </Link>
        ) : (
          "---"
        );
      },
    },
    {
      title: t("customer_info.point_number"),
      dataIndex: "amount",
      width: 140,
      align: "right" as const,
      render: (value: number) => (
        <Typography.Text
          strong
          type={Number(value || 0) >= 0 ? "success" : "danger"}
        >
          {Number(value || 0) >= 0 ? "+" : ""}
          {quantityFormat(value)}
        </Typography.Text>
      ),
    },
  ];

  return (
    <Card styles={{ body: { padding: token.paddingLG } }}>
      <Space
        direction="vertical"
        size={token.marginMD}
        style={{ width: "100%" }}
      >
        <Form form={logic.form} layout="vertical" onFinish={logic.handleSearch}>
          <Row
            gutter={[token.marginMD, token.marginSM]}
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              padding: token.paddingMD,
            }}
          >
            <Col xs={24} md={12}>
              <Form.Item
                name="orderCode"
                label={t("customer_info.input_order_code")}
                style={{ marginBottom: 0 }}
              >
                <Input onPressEnter={logic.handleSearch} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("customer_info.time")}
                style={{ marginBottom: 0 }}
              >
                <Space.Compact style={{ width: "100%" }}>
                  <Form.Item name="trxTimeFrom" noStyle>
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder={t("order.start")}
                      style={{ width: "50%" }}
                    />
                  </Form.Item>
                  <Form.Item name="trxTimeTo" noStyle>
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder={t("order.finish")}
                      style={{ width: "50%" }}
                    />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Flex justify="end" gap={token.marginSM}>
                <Button icon={<ReloadOutlined />} onClick={logic.handleReset}>
                  {t("order.filter_refresh")}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                >
                  {t("order.search")}
                </Button>
              </Flex>
            </Col>
          </Row>
        </Form>

        <Card
          size="small"
          title={
            <Typography.Text strong>
              {t("customer_info.accumulated_history_list")} (
              {quantityFormat(logic.total)})
            </Typography.Text>
          }
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={logic.transactions}
            loading={logic.isLoading}
            pagination={false}
            locale={{ emptyText: <Empty description={t("message.empty")} /> }}
            expandable={{
              expandedRowKeys: logic.expandedRowKeys,
              onExpandedRowsChange: (keys) =>
                logic.setExpandedRowKeys([...keys]),
              rowExpandable: (record: any) =>
                Array.isArray(record.spendingSources) &&
                record.spendingSources.length > 0,
              expandedRowRender: (record: any) => (
                <Table
                  rowKey={(item: any) => `${record?.id}-${item?.source}`}
                  size="small"
                  pagination={false}
                  dataSource={record.spendingSources || []}
                  columns={[
                    {
                      title: t("customer_info.fee"),
                      dataIndex: "source",
                      render: (value: string) =>
                        value || t("orderDetail.undefined"),
                    },
                    {
                      title: t("customer_info.point"),
                      dataIndex: "pointAmount",
                      align: "right" as const,
                      render: (value: number) => (
                        <Typography.Text
                          type={Number(value || 0) >= 0 ? "success" : "danger"}
                        >
                          {Number(value || 0) >= 0 ? "+" : ""}
                          {quantityFormat(value)}
                        </Typography.Text>
                      ),
                    },
                  ]}
                />
              ),
            }}
            scroll={{ x: 760 }}
          />
          <Pagination
            hideOnSinglePage
            current={logic.page}
            pageSize={logic.pageSize}
            total={logic.total}
            onChange={logic.setPage}
            style={{ marginTop: token.marginMD, textAlign: "right" }}
          />
        </Card>
      </Space>
    </Card>
  );
};
