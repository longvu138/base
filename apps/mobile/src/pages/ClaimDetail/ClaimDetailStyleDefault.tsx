import { useState } from "react";
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
import { useClaimDetailPage } from "@repo/hooks";
import { ChatPanel } from "../ShipmentDetail/ChatPanel";

const { Text, Title, Paragraph } = Typography;

const ClaimName = ({ name }: { name: any }) => {
  if (!name?.text) return null;
  if (!name.hasRelatedLink) return <>{name.text}</>;

  return (
    <>
      {name.before}
      <Link to={name.relatedPath}>{name.relatedOrder}</Link>
      {name.after}
    </>
  );
};

const InfoLine = ({ label, value }: { label: string; value: any }) => (
  <Flex justify="space-between" gap={12}>
    <Text type="secondary">{label}</Text>
    <Text strong style={{ textAlign: "right" }}>
      {value ?? "---"}
    </Text>
  </Flex>
);

export const ClaimDetailStyleDefault = () => {
  const { token } = theme.useToken();
  const page = useClaimDetailPage();
  const { detail, view } = page;
  const [preview, setPreview] = useState<any>(null);

  if (page.isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (page.isError || !detail?.code) {
    return <Empty description={page.t("message.not_found")} />;
  }

  return (
    <Space direction="vertical" size={token.marginMD} style={{ width: "100%", minWidth: 0 }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={page.goBack}>
        {page.t("login.go_back")}
      </Button>

      <Card>
        <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
          <Flex justify="space-between" align="flex-start" gap={token.marginSM}>
            <Title level={5} style={{ margin: 0, wordBreak: "break-word" }}>
              #{detail.code}, <ClaimName name={view.claimName} />
            </Title>
            <Tag
              style={{
                backgroundColor: view.status.color || token.colorTextTertiary,
                color: token.colorWhite,
                borderColor: "transparent",
                marginInlineEnd: 0,
              }}
            >
              {view.status.name || view.status.code || "---"}
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

          {view.metrics.map((metric: any) => (
            <InfoLine key={metric.key} label={metric.label} value={metric.value} />
          ))}
        </Space>
      </Card>

      <Card>
        <Steps
          progressDot
          direction="vertical"
          current={page.currentStep}
          items={view.stepItems}
        />
      </Card>

      {view.hasClaimContent && (
        <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
          {detail.reasonView && detail.description ? (
            <div>
              <Text type="secondary">{page.t("ticket_detail.description")}</Text>
              <Paragraph strong style={{ marginTop: token.marginXS, whiteSpace: "pre-wrap" }}>
                {detail.description}
              </Paragraph>
            </div>
          ) : null}

          {view.attachments.length > 0 && (
            <div>
              <Text type="secondary">{page.t("ticket_detail.image")}</Text>
              <Flex wrap="wrap" gap={token.marginSM} style={{ marginTop: token.marginSM }}>
                {view.attachments.map((item: any) => (
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

export default ClaimDetailStyleDefault;
