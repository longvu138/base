import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Flex,
  Image,
  Modal,
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
import { ChatPanel } from "../ShipmentDetail/ChatPanel";

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
      <Link to={getRelatedPath(detail)}>{detail.relatedOrder}</Link>
      {after}
    </>
  );
};

const InfoLine = ({ label, value }: { label: string; value: any }) => (
  <Flex justify="space-between" gap={12}>
    <Text type="secondary">{label}</Text>
    <Text strong style={{ textAlign: "right" }}>{value ?? "---"}</Text>
  </Flex>
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
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%", minWidth: 0 }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={page.goBack}>
        {page.t("login.go_back")}
      </Button>

      <Card>
        <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
          <Flex justify="space-between" align="flex-start" gap={token.marginSM}>
            <Title level={5} style={{ margin: 0, wordBreak: "break-word" }}>
              #{detail.code}, <ClaimName detail={detail} />
            </Title>
            <Tag
              style={{
                backgroundColor: status.color || token.colorTextTertiary,
                color: token.colorWhite,
                borderColor: "transparent",
                marginInlineEnd: 0,
              }}
            >
              {status.name || status.code || "---"}
            </Tag>
          </Flex>

          {page.canArchive && (
            <Button
              block
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

          <InfoLine label={page.t("ticket_detail.reason")} value={detail.reasonView?.name || "---"} />
          <InfoLine label={page.t("ticket_detail.solution")} value={detail.solutionView?.name || "---"} />
          <InfoLine label={page.t("ticket_detail.demain")} value={moneyFormat(moneyCeil(detail.suggest))} />
          {detail.reasonView && (
            <InfoLine
              label={page.t("ticket_detail.quantity_missing")}
              value={
                detail.notReceived === 0
                  ? page.t("ticket_detail.all")
                  : quantityFormat(detail.notReceived)
              }
            />
          )}
          <InfoLine
            label={page.isRefund ? page.t("ticket_detail.refund") : page.t("ticket_detail.suggestion")}
            value={moneyFormat(
              moneyCeil(page.isRefund ? detail.totalRefund : detail.estimatedRefundValue),
            )}
          />
        </Space>
      </Card>

      <Card>
        <Steps
          progressDot
          direction="vertical"
          current={page.currentStep}
          items={page.steps.map((item: any) => ({
            title: item.description || item.name,
            description: item.timestamp ? dayjs(item.timestamp).format("HH:mm DD/MM/YYYY") : "",
          }))}
        />
      </Card>

      {hasClaimContent && (
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
              <Flex wrap="wrap" gap={token.marginSM} style={{ marginTop: token.marginSM }}>
                {attachments.map((item: any) => (
                  <Button
                    key={item.id || item.presignedUrl}
                    onClick={() => setPreview(item)}
                    style={{ width: 88, height: 88, padding: 0, overflow: "hidden" }}
                  >
                    <Image
                      preview={false}
                      width={86}
                      height={86}
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
      )}

      <div style={{ height: 560, minWidth: 0 }}>
        <ChatPanel
          entityType="claims"
          entityCode={detail.code}
          entityCreatedAt={detail.createdAt}
        />
      </div>

      <Modal open={!!preview} footer={null} width={360} onCancel={() => setPreview(null)}>
        {String(preview?.type || "").includes("video") ? (
          <video width="100%" height={360} controls src={preview?.presignedUrl || preview?.url}>
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
