import { Button, Divider, Empty, List, Row, Skeleton, Space, Spin, Typography, theme } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useOrderLogsInfiniteQuery } from "@repo/hooks";
import { moneyFormat } from "@repo/util";

interface LogTabProps {
  order: any;
  orderCode: string;
}

type LogContent = Record<string, any> & {
  fullname: string;
  property: string;
  role?: string;
  storageDescription?: string;
  timestamp?: string;
};

const { Text } = Typography;

const emptyValue = "---";

const display = (value: any) => {
  if (value === null || value === undefined || value === "") return emptyValue;
  return String(value);
};

const quantity = (value: any) => {
  if (value === null || value === undefined || value === "") return emptyValue;
  return Number(value).toLocaleString("vi-VN");
};

const money = (value: any, currency?: any) => {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
    return emptyValue;
  }

  return moneyFormat(value, currency);
};

const formatChangedValue = (value: any) => {
  if (value === null || value === undefined || value === "") return emptyValue;
  if (typeof value === "object") return value.name || value.code || value.display || JSON.stringify(value);
  return value;
};

const roleLabelKey = (role?: string) => (role === "STAFF" ? "shipment_log.staff" : "shipment_log.customer");

const parseLogItem = (item: any, order: any, t: any): LogContent[] => {
  const base = {
    fullname: item?.actor?.fullname || emptyValue,
    role: item?.role,
    timestamp: item?.timestamp || emptyValue,
  };
  const data = item?.data;
  const reference = item?.reference || {};
  const orderCurrency = order?.marketplace?.currency || "¥";

  switch (item?.activity) {
    case "ORDER_CREATE":
    case "ORDER_RECEIPT_CREATE":
    case "ORDER_RECEIPT_DELETE":
      return [{ ...base, property: item.activity, value: data?.code || order?.code || item?.code }];

    case "ORDER_PRODUCT_UPDATE":
      if (!Array.isArray(data)) return [];
      return data
        .map((change: any) => {
          const common = {
            ...base,
            name: reference?.code,
            property: change?.property,
          };

          if (change?.property === "purchasedQuantity") {
            return {
              ...common,
              oldValue:
                change.oldValue === 0
                  ? t("log_product.out_of_stock")
                  : change.oldValue
                    ? quantity(change.oldValue)
                    : t("log_product.not_buy"),
              newValue:
                change.newValue === 0
                  ? t("log_product.out_of_stock")
                  : change.newValue === null
                    ? t("log_product.not_buy")
                    : quantity(change.newValue),
            };
          }

          if (change?.property === "actualPrice") {
            return {
              ...common,
              oldValue: money(change.oldValue, reference?.currency),
              newValue: money(change.newValue, reference?.currency),
            };
          }

          if (change?.property === "staffRemark") {
            return {
              ...common,
              oldValue: change.oldValue?.toString().trim() || t("log_product.empty"),
              newValue: change.newValue?.toString().trim() || t("log_product.empty"),
            };
          }

          if (change?.property === "confirm") {
            return {
              ...common,
              property: "confirm",
              confirm: change.newValue?.confirm ? t("log_order.agree") : t("log_order.reject"),
              type:
                change.newValue?.property === "actualPrice"
                  ? t("product_tab.sale_price", { defaultValue: "Đơn giá" })
                  : t("log_order.purchasedQuantity_label"),
              newValue:
                change.newValue?.property === "actualPrice"
                  ? money(change.newValue?.newValue, reference?.currency)
                  : change.newValue?.newValue,
            };
          }

          return {
            ...common,
            oldValue: formatChangedValue(change?.oldValue),
            newValue: formatChangedValue(change?.newValue),
          };
        })
        .filter((log: any) => log?.property);

    case "ORDER_UPDATE": {
      const change = Array.isArray(data) ? data[0] : data;
      if (!change?.property) return [];

      if (change.property === "discountAmount") {
        return [
          {
            ...base,
            property: "discountAmount",
            oldValue: display(change.oldValue),
            newValue: display(change.newValue),
          },
        ];
      }

      if (change.property === "merchantShippingCost") {
        return [
          {
            ...base,
            property: change.property,
            oldValue: change.oldValue === 0 ? t("shipment_log.free") : money(change.oldValue, orderCurrency),
            newValue: change.newValue === 0 ? t("shipment_log.free") : money(change.newValue, orderCurrency),
          },
        ];
      }

      if (change.property === "exchangeRate") {
        return [
          {
            ...base,
            property: "exchangeRate",
            oldValue: money(change.oldValue),
            newValue: money(change.newValue),
          },
        ];
      }

      if (change.property === "emdPercent") {
        return [
          {
            ...base,
            property: "ORDER_UPDATE_EMD",
            oldValue: quantity(change.oldValue),
            newValue: quantity(change.newValue),
          },
        ];
      }

      return [
        {
          ...base,
          property: change.property,
          oldValue: formatChangedValue(change.oldValue),
          newValue: formatChangedValue(change.newValue),
        },
      ];
    }

    case "ORDER_ADDRESS_UPDATE":
      if (!Array.isArray(data)) return [];
      return data
        .filter((change: any) => change?.property)
        .map((change: any) => ({
          ...base,
          property:
            change.property === "location"
              ? "ORDER_ADDRESS_UPDATE_LOCATION"
              : `ORDER_ADDRESS_UPDATE_${change.property}`,
          oldValue: formatChangedValue(change.oldValue?.display || change.oldValue),
          newValue: formatChangedValue(change.newValue?.display || change.newValue),
        }));

    case "ORDER_STATUS_UPDATE": {
      const change = Array.isArray(data) ? data[0] : data;
      return [
        {
          ...base,
          property: item.activity,
          oldValue: change?.oldValue?.name || change?.oldValue?.code || emptyValue,
          newValue: change?.newValue?.name || change?.newValue?.code || emptyValue,
        },
      ];
    }

    case "ORDER_CANCELLED":
    case "ORDER_FEE_CALCULATE_ALL":
      return [{ ...base, property: item.activity, name: data?.code || order?.code }];

    case "ORDER_FEE_CREATED":
      return [
        {
          ...base,
          property: item.activity,
          value: data?.type?.name,
          amount: money(data?.actualAmount),
          reason: data?.reason || emptyValue,
        },
      ];

    case "ORDER_FEE_UPDATE":
      if (!Array.isArray(data)) return [];
      return data
        .map((change: any) => {
          const name = reference?.type?.name || emptyValue;
          if (change.property === "reason") {
            return {
              ...base,
              property: "ORDER_FEE_UPDATE_REASON",
              name,
              oldValue: change.oldValue || t("shipment_log.empty"),
              newValue: change.newValue || emptyValue,
            };
          }

          if (change.property === "free" && change.newValue !== change.oldValue) {
            return {
              ...base,
              property: "ORDER_FEE_UPDATE_FREE",
              name,
              value: change.newValue ? t("shipment_log.free") : t("shipment_log.cancel_free"),
            };
          }

          if (change.property === "amount") {
            return {
              ...base,
              property: "ORDER_FEE_UPDATE_AMOUNT",
              name,
              oldValue: money(change.oldValue),
              newValue: money(change.newValue),
            };
          }

          return null;
        })
        .filter(Boolean) as LogContent[];

    case "ORDER_TRACKING_CREATE":
    case "ORDER_PACKAGE_CREATE":
    case "ORDER_PACKAGE_DELETE":
    case "ORDER_TRACKING_DELETE":
      return [{ ...base, property: item.activity, value: data?.code || data?.[0]?.code || emptyValue }];

    case "ORDER_PACKAGE_UPDATE":
      if (!Array.isArray(data)) return [];
      return data
        .filter((change: any) => change?.property)
        .map((change: any) => ({
          ...base,
          property: `ORDER_PACKAGE_UPDATE_${change.property}`,
          name: reference?.code,
          oldValue: formatChangedValue(change.oldValue),
          newValue: formatChangedValue(change.newValue),
        }));

    case "ORDER_SERVICE_UPDATE": {
      const change = Array.isArray(data) ? data[0] : data;
      const added = change?.addedValues || [];
      const removed = change?.removedValues || [];
      return [
        ...added.map((service: any) => ({
          ...base,
          property: "ORDER_SERVICE_UPDATE_ADD",
          addValue: service?.name || service,
        })),
        ...removed.map((service: any) => ({
          ...base,
          property: "ORDER_SERVICE_UPDATE_REMOVE",
          removeValue: service?.name || service,
        })),
      ];
    }

    case "ORDER_SERVICE_APPROVED":
      if (!Array.isArray(data)) return [];
      return data.map((change: any) => ({
        ...base,
        property: change?.newValue ? "ORDER_SERVICE_APPROVED_ADD" : "ORDER_SERVICE_APPROVED_REMOVE",
        service: reference?.name,
      }));

    case "payment":
    case "claim":
    case "emd":
    case "refund":
    case "collect":
    case "gift":
    case "deposit":
    case "charge":
    case "withdraw":
    case "adjust":
      return [
        {
          ...base,
          property: item.activity,
          amount: money(Math.abs(Number(item.amount || 0))),
          reason: item.memo || emptyValue,
        },
      ];

    case "ORDER_COUPON_APPLY":
      return [
        {
          ...base,
          property: item.activity,
          content: data ? `${data.code} - ${data.description}` : emptyValue,
        },
      ];

    case "ORDER_UPDATE_EXCHANGE_RATE":
      return [
        {
          ...base,
          property: "edit_exchange_rate",
          oldValue: money(data?.[0]?.oldValue),
          newValue: money(data?.[0]?.newValue),
        },
      ];

    case "ORDER_UPDATE_INTERNAL_EXCHANGE_RATE":
      return [{ ...base, property: "edit_internal_exchange_rate" }];

    default:
      return item?.activity
        ? [
            {
              ...base,
              property: item.activity,
              oldValue: formatChangedValue(data?.oldValue),
              newValue: formatChangedValue(data?.newValue),
              value: formatChangedValue(data?.code || data?.value),
              name: reference?.code || reference?.name,
              reason: item.memo || data?.reason,
            },
          ]
        : [];
  }
};

