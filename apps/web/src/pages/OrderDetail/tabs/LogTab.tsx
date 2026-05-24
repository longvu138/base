import {
  Button,
  Divider,
  Empty,
  List,
  Row,
  Skeleton,
  Space,
  Spin,
  Typography,
  theme,
} from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  formatOrderLogContent,
  orderLogRoleLabelKey,
  useOrderLogsModel,
} from "@repo/features/order-detail";

interface LogTabProps {
  order: any;
  orderCode: string;
}

const { Text } = Typography;

export const LogTab = ({ order, orderCode }: LogTabProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const logModel = useOrderLogsModel({
    order,
    orderCode,
    t,
  });

  if (logModel.isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (logModel.isError) {
    return <Empty description={t("orderDetail.empty_log")} />;
  }

  return (
    <List
      itemLayout="vertical"
      dataSource={logModel.logs}
      locale={{ emptyText: <Empty description={t("orderDetail.empty_log")} /> }}
      loadMore={
        logModel.hasNextPage ? (
          <Row justify="center" style={{ paddingTop: 8 }}>
            <Button
              type="link"
              loading={logModel.isFetchingNextPage}
              onClick={() => logModel.fetchNextPage()}
            >
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
              {t(orderLogRoleLabelKey(item.role))}:{" "}
              <Text strong>{item.fullname}</Text>
            </Text>
            <div
              style={{
                color: token.colorText,
                fontSize: token.fontSize,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              dangerouslySetInnerHTML={{
                __html: formatOrderLogContent(item, t),
              }}
            />
            {item.storageDescription && (
              <Text strong>{item.storageDescription}</Text>
            )}
            {index < logModel.logs.length - 1 && (
              <Divider style={{ margin: "8px 0 0" }} />
            )}
          </Space>
        </List.Item>
      )}
    >
      {logModel.isFetchingNextPage && (
        <Row justify="center" style={{ padding: 12 }}>
          <Spin />
        </Row>
      )}
    </List>
  );
};
