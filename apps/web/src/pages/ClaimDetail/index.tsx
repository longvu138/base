import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Image,
  Modal,
  Row,
  Skeleton,
  Space,
  Steps,
  Tag,
  Typography,
  theme,
} from "antd";
import { useState } from "react";
import { useClaimDetailPage } from "@repo/hooks";
import { moneyCeil, moneyFormat, quantityFormat } from "@repo/util";
import { ChatPanel } from "../../components/Common/ChatPanel";

const { Text, Title, Paragraph } = Typography;

const getRelatedPath = (detail: any) => {
  const ticketType = String(detail?.ticketType || "").toUpperCase();
  return ticketType === "SHIPMENT"
    ? `/shipments/${detail.relatedOrder}`
    : `/orders/${detail.relatedOrder}`;
};

const ClaimName = ({ detail }: { detail: any }) => {
  if (!detail?.name) return null;
  if (!detail?.relatedOrder || !String(detail.name).includes(detail.relatedOrder)) {
    return <>{detail.name}</>;
  }

  const [before, after] = String(detail.name).split(detail.relatedOrder);
  return (
    <>
      {before}
      <Link to={getRelatedPath(detail)} target="_blank">
        {detail.relatedOrder}
      </Link>
      {after}
    </>
  );
};

const Metric = ({ label, value }: { label: string; value: any }) => (
  <Space direction="vertical" size={0} style={{ minWidth: 120 }}>
    <Text type="secondary">{label}</Text>
    <Text strong>{value ?? "---"}</Text>
  </Space>
);

export const ClaimDetailPage = () => {
  const { token } = theme.useToken();
  const page = useClaimDetailPage();
  const { detail } = page;
  const [preview, setPreview] = useState<any>(null);

  if (page.isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (page.isError || !detail?.code) {
    return <Empty description={page.t("message.not_found")} />;
  }

  const status = detail.publicStateNewView || {};
  const attachments = Array.isArray(detail.attachments) ? detail.attachments : [];
  const hasClaimContent = Boolean(detail.reasonView && detail.description) || attachments.length > 0;

  return (
    <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={page.goBack}>
        {page.t("login.go_back")}
      </Button>

      <Card>
        <Space direction="vertical" size={token.marginLG} style={{ width: "100%" }}>
          <Flex justify="space-between" align="flex-start" gap={token.margin} wrap>
            <Title level={5} style={{ margin: 0 }}>
              #{detail.code}, <ClaimName detail={detail} />
            </Title>
            <Space>
              {page.canArchive && (
                <Button
                  type="link"
                  loading={page.isArchiving}
                  onClick={() => {
                    Modal.confirm({
                      title: page.t("ticket_detail.close"),
                      content: page.t("ticket_detail.close_confirm"),
                      onOk: page.archiveClaim,
                    });
                  }}
                >
                  {page.t("ticket_detail.close")}
                </Button>
              )}
              <Tag
                style={{
                  backgroundColor: status.color || token.colorTextTertiary,
                  color: token.colorWhite,
                  borderColor: "transparent",
                }}
              >
                {status.name || status.code || "---"}
              </Tag>
            </Space>
          </Flex>

          <Divider style={{ margin: 0 }} />

          <Row gutter={[token.marginLG, token.margin]}>
            <Col xs={24} xl={12}>
              <Flex gap={token.margin} wrap="wrap">
                <Metric label={page.t("ticket_detail.reason")} value={detail.reasonView?.name || "---"} />
                <Divider type="vertical" style={{ height: 44 }} />
                <Metric label={page.t("ticket_detail.solution")} value={detail.solutionView?.name || "---"} />
                <Divider type="vertical" style={{ height: 44 }} />
                <Metric label={page.t("ticket_detail.demain")} value={moneyFormat(moneyCeil(detail.suggest))} />
                {detail.reasonView && (
                  <>
                    <Divider type="vertical" style={{ height: 44 }} />
                    <Metric
                      label={page.t("ticket_detail.quantity_missing")}
                      value={
                        detail.notReceived === 0
                          ? page.t("ticket_detail.all")
                          : quantityFormat(detail.notReceived)
                      }
                    />
                  </>
                )}
                <Divider type="vertical" style={{ height: 44 }} />
                <Metric
                  label={page.isRefund ? page.t("ticket_detail.refund") : page.t("ticket_detail.suggestion")}
                  value={moneyFormat(
                    moneyCeil(page.isRefund ? detail.totalRefund : detail.estimatedRefundValue),
                  )}
                />
              </Flex>
            </Col>
            <Col xs={24} xl={12}>
              <Steps
                progressDot
                current={page.currentStep}
                items={page.steps.map((item: any) => ({
                  title: item.description || item.name,
                  description: item.timestamp ? dayjs(item.timestamp).format("HH:mm DD/MM/YYYY") : "",
                }))}
              />
            </Col>
          </Row>
        </Space>
      </Card>

      <Row gutter={[token.margin, token.margin]} align="stretch">
        {hasClaimContent && (
          <Col xs={24} xl={12}>
            <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
              {detail.reasonView && detail.description ? (
                <div>
                  <Text type="secondary">{page.t("ticket_detail.description")}</Text>
                  <Paragraph strong style={{ marginTop: token.marginXS, whiteSpace: "pre-wrap" }}>
                    {detail.description}
                  </Paragraph>
                </div>
              ) : null}

              {attachments.length > 0 && (
                <div>
                  <Text type="secondary">{page.t("ticket_detail.image")}</Text>
                  <Flex wrap="wrap" gap={token.margin} style={{ marginTop: token.marginSM }}>
                    {attachments.map((item: any) => (
                      <Button
                        key={item.id || item.presignedUrl}
                        onClick={() => setPreview(item)}
                        style={{ width: 100, height: 100, padding: 0, overflow: "hidden" }}
                      >
                        <Image
                          preview={false}
                          width={98}
                          height={98}
                          src={item.presignedUrl || item.url}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          style={{ objectFit: "cover" }}
                        />
                      </Button>
                    ))}
                  </Flex>
                </div>
              )}
            </Space>
          </Col>
        )}
        <Col xs={24} xl={hasClaimContent ? 12 : 24}>
          <div style={{ height: 560 }}>
            <ChatPanel
              entityType="claims"
              entityCode={detail.code}
              entityCreatedAt={detail.createdAt}
            />
          </div>
        </Col>
      </Row>

      <Modal open={!!preview} footer={null} width={760} onCancel={() => setPreview(null)}>
        {String(preview?.type || "").includes("video") ? (
          <video width="100%" height={500} controls src={preview?.presignedUrl || preview?.url}>
            {preview?.name}
          </video>
        ) : (
          <Image
            width="100%"
            preview={false}
            alt={preview?.name}
            src={preview?.presignedUrl || preview?.url}
            referrerPolicy="no-referrer"
          />
        )}
      </Modal>
    </Space>
  );
};

export default ClaimDetailPage;
