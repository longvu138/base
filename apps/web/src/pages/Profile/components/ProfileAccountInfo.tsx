import { useEffect, useState } from "react";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Typography,
  theme,
} from "antd";
import {
  CloseOutlined,
  EditOutlined,
  KeyOutlined,
  LockOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ProfileMode } from "../hooks/useProfilePage";

const emptyText = "---";

const displayDate = (value?: string) =>
  value ? dayjs(value).format("DD/MM/YYYY") : emptyText;

type EditableFieldProps = {
  label: string;
  name: string;
  value?: string;
  type?: "text" | "date" | "select" | "readonly";
  required?: boolean;
  variant?: "classic" | "compact" | "summary";
  t: (key: string) => string;
  onSave: (name: string, value: string) => Promise<void>;
  onEmailSave: (value: string) => void;
};

const EditableField = ({
  label,
  name,
  value,
  type = "text",
  required,
  variant = "classic",
  t,
  onSave,
  onEmailSave,
}: EditableFieldProps) => {
  const { token } = theme.useToken();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  const save = async () => {
    const nextValue = draft?.trim?.() ?? draft;
    if (required && !nextValue) return;
    if (name === "email") {
      onEmailSave(nextValue);
      setEditing(false);
      return;
    }
    setLoading(true);
    try {
      await onSave(name, nextValue);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const displayValue = () => {
    if (type === "date") return displayDate(value);
    if (type === "select") {
      if (value === "male") return t("userProfile.male");
      if (value === "female") return t("userProfile.female");
    }
    return value || emptyText;
  };

  const compact = variant !== "classic";

  return (
    <Flex
      align={compact ? "stretch" : "flex-start"}
      gap={compact ? token.marginXXS : token.marginSM}
      vertical={compact}
      style={{
        background: compact ? token.colorFillAlter : undefined,
        border: compact ? `1px solid ${token.colorBorderSecondary}` : undefined,
        borderRadius: compact ? token.borderRadiusLG : undefined,
        minHeight: 34,
        padding: compact ? token.paddingSM : undefined,
      }}
    >
      <Typography.Text
        type="secondary"
        style={{
          flex: compact ? undefined : "0 0 150px",
          width: compact ? "auto" : 150,
        }}
      >
        {label}:
        {required && <Typography.Text type="danger"> *</Typography.Text>}
      </Typography.Text>
      {editing ? (
        <Flex gap={token.marginXS} style={{ width: "100%" }}>
          {type === "date" ? (
            <DatePicker
              autoFocus
              format="DD/MM/YYYY"
              value={draft ? dayjs(draft) : null}
              onChange={(date) =>
                setDraft(date ? date.format("YYYY-MM-DD") : "")
              }
              style={{ width: 220 }}
            />
          ) : type === "select" ? (
            <Select
              autoFocus
              value={draft}
              onChange={setDraft}
              style={{ width: 220 }}
              options={[
                { label: emptyText, value: "" },
                { label: t("userProfile.male"), value: "male" },
                { label: t("userProfile.female"), value: "female" },
              ]}
            />
          ) : (
            <Input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onPressEnter={save}
              style={{ maxWidth: 360 }}
            />
          )}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onMouseDown={(event) => event.preventDefault()}
            onClick={save}
          />
          <Button
            icon={<CloseOutlined />}
            disabled={loading}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setDraft(value || "");
              setEditing(false);
            }}
          />
        </Flex>
      ) : (
        <Flex align="center" gap={token.marginXS} style={{ minWidth: 0 }}>
          <Typography.Text strong>{displayValue()}</Typography.Text>
          {type !== "readonly" && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => setEditing(true)}
            />
          )}
        </Flex>
      )}
    </Flex>
  );
};

type ProfileAccountInfoProps = {
  t: (key: string) => string;
  user: any;
  isSubmitting: boolean;
  variant?: "classic" | "compact" | "summary";
  updateField: (name: string, value: string) => Promise<void>;
  requestEmailUpdate: (value: string) => void;
  setMode: (mode: ProfileMode) => void;
  setRecoverPinOpen: (open: boolean) => void;
};

export const ProfileAccountInfo = ({
  t,
  user,
  isSubmitting,
  variant = "classic",
  updateField,
  requestEmailUpdate,
  setMode,
  setRecoverPinOpen,
}: ProfileAccountInfoProps) => {
  const { token } = theme.useToken();

  return (
    <Spin spinning={isSubmitting}>
      <Space
        direction="vertical"
        size={token.marginMD}
        style={{ width: "100%" }}
      >
        <Row gutter={[24, 14]}>
          <Col xs={24} xl={12}>
            <Space
              direction="vertical"
              size={token.marginSM}
              style={{ width: "100%" }}
            >
              <EditableField
                label={t("customer_info.username")}
                name="username"
                value={user.username}
                type="readonly"
                variant={variant}
                t={t}
                onSave={updateField}
                onEmailSave={requestEmailUpdate}
              />
              <EditableField
                label={t("customer_info.fullname")}
                name="fullname"
                value={user.fullname}
                required
                variant={variant}
                t={t}
                onSave={updateField}
                onEmailSave={requestEmailUpdate}
              />
              <EditableField
                label={t("customer_info.date_of_birth")}
                name="dob"
                value={user.dob}
                type="date"
                variant={variant}
                t={t}
                onSave={updateField}
                onEmailSave={requestEmailUpdate}
              />
              <EditableField
                label={t("customer_info.contact_address")}
                name="contactAddress"
                value={user.contactAddress}
                variant={variant}
                t={t}
                onSave={updateField}
                onEmailSave={requestEmailUpdate}
              />
            </Space>
          </Col>
          <Col xs={24} xl={12}>
            <Space
              direction="vertical"
              size={token.marginSM}
              style={{ width: "100%" }}
            >
              <EditableField
                label={t("customer_info.email")}
                name="email"
                value={user.email}
                variant={variant}
                t={t}
                onSave={updateField}
                onEmailSave={requestEmailUpdate}
              />
              <EditableField
                label={t("customer_info.gender")}
                name="gender"
                value={user.gender}
                type="select"
                variant={variant}
                t={t}
                onSave={updateField}
                onEmailSave={requestEmailUpdate}
              />
              <EditableField
                label={t("customer_info.phone")}
                name="phone"
                value={user.phone}
                variant={variant}
                t={t}
                onSave={updateField}
                onEmailSave={requestEmailUpdate}
              />
            </Space>
          </Col>
        </Row>
        <Divider />
        <Space wrap>
          <Button
            type={variant === "classic" ? "default" : "primary"}
            icon={<LockOutlined />}
            onClick={() => setMode("password")}
          >
            {t("customer_info.change_password")}
          </Button>
          <Button icon={<KeyOutlined />} onClick={() => setMode("pin")}>
            {t("customer_info.change_pin")}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setRecoverPinOpen(true)}
          >
            {t("forgot_pin.reset_pin")}
          </Button>
        </Space>
      </Space>
    </Spin>
  );
};
