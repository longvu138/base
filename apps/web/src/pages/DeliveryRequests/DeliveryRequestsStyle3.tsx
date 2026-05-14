import dayjs from "dayjs";
import { Link } from "react-router-dom";
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
  Spin,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DownOutlined,
  Loading3QuartersOutlined,
  RightOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useTranslation } from "@repo/i18n";
import { useDeliveryRequestsPage } from "./hooks/useDeliveryRequestsPage";

type AnyRecord = Record<string, any>;

const empty = "---";

const display = (value: any) =>
  value === null || value === undefined || value === "" ? empty : `${value}`;

const quantity = (value: any) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return empty;
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(
    numericValue,
  );
};

const dateTime = (value: any) =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : empty;

const addressText = (record: AnyRecord) => {
  if (!record.address) return empty;
  return [
    record.address.fullName,
    record.address.address,
    record.address.location?.display,
  ]
    .filter(Boolean)
    .join(", ");
};

export const DeliveryRequestsStyle3 = ({
  isTabView,
}: {
  isTabView?: boolean;
}) => {
  void isTabView;
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const {
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    listData,
    isDeliveryRequestsLoading,
    statusData = [],
    deliveryPackages,
    isDeliveryPackagesLoading,
    expandedRowKeys,
    handleSearch,
    handleReset,
    handleExpand,
  } = useDeliveryRequestsPage();

  const watchedStatuses = Form.useWatch("statuses", form);
  const checkedStatusesValue = watchedStatuses ?? filters.statuses;
  const checkedStatuses = Array.isArray(checkedStatusesValue)
    ? checkedStatusesValue
    : checkedStatusesValue
      ? [checkedStatusesValue]
      : [];

  const activeFilterStatuses = Array.isArray(filters.statuses)
    ? filters.statuses
    : filters.statuses
      ? [filters.statuses]
      : [];

  const toggleStatus = (status: AnyRecord) => {
    const exists = checkedStatuses.includes(status.code);
    const statuses = exists
      ? checkedStatuses.filter((item) => item !== status.code)
      : [...checkedStatuses, status.code];
    form.setFieldValue("statuses", statuses);
  };

  const packageColumns: ColumnsType<AnyRecord> = [
    {
      title: t("delivery.package_code"),
      dataIndex: "code",
      key: "code",
      render: (text) => <Typography.Text>{display(text)}</Typography.Text>,
    },
    {
      title: t("delivery.order"),
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text, row) => (
        <Link to={row.isShipment ? `/shipments/${text}` : `/orders/${text}`}>
          {display(text)}
        </Link>
      ),
    },
    {
      title: t("delivery.created_at"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: dateTime,
    },
    {
      title: t("delivery.volumetric"),
      dataIndex: "volumetric",
      key: "volumetric",
      render: (text) =>
        text ? `${quantity(text)} cm3` : t("delivery.undefined"),
    },
    {
      title: t("delivery.weight"),
      dataIndex: "actualWeight",
      key: "actualWeight",
      render: (text) =>
        Number.isFinite(Number(text))
          ? `${quantity(text)} kg`
          : t("delivery.undefined"),
    },
  ];

  const columns: ColumnsType<AnyRecord> = [
    {
      title: t("delivery.delivery_code"),
      dataIndex: "code",
      key: "code",
      render: (text) => (
        <Typography.Text strong style={{ textTransform: "uppercase" }}>
          {display(text)}
        </Typography.Text>
      ),
    },
    {
      title: t("delivery.created_time"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: dateTime,
    },
    {
      title: t("delivery.shipping_method"),
      dataIndex: "shippingMethod",
      key: "shippingMethod",
      render: (value) => display(value?.name ?? value?.code),
    },
    {
      title: t("delivery.status"),
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const foundStatus = statusData.find(
          (item: AnyRecord) => item.code === status,
        );
        return (
          <Tag
            color={foundStatus?.color || "default"}
            style={{
              marginInlineEnd: 0,
              color: token.colorWhite,
              borderColor: foundStatus?.color || token.colorBorder,
            }}
          >
            {display(foundStatus?.name)}
          </Tag>
        );
      },
    },
    {
      title: t("delivery.weight"),
      dataIndex: "totalWeight",
      key: "totalWeight",
      align: "right",
      render: (text) =>
        text ? `${quantity(text)} kg` : t("delivery.undefined"),
    },
    {
      title: t("delivery.address"),
      dataIndex: "address",
      key: "address",
      render: (_text, record) => (
        <Typography.Text style={{ whiteSpace: "pre-wrap" }}>
          {addressText(record)}
        </Typography.Text>
      ),
    },
    {
      title: t("delivery.note"),
      dataIndex: "note",
      key: "note",
      render: (text) => (
        <Typography.Text style={{ whiteSpace: "pre-wrap" }}>
          {display(text)}
        </Typography.Text>
      ),
    },
  ];

  const expandedRowRender = () => {
    if (isDeliveryPackagesLoading) {
      return (
        <Flex justify="center" style={{ padding: token.paddingLG }}>
          <Spin
            indicator={
              <Loading3QuartersOutlined spin style={{ fontSize: 24 }} />
            }
          />
        </Flex>
      );
    }

    if (!deliveryPackages.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("message.empty")}
        />
      );
    }

    return (
      <Table
        rowKey="id"
        columns={packageColumns}
        dataSource={deliveryPackages}
        pagination={{
          hideOnSinglePage: true,
          current: 1,
          total: deliveryPackages.length,
          pageSize: deliveryPackages.length,
        }}
      />
    );
  };

  return (
    <Space direction="vertical" size={token.marginLG} style={{ width: "100%" }}>
      <Card styles={{ body: { padding: token.paddingLG } }}>
        <Form form={form} layout="vertical">
          <Space
            direction="vertical"
            size={token.marginMD}
            style={{ width: "100%" }}
          >
            <Row
              gutter={[token.marginMD, token.marginMD]}
              style={{
                borderBottom: `1px dotted ${token.colorBorder}`,
                paddingBottom: token.paddingMD,
              }}
            >
              <Col flex="120px">
                <Typography.Text>{t("delivery.status")}:</Typography.Text>
              </Col>
              <Col flex="auto">
                <Space size={[token.marginXS, token.marginXS]} wrap>
                  {statusData.map((item: AnyRecord) => {
                    const checked = checkedStatuses.includes(item.code);
                    const active = activeFilterStatuses.includes(item.code);
                    return (
                      <Tag.CheckableTag
                        key={item.code}
                        checked={checked}
                        onChange={() => toggleStatus(item)}
                        style={{
                          paddingInline: token.paddingSM,
                          border: `1px solid ${active || checked ? token.colorPrimary : token.colorBorder}`,
                          borderRadius: token.borderRadiusSM,
                          background: checked
                            ? token.colorPrimary
                            : token.colorBgContainer,
                        }}
                      >
                        <Typography.Text
                          style={{
                            color: checked ? token.colorWhite : token.colorText,
                          }}
                        >
                          {item.name}
                        </Typography.Text>
                      </Tag.CheckableTag>
                    );
                  })}
                </Space>
              </Col>
            </Row>

            <Row gutter={token.marginLG}>
              <Col xs={24} md={12}>
                <Form.Item name="query" label={t("delivery.search_code")}>
                  <Input
                    onPressEnter={handleSearch}
                    placeholder={t("delivery.search_code")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Typography.Text>{t("delivery.created_time")}:</Typography.Text>
                <Row
                  gutter={token.marginMD}
                  style={{ marginTop: token.marginXS }}
                >
                  <Col span={12}>
                    <Form.Item name="createdFrom" noStyle>
                      <DatePicker
                        format="DD/MM/YYYY"
                        placeholder={t("delivery.start_date")}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="createdTo" noStyle>
                      <DatePicker
                        format="DD/MM/YYYY"
                        placeholder={t("delivery.end_date")}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Flex justify="flex-end" align="center" gap={token.marginMD}>
              <Typography.Link type="secondary" onClick={handleReset}>
                <SyncOutlined style={{ marginInlineEnd: token.marginXS }} />
                {t("order.filter_refresh")}
              </Typography.Link>
              <Button
                type="primary"
                style={{ minWidth: 200 }}
                onClick={handleSearch}
              >
                {t("order.search")}
              </Button>
            </Flex>
          </Space>
        </Form>
      </Card>

      <Card
        styles={{
          body: { padding: 0 },
        }}
      >
        <Flex
          justify="space-between"
          align="center"
          style={{
            padding: token.paddingLG,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t("delivery.list_title")}{" "}
            {listData ? `(${quantity(listData.total)})` : ""}
          </Typography.Title>
          <Link to="/delivery/create">
            <Button type="primary">{t("delivery.create_title")}</Button>
          </Link>
        </Flex>

        <div style={{ padding: token.paddingLG }}>
          <Table
            rowKey={(record) => record.code}
            columns={columns}
            dataSource={listData?.data || []}
            loading={isDeliveryRequestsLoading}
            expandable={{
              expandedRowKeys,
              expandedRowRender,
              onExpand: handleExpand,
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? (
                  <DownOutlined onClick={(event) => onExpand(record, event)} />
                ) : (
                  <RightOutlined onClick={(event) => onExpand(record, event)} />
                ),
            }}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("message.empty")}
                />
              ),
            }}
          />
        </div>
      </Card>

      <Flex justify="center">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={listData?.total || 0}
          hideOnSinglePage
          onChange={(nextPage, nextPageSize) => {
            setPage(nextPage);
            if (nextPageSize !== pageSize) setPageSize(nextPageSize);
          }}
        />
      </Flex>
    </Space>
  );
};