const parseLogs = (items: any[], order: any, t: any) =>
  items.flatMap((item) => parseLogItem(item, order, t)).filter((item) => item.property);

const formatLogContent = (item: LogContent, t: any) => {
  const translated = t(`log_order.${item.property}`, {
    ...item,
    defaultValue: item.property,
  });

  return translated === item.property ? display(item.reason || item.value || item.name || item.property) : translated;
};

export const LogTab = ({ order, orderCode }: LogTabProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const logQuery = useOrderLogsInfiniteQuery(orderCode);
  const logs = parseLogs(
    logQuery.data?.pages.flatMap((page) => page.data) || [],
    order,
    t,
  );

  if (logQuery.isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (logQuery.isError) {
    return <Empty description={t("orderDetail.empty_log")} />;
  }

  return (
    <List
      itemLayout="vertical"
      dataSource={logs}
      locale={{ emptyText: <Empty description={t("orderDetail.empty_log")} /> }}
      loadMore={
        logQuery.hasNextPage ? (
          <Row justify="center" style={{ paddingTop: 8 }}>
            <Button type="link" loading={logQuery.isFetchingNextPage} onClick={() => logQuery.fetchNextPage()}>
              {t("log_product.loading_more")}
            </Button>
          </Row>
        ) : null
      }
      renderItem={(item, index) => (
        <List.Item style={{ paddingInline: 0 }}>
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Text type="secondary">
              {dayjs(item.timestamp).format("HH:mm DD/MM/YYYY")},{" "}
              {t(roleLabelKey(item.role))}: <Text strong>{item.fullname}</Text>
            </Text>
            <div
              style={{ color: token.colorText, fontSize: token.fontSize, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              dangerouslySetInnerHTML={{ __html: formatLogContent(item, t) }}
            />
            {item.storageDescription && <Text strong>{item.storageDescription}</Text>}
            {index < logs.length - 1 && <Divider style={{ margin: "8px 0 0" }} />}
          </Space>
        </List.Item>
      )}
    >
      {logQuery.isFetchingNextPage && (
        <Row justify="center" style={{ padding: 12 }}>
          <Spin />
        </Row>
      )}
    </List>
  );
};
