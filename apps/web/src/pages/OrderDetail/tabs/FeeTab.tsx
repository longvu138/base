import { useMemo, useState } from "react";
import {
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Modal,
  Row,
  Skeleton,
  Space,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useOrderFeesQuery } from "@repo/hooks";

interface FeeTabProps {
  orderCode: string;
  order: any;
}

const { Text, Title, Link } = Typography;

const money = (value: any, showSign = false) => {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
    return "---";
  }

  const numberValue = Math.ceil(Number(value));
  const prefix = showSign && numberValue > 0 ? "+" : "";
  return `${prefix}${numberValue.toLocaleString("vi-VN")}đ`;
};

const originalMoney = (value: any, currency = "CNY") => {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) {
    return "";
  }

  return `(${Math.ceil(Number(value)).toLocaleString("vi-VN")} ${currency})`;
};

const sortFees = (fees: any[]) =>
  [...fees].sort((a: any, b: any) => Number(a.position || 0) - Number(b.position || 0));

const FeeValue = ({ fee }: { fee: any }) => {
  const value = money(fee.actualAmount);
  const hasTooltip = Boolean(fee.reason || fee.type?.minFee || fee.type?.maxFee);
  const tooltip = (
    <Space direction="vertical" size={2}>
      {fee.reason && <Text>{fee.reason}</Text>}
      {fee.type?.minFee != null && <Text>Phí tối thiểu: {money(fee.type.minFee)}</Text>}
      {fee.type?.maxFee != null && <Text>Phí tối đa: {money(fee.type.maxFee)}</Text>}
    </Space>
  );

  if (fee.free) {
    return (
      <Space size={4}>
        <Text delete type="secondary">
          {value}
        </Text>
        <Text>Miễn phí</Text>
        {hasTooltip && (
          <Tooltip title={tooltip}>
            <QuestionCircleOutlined />
          </Tooltip>
        )}
      </Space>
    );
  }

  if (fee.manual && fee.provisionalAmount !== null && fee.provisionalAmount !== undefined) {
    return (
      <Space size={4}>
        <Text delete type="secondary">
          {money(fee.provisionalAmount)}
        </Text>
        <Text>{value}</Text>
        {hasTooltip && (
          <Tooltip title={tooltip}>
            <QuestionCircleOutlined />
          </Tooltip>
        )}
      </Space>
    );
  }

  return (
    <Space size={4}>
      <Text>{value}</Text>
      {hasTooltip && (
        <Tooltip title={tooltip}>
          <QuestionCircleOutlined />
        </Tooltip>
      )}
    </Space>
  );
};

const FeeGroup = ({ title, fees }: { title: string; fees: any[] }) => {
  const { token } = theme.useToken();
  if (fees.length === 0) return null;

  return (
    <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
      <Title level={5} style={{ margin: 0, textTransform: "uppercase", fontSize: token.fontSize }}>
        {title}
      </Title>
      <Card size="small" styles={{ body: { background: token.colorFillAlter } }}>
        <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
          {fees.map((fee: any, index: number) => (
            <Flex key={fee.id || `${fee.type?.code || fee.service}-${index}`} justify="space-between" gap={token.marginSM}>
              <Space size={4}>
                <Text>{fee.type?.name || fee.service || "---"}</Text>
                {(fee.type?.minFee != null || fee.type?.maxFee != null) && (
                  <Tooltip
                    title={
                      <Space direction="vertical" size={2}>
                        <Text>Phí tối thiểu: {money(fee.type?.minFee)}</Text>
                        <Text>Phí tối đa: {money(fee.type?.maxFee)}</Text>
                      </Space>
                    }
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                )}
              </Space>
              <FeeValue fee={fee} />
            </Flex>
          ))}
        </Space>
      </Card>
    </Space>
  );
};

const SummaryLine = ({
  label,
  value,
  strong,
  small,
  onDetail,
}: {
  label: string;
  value: string;
  strong?: boolean;
  small?: string;
  onDetail?: () => void;
}) => (
  <Flex justify="space-between" align="flex-start" gap={12}>
    <Text strong={strong} style={{ color: "white" }}>
      {label}
    </Text>
    <Space direction="vertical" size={0} align="end">
      <Text strong={strong} style={{ color: "white" }}>
        {value}
      </Text>
      {small && <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>{small}</Text>}
      {onDetail && (
        <Link onClick={onDetail} style={{ color: "white", fontSize: 12 }}>
          Chi tiết
        </Link>
      )}
    </Space>
  </Flex>
);

