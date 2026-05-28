import { useState } from "react";
import {
  Card,
  Empty,
  Input,
  Skeleton,
  Table,
  Typography,
  theme,
} from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { usePurchasingAccountsQuery } from "@repo/hooks";

type ProfilePurchasingAccountContentProps = {
  t: (key: string) => string;
};

export const ProfilePurchasingAccountContent = ({
  t,
}: ProfilePurchasingAccountContentProps) => {
  const { token } = theme.useToken();
  const { data: accounts = [], isLoading } = usePurchasingAccountsQuery();
  const [visibleRows, setVisibleRows] = useState<Record<string, boolean>>({});

  const rows = accounts.map((item: any, index: number) => ({
    key: item.id || item.username || index,
    username: item.username,
    password: item.password,
  }));

  if (isLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  return (
    <Card
      title={`${t("customer_info.purchasing_account")} (${rows.length})`}
      styles={{ body: { padding: token.paddingLG } }}
    >
      {rows.length ? (
        <Table
          rowKey="key"
          dataSource={rows}
          pagination={false}
          columns={[
            {
              title: t("customer_info.purchasing_account_username"),
              dataIndex: "username",
              render: (value: string) =>
                value ? (
                  <Typography.Paragraph
                    copyable={{ text: value }}
                    style={{ marginBottom: 0 }}
                  >
                    {value}
                  </Typography.Paragraph>
                ) : (
                  "---"
                ),
            },
            {
              title: t("customer_info.purchasing_account_password"),
              dataIndex: "password",
              render: (value: string, record: any) => {
                const visible = !!visibleRows[record.key];
                return value ? (
                  <Input
                    bordered={false}
                    readOnly
                    value={value}
                    type={visible ? "text" : "password"}
                    suffix={
                      visible ? (
                        <EyeInvisibleOutlined
                          onClick={() =>
                            setVisibleRows((current) => ({
                              ...current,
                              [record.key]: false,
                            }))
                          }
                        />
                      ) : (
                        <EyeOutlined
                          onClick={() =>
                            setVisibleRows((current) => ({
                              ...current,
                              [record.key]: true,
                            }))
                          }
                        />
                      )
                    }
                  />
                ) : (
                  "---"
                );
              },
            },
          ]}
        />
      ) : (
        <Empty description={t("message.empty")} />
      )}
    </Card>
  );
};
