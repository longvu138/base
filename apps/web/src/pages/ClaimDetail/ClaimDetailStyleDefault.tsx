import { useState } from "react";
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
import { useClaimDetailPage } from "@repo/hooks";
import { ChatPanel } from "../../components/Common/ChatPanel";

const { Text, Title, Paragraph } = Typography;

const ClaimName = ({ name }: { name: any }) => {
  if (!name?.text) return null;
  if (!name.hasRelatedLink) return <>{name.text}</>;

  return (
    <>
      {name.before}
      <Link to={name.relatedPath} target="_blank">
        {name.relatedOrder}
      </Link>
      {name.after}
    </>
  );
};

const Metric = ({ label, value }: { label: string; value: any }) => (
  <Space direction="vertical" size={0} style={{ minWidth: 120 }}>
    <Text type="secondary">{label}</Text>
    <Text strong>{value ?? "---"}</Text>
  </Space>
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
    <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={page.goBack}>
        {page.t("login.go_back")}
      </Button>

      <Card>
        <Space direction="vertical" size={token.marginLG} style={{ width: "100%" }}>
          <Flex justify="space-between" align="flex-start" gap={token.margin} wrap>
            <Title level={5} style={{ margin: 0 }}>
              #{detail.code}, <ClaimName name={view.claimName} />
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
                  backgroundColor: view.status.color || token.colorTextTertiary,
                  color: token.colorWhite,
                  borderColor: "transparent",
                }}
              >
                {view.status.name || view.status.code || "---"}
              </Tag>
            </Space>
          </Flex>

          <Divider style={{ margin: 0 }} />

          <Row gutter={[token.marginLG, token.margin]}>
            <Col xs={24} xl={12}>
              <Flex gap={token.margin} wrap="wrap">
                {view.metrics.map((metric: any, index: number) => (
                  <Flex key={metric.key} gap={token.margin} align="center">
                    {index > 0 && <Divider type="vertical" style={{ height: 44 }} />}
                    <Metric label={metric.label} value={metric.value} />
                  </Flex>
                ))}
              </Flex>
            </Col>
            <Col xs={24} xl={12}>
              <Steps
                progressDot
                current={page.currentStep}
                items={view.stepItems}
              />
            </Col>
          </Row>
        </Space>
      </Card>

      <Row gutter={[token.margin, token.margin]} align="stretch">
        {view.hasClaimContent && (
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

              {view.attachments.length > 0 && (
                <div>
                  <Text type="secondary">{page.t("ticket_detail.image")}</Text>
                  <Flex wrap="wrap" gap={token.margin} style={{ marginTop: token.marginSM }}>
                    {view.attachments.map((item: any) => (
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
        <Col xs={24} xl={view.hasClaimContent ? 12 : 24}>
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

export default ClaimDetailStyleDefault;