export const FeeTab = ({ orderCode, order }: FeeTabProps) => {
  const { token } = theme.useToken();
  const { data: fees = [], isLoading } = useOrderFeesQuery(orderCode);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [collectModalOpen, setCollectModalOpen] = useState(false);

  const groupedFees = useMemo(() => {
    const sorted = sortFees(Array.isArray(fees) ? fees : []);
    return {
      serviceFees: sorted.filter((fee: any) => fee.type && !fee.type.shipping && !fee.type.additional),
      shippingFees: sorted.filter((fee: any) => fee.type && fee.type.shipping && !fee.type.additional),
      additionalFees: sorted.filter((fee: any) => fee.type && !fee.type.shipping && fee.type.additional),
    };
  }, [fees]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 10 }} />;

  const totalFee = order.totalFee ?? fees.reduce((sum: number, fee: any) => sum + Number(fee.actualAmount || 0), 0);
  const totalUnpaid = Number(order.totalUnpaid || 0);
  const needPaymentLabel = totalUnpaid >= 0 ? "Cần thanh toán" : "Thừa tiền";

  return (
    <>
      <Row gutter={[token.marginLG, token.marginLG]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={token.marginLG} style={{ width: "100%" }}>
            <FeeGroup title="Phí dịch vụ" fees={groupedFees.serviceFees} />
            <FeeGroup title="Phí vận chuyển" fees={groupedFees.shippingFees} />
            <FeeGroup title="Phụ thu" fees={groupedFees.additionalFees} />
            {groupedFees.serviceFees.length === 0 &&
              groupedFees.shippingFees.length === 0 &&
              groupedFees.additionalFees.length === 0 && <Empty description="Không có phí" />}
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
            <Title level={5} style={{ margin: 0, textTransform: "uppercase", fontSize: token.fontSize }}>
              Tài chính đơn
            </Title>
            <Card
              styles={{
                body: {
                  background: token.colorPrimary,
                  borderRadius: token.borderRadius,
                },
              }}
            >
              <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
                <SummaryLine
                  label="Tiền hàng"
                  value={money(order.exchangedTotalValue ?? order.itemsTotal ?? order.totalValue)}
                  small={order.totalValue ? originalMoney(order.totalValue, "CNY") : undefined}
                />
                {(order.discountAmount || order.exchangedDiscountAmount || order.supplierDiscount) && (
                  <SummaryLine
                    label="Giảm giá từ NCC"
                    value={money(order.exchangedDiscountAmount ?? order.supplierDiscount)}
                    small={order.discountAmount ? originalMoney(order.discountAmount, "CNY") : undefined}
                  />
                )}
                <SummaryLine
                  label="Phí VC nội địa"
                  value={money(order.exchangedMerchantShippingCost ?? order.domesticShippingFee ?? order.merchantShippingCost)}
                  small={order.merchantShippingCost ? originalMoney(order.merchantShippingCost, "CNY") : undefined}
                />
                <SummaryLine label="Tổng tiền phí" value={money(totalFee)} />
                {order.totalCoupon > 0 && <SummaryLine label="Mã giảm giá" value={`-${money(order.totalCoupon)}`} />}

                <Divider style={{ borderColor: "rgba(255,255,255,0.35)", margin: `${token.marginXS}px 0` }} />
                <SummaryLine label="Tổng chi phí" value={money(order.grandTotal)} strong />
                <SummaryLine label="Đã thanh toán" value={money(order.totalPaid ?? order.paidAmount)} />
                <SummaryLine label="Dịch vụ trả lại" value={money(order.totalRefund ?? order.returnServiceFee)} />
                <SummaryLine label={needPaymentLabel} value={money(order.totalUnpaid, true)} />

                {order.totalClaim ? (
                  <>
                    <Divider style={{ borderColor: "rgba(255,255,255,0.35)", margin: `${token.marginXS}px 0` }} />
                    <SummaryLine
                      label="Đã khiếu nại hoàn tiền"
                      value={money(order.totalClaim)}
                      onDetail={() => setClaimModalOpen(true)}
                    />
                  </>
                ) : null}

                {order.totalCollect ? (
                  <>
                    <Divider style={{ borderColor: "rgba(255,255,255,0.35)", margin: `${token.marginXS}px 0` }} />
                    <SummaryLine
                      label="Truy thu"
                      value={money(order.totalCollect, true)}
                      onDetail={() => setCollectModalOpen(true)}
                    />
                  </>
                ) : null}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <Modal title="Danh sách hoàn tiền" open={claimModalOpen} footer={null} onCancel={() => setClaimModalOpen(false)}>
        <Empty description="Không có dữ liệu chi tiết" />
      </Modal>
      <Modal title="Danh sách truy thu" open={collectModalOpen} footer={null} onCancel={() => setCollectModalOpen(false)}>
        <Empty description="Không có dữ liệu chi tiết" />
      </Modal>
    </>
  );
};
