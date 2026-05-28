import {
  Card,
  Collapse,
  Empty,
  Pagination,
  Skeleton,
  Space,
  Typography,
  theme,
} from "antd";
import { useProfileFaqsPage } from "@repo/hooks";

type ProfileFaqsContentProps = {
  t: (key: string) => string;
};

export const ProfileFaqsContent = ({ t }: ProfileFaqsContentProps) => {
  const { token } = theme.useToken();
  const logic = useProfileFaqsPage();

  return (
    <Card styles={{ body: { padding: token.paddingLG } }}>
      {logic.isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : !logic.faqs.length ? (
        <Empty description={t("message.empty")} />
      ) : (
        <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
          <Collapse
            accordion
            activeKey={logic.activeFaq}
            onChange={logic.setActiveFaq}
            items={logic.faqs.map((item: any, index: number) => ({
              key: String(index),
              label: (
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {item.title}
                </Typography.Title>
              ),
              children: (
                <Typography.Paragraph
                  style={{
                    lineHeight: 1.67,
                    marginBottom: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <span
                    dangerouslySetInnerHTML={{ __html: item.content || "" }}
                  />
                </Typography.Paragraph>
              ),
            }))}
          />
          <Pagination
            hideOnSinglePage
            showQuickJumper
            current={logic.page}
            pageSize={logic.pageSize}
            total={logic.total}
            onChange={logic.setPage}
            style={{ textAlign: "center" }}
          />
        </Space>
      )}
    </Card>
  );
};
