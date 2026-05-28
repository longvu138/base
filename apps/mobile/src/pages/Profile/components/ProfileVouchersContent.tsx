import { useMemo } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Input,
  Modal,
  Pagination,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { CheckOutlined, GiftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useProfileVouchersPage } from "@repo/hooks";

type ProfileVouchersContentProps = {
  t: (key: string, options?: any) => string;
};

const emptyText = "---";

const formatDate = (value?: string) =>
  value ? dayjs(value).format("DD/MM/YYYY") : emptyText;

const getVoucherTitle = (item: any) => item.title || item.name || item.code || emptyText;

const VoucherTicket = ({
  item,
  onDetail,
  t,
}: {
  item: any;
  onDetail: (item: any) => void;
  t: (key: string, options?: any) => string;
}) => {
  const { token } = theme.useToken();
  const remainingText = t("coupon.voucherRemaining", {
    value: item.remaining ?? emptyText,
  });
  const customerLimitText = t("coupon.voucherCustomerLimit", {
    value: item.customerLimit ?? emptyText,
  });

  return (
    <Card
      size="small"
      styles={{ body: { padding: 0 } }}
      style={{ overflow: "hidden", height: "100%" }}
    >
      <Row wrap={false} style={{ height: "100%" }}>
        <Col flex="132px">
          <Flex
            vertical
            align="center"
            justify="center"
            gap={token.marginXS}
            style={{
              background: token.colorPrimary,
              color: token.colorWhite,
              height: "100%",
              minHeight: 128,
              padding: token.paddingSM,
              textAlign: "center",
            }}
          >
            {item.image ? (
              <Avatar size={64} src={item.image} />
            ) : (
              <Avatar
                size={64}
                icon={<GiftOutlined />}
                style={{
                  background: token.colorWhite,
                  color: token.colorPrimary,
                }}
              />
            )}
            <Typography.Text
              strong
              style={{ color: token.colorWhite, wordBreak: "break-word" }}
            >
              {item.code}
            </Typography.Text>
          </Flex>
        </Col>
        <Col flex="auto">
          <Flex
            vertical
            justify="space-between"
            style={{ height: "100%", padding: token.paddingMD }}
            gap={token.marginSM}
          >
            <Space direction="vertical" size={token.marginXXS}>
              <Space wrap>
                <Typography.Text strong>{getVoucherTitle(item)}</Typography.Text>
                <Tag color="red" style={{ marginInlineEnd: 0 }}>
                  {remainingText}
                </Tag>
              </Space>
              <Tooltip title={item.description}>
                <Typography.Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{ marginBottom: 0 }}
                >
                  {item.description || emptyText}
                </Typography.Paragraph>
              </Tooltip>
              <Typography.Text type="secondary">
                {customerLimitText}
              </Typography.Text>
            </Space>
            <Flex justify="space-between" align="center" gap={token.marginSM}>
              <Typography.Text type="secondary">
                {t("coupon.voucherValidTo", {
                  value: formatDate(item.validTo || item.endDate || item.expiredAt),
                })}
              </Typography.Text>
              <Typography.Link onClick={() => onDetail(item)}>
                {t("button.detail")}
              </Typography.Link>
            </Flex>
          </Flex>
        </Col>
      </Row>
    </Card>
  );
};

export const ProfileVouchersContent = ({ t }: ProfileVouchersContentProps) => {
  const { token } = theme.useToken();
  const logic = useProfileVouchersPage(t);

  const modalVoucher = logic.selectedVoucher;
  const voucherRows = useMemo(
    () =>
      logic.vouchers.map((item: any) => (
        <Col xs={24} xl={12} key={item.id || item.code}>
          <VoucherTicket item={item} onDetail={logic.openDetail} t={t} />
        </Col>
      )),
    [logic.openDetail, logic.vouchers, t],
  );

  return (
    <>
      <Card styles={{ body: { padding: token.paddingLG } }}>
        <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {t("customer_info.listCoupon")}
          </Typography.Title>

          <Card
            size="small"
            styles={{ body: { padding: token.paddingLG } }}
            style={{ background: token.colorFillQuaternary }}
          >
            <Row justify="center">
              <Col xs={24} lg={16}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    allowClear
                    value={logic.voucherCode}
                    placeholder={t("coupon.voucherCode")}
                    onChange={(event) => logic.setVoucherCode(event.target.value)}
                    onPressEnter={logic.submitVoucherCode}
                  />
                  <Button
                    icon={<CheckOutlined />}
                    loading={logic.isChecking}
                    onClick={logic.submitVoucherCode}
                  >
                    {t("button.check")}
                  </Button>
                </Space.Compact>
              </Col>
            </Row>
          </Card>

          <Divider style={{ marginBlock: 0 }} />

          {logic.isLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : logic.vouchers.length ? (
            <Row gutter={[token.marginMD, token.marginMD]}>{voucherRows}</Row>
          ) : (
            <Empty description={t("message.empty")} />
          )}

          {logic.total > logic.pageSize && (
            <Pagination
              hideOnSinglePage
              showQuickJumper
              current={logic.page}
              pageSize={logic.pageSize}
              total={logic.total}
              onChange={logic.setPage}
              style={{ textAlign: "center" }}
            />
          )}
        </Space>
      </Card>

      <Modal
        title={t("customer_info.detailCoupon")}
        open={logic.detailOpen}
        width={660}
        footer={null}
        onCancel={logic.closeDetail}
      >
        {modalVoucher && (
          <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
            <VoucherTicket item={modalVoucher} onDetail={() => undefined} t={t} />
            <Typography.Paragraph
              style={{
                maxHeight: 320,
                overflow: "auto",
                marginBottom: 0,
              }}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: modalVoucher.termsAndConditions || "",
                }}
              />
            </Typography.Paragraph>
          </Space>
        )}
      </Modal>
    </>
  );
};
