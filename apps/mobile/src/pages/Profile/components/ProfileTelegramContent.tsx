import { useState } from "react";
import { App, Button, Card, Col, Input, Row, Space, Typography, theme } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useConnectTelegramMutation } from "@repo/hooks";

type ProfileTelegramContentProps = {
  t: (key: string) => string;
};

const resolveTelegramError = (error: any, t: (key: string) => string) => {
  const title = error?.response?.data?.title || error?.title;
  if (title) return t(`message.${title}`);
  return error?.response?.data?.message || error?.message || t("common.error");
};

export const ProfileTelegramContent = ({ t }: ProfileTelegramContentProps) => {
  const { token } = theme.useToken();
  const { notification } = App.useApp();
  const [username, setUsername] = useState("");
  const connectTelegram = useConnectTelegramMutation();

  const submit = async () => {
    if (!username.trim()) return;
    try {
      const res = await connectTelegram.mutateAsync(username.trim());
      if (res?.url) {
        window.open(res.url, "_blank");
      }
    } catch (error: any) {
      notification.error({ message: resolveTelegramError(error, t) });
    }
  };

  return (
    <Card styles={{ body: { padding: token.paddingLG } }}>
      <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {t("customer_info.telegram")}
        </Typography.Title>
        <Row justify="center">
          <Col xs={24} lg={16}>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                allowClear
                value={username}
                placeholder={t("customer_info.telegramUsername")}
                onChange={(event) => setUsername(event.target.value)}
                onPressEnter={submit}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                disabled={!username.trim()}
                loading={connectTelegram.isPending}
                onClick={submit}
              >
                {t("customer_info.buttonTelegram")}
              </Button>
            </Space.Compact>
          </Col>
        </Row>
      </Space>
    </Card>
  );
};
