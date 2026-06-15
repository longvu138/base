import { useState, type ReactNode } from "react";
import { Button, Card, Flex, Form, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { useTranslation } from "@repo/i18n";

type MobileFilterPanelProps = {
  primary?: ReactNode;
  advanced?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  primaryContent?: ReactNode;
  secondaryContent?: ReactNode;
  form?: FormInstance;
  onSearch?: (values?: any) => void;
  onReset?: () => void;
  searchText?: string;
  resetText?: string;
  loading?: boolean;
  actionExtra?: ReactNode;
  actionClassName?: string;
  defaultExpanded?: boolean;
  className?: string;
};

const isPlainObject = (value: any) => {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
};

const trimStringValues = (value: any): any => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(trimStringValues);
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, trimStringValues(item)]),
    );
  }
  return value;
};

export const MobileFilterPanel = ({
  primary,
  advanced,
  actions,
  children,
  primaryContent,
  secondaryContent,
  form,
  onSearch,
  onReset,
  searchText,
  resetText,
  loading = false,
  actionExtra,
  actionClassName,
  defaultExpanded = false,
  className,
}: MobileFilterPanelProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const primaryNode = primary ?? primaryContent;
  const advancedNode = advanced ?? secondaryContent ?? children;
  const hasAdvanced = Boolean(advancedNode);

  const handleSubmit = () => {
    let values: any;
    if (form) {
      values = trimStringValues(form.getFieldsValue());
      form.setFieldsValue(values);
    }
    onSearch?.(values);
  };

  const actionNode =
    actions ?? (
      <>
        {actionExtra}
        {onReset ? (
          <Button onClick={onReset} disabled={loading}>
            {resetText || t("order.filter_refresh")}
          </Button>
        ) : null}
        {onSearch ? (
          <Button type="primary" htmlType="submit" loading={loading}>
            {searchText || t("common.search")}
          </Button>
        ) : null}
      </>
    );

  return (
    <Card className={className || "shadow-sm"} styles={{ body: { padding: 16 } }}>
      <Form form={form} colon={false} layout="vertical" onFinish={handleSubmit}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {primaryNode}

          {hasAdvanced && expanded ? advancedNode : null}

          <Flex justify="space-between" align="center" gap={12} wrap>
            {hasAdvanced ? (
              <Typography.Link
                onClick={() => setExpanded((value) => !value)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                {expanded ? <UpOutlined /> : <DownOutlined />}
                {expanded ? t("common.collapse") : t("common.expand")}
              </Typography.Link>
            ) : (
              <span />
            )}
            <Flex justify="flex-end" gap={8} wrap className={actionClassName}>
              {actionNode}
            </Flex>
          </Flex>
        </Space>
      </Form>
    </Card>
  );
};

export default MobileFilterPanel;
