import type { ReactNode } from "react";
import { Col, Empty, Flex, Input, Row, Skeleton, Table, Typography, theme } from "antd";
import { useOrderShippingFeesQuery } from "@repo/hooks";
import { moneyFormat } from "@repo/util";
import {
  buildInspectionFeeTable,
  buildPercentageFeeRows,
  buildShippingFeeTable,
  displayFeeValue,
  emptyFeeValue,
  getFeeConfigTableData,
  getLocationCode,
  getLocationName,
  getShippingFees,
  getWeightKey,
  inputQuantityFeeValue,
  normalizeFeeTableRows,
  quantityFeeValue,
} from "../../domain/feeTables";

const { Text } = Typography;

const makeRangeColumns = (sample: any, formatMoney: (value: any) => string) =>
  Object.keys(sample || {}).map((key) => ({
    title: key,
    dataIndex: key,
    key,
    render: (value: any) =>
      typeof value === "number" ? formatMoney(value) : String(value ?? emptyFeeValue),
  }));

const renderFeeDataFallback = (
  data: any,
  emptyText: ReactNode,
  formatMoney: (value: any) => string,
) => {
  const rows = normalizeFeeTableRows(data);

  if (rows.length > 0) {
    return (
      <Table
        size="small"
        bordered
        pagination={false}
        rowKey={(_, index) => String(index)}
        columns={makeRangeColumns(rows[0], formatMoney)}
        dataSource={rows}
      />
    );
  }

  if (data && typeof data === "object" && Object.keys(data).length > 0) {
    return (
      <Input.TextArea
        value={JSON.stringify(data, null, 2)}
        disabled
        autoSize={{ minRows: 6, maxRows: 16 }}
      />
    );
  }

  return <Empty description={emptyText} />;
};

export type FeeTableContentProps = {
  feeConfig: any;
  order: any;
  t: (key: string, options?: any) => string;
  formatMoney: (value: any) => string;
};

export const FeeTableContent = ({
  feeConfig,
  order,
  t,
  formatMoney,
}: FeeTableContentProps) => {
  const { token } = theme.useToken();
  const { metadata, template, data } = getFeeConfigTableData(feeConfig, order);
  const emptyText = t("config_group.empty_fee_table");
  const localShippingFees = getShippingFees(feeConfig, data);
  const shouldFetchShippingFees =
    template === "shipping" && localShippingFees.length === 0;
  const { data: fetchedShippingFees = [], isLoading: isShippingFeesLoading } =
    useOrderShippingFeesQuery(
      order?.configGroupId,
      feeConfig?.shippingClass ?? metadata.shippingClass,
      shouldFetchShippingFees,
    );

  if (template === "percentage_of_total_value") {
    const rows = buildPercentageFeeRows(data, {
      emptyOrderValue: t("config_group.emptyOrderValue"),
    });

    if (rows.length === 0) {
      return renderFeeDataFallback(data, emptyText, formatMoney);
    }

    return (
      <Table
        size="small"
        bordered
        pagination={false}
        rowKey="key"
        columns={[
          {
            title: t("config_group.orderValue"),
            dataIndex: "orderValue",
            width: 360,
          },
          {
            title: t("config_group.serviceCharge"),
            dataIndex: "fee",
            render: (value: any) => <Input value={displayFeeValue(value)} disabled />,
          },
        ]}
        dataSource={rows}
      />
    );
  }

  if (template === "inspection") {
    const { priceRanges, rows } = buildInspectionFeeTable(data, {
      emptyQuantity: t("config_group.emptyQuantity"),
      emptyUnitPrice: t("config_group.emptyUnitPrice"),
    });

    if (rows.length === 0 || priceRanges.length === 0) {
      return renderFeeDataFallback(data, emptyText, formatMoney);
    }

    return (
      <Table
        size="small"
        bordered
        pagination={false}
        rowKey="key"
        columns={[
          {
            title: t("config_group.numberProducts"),
            dataIndex: "quantity",
            fixed: "left",
            width: 260,
          },
          ...priceRanges.map((range) => ({
            title:
              range.empty
                ? t("config_group.emptyUnitPrice")
                : range.to === null || range.to === undefined
                  ? `Từ ${formatMoneyRange(range.from, "CNY")}`
                  : `Từ ${formatMoneyRange(range.from, "CNY")} đến dưới ${formatMoneyRange(range.to, "CNY")}`,
            dataIndex: range.key,
            width: 260,
            render: (value: any) => (
              <Flex align="center" gap={token.marginXS}>
                <Input
                  value={inputQuantityFeeValue(value)}
                  disabled
                  style={{ flex: 1 }}
                />
                <Text strong>đ/sp</Text>
              </Flex>
            ),
          })),
        ]}
        dataSource={rows}
        scroll={{ x: "max-content" }}
      />
    );
  }

  if (template === "shipping") {
    const shippingFees =
      localShippingFees.length > 0 ? localShippingFees : fetchedShippingFees;

    if (isShippingFeesLoading) {
      return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    if (shippingFees.length === 0) {
      return renderFeeDataFallback(data, emptyText, formatMoney);
    }

    const { tableLocations, tableWeights } = buildShippingFeeTable(shippingFees);

    return (
      <Table
        size="small"
        bordered
        pagination={false}
        rowKey={(record) => displayFeeValue(record.code)}
        columns={[
          {
            title: t("config_group.location"),
            dataIndex: "display",
            fixed: "left",
            width: 220,
            render: (_text, record) => getLocationName(record),
          },
          ...tableWeights.map((weight) => ({
            title: `${t("config_group.from")} ${quantityFeeValue(
              weight.minWeight,
            )}(kg) ${t("config_group.to")} ${quantityFeeValue(weight.maxWeight)} (kg)`,
            dataIndex: getWeightKey(weight),
            width: 220,
            render: (_value: any, record: any) => {
              const currentFee = shippingFees.find(
                (item: any) =>
                  getLocationCode(item) === displayFeeValue(record.code) &&
                  item.minWeight === weight.minWeight &&
                  item.maxWeight === weight.maxWeight,
              );
              const price = currentFee?.price;
              return (
                <Flex align="center" gap={token.marginXS}>
                  <Input
                    value={inputQuantityFeeValue(price)}
                    disabled
                    style={{ flex: 1 }}
                  />
                  <Text strong>đ/kg</Text>
                </Flex>
              );
            },
          })),
        ]}
        dataSource={tableLocations}
        scroll={{ x: 220 * tableWeights.length + 220 }}
      />
    );
  }

  if (template === "fixed_order" || template === "fixed_package") {
    return (
      <Row gutter={12} align="middle">
        <Col span={8}>
          <Text>{t("config_group.applied")}</Text>
        </Col>
        <Col span={10}>
          <Input value={data.value ?? emptyFeeValue} disabled />
        </Col>
        <Col span={6}>
          <Text>
            {template === "fixed_order"
              ? `₫/${t("config_group.order")}`
              : `₫/${t("config_group.package")}`}
          </Text>
        </Col>
      </Row>
    );
  }

  const rows = normalizeFeeTableRows(data);
  if (rows.length === 0) return renderFeeDataFallback(data, emptyText, formatMoney);

  return (
    <Table
      size="small"
      bordered
      pagination={false}
      rowKey={(_, index) => String(index)}
      columns={makeRangeColumns(rows[0], formatMoney)}
      dataSource={rows}
    />
  );
};

const formatMoneyRange = (value: any, unit: string) =>
  String(moneyFormat(value, unit)).replace(/\+/g, "");
