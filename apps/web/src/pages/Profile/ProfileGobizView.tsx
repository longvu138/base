import { createContext, useContext, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Menu,
  Modal,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  CloseOutlined,
  EditOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  LockOutlined,
  ReloadOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { formatCurrency, moneyCeil, moneyFormat } from "@repo/util";
import { useCustomerDiscountQuery, useCustomerLevelsQuery, useFeesQuery } from "@repo/hooks";
import dayjs from "dayjs";
import { useProfilePage } from "./hooks/useProfilePage";

type ProfileGobizViewProps = {
  variant?: "classic" | "compact" | "summary";
};

const emptyText = "---";

const displayDate = (value?: string) => (value ? dayjs(value).format("DD/MM/YYYY") : emptyText);

const quantityFormat = (value?: number) => Number(value || 0).toLocaleString();

type ProfilePageLogic = ReturnType<typeof useProfilePage>;

const ProfilePageContext = createContext<ProfilePageLogic | null>(null);

const useProfileContext = () => {
  const context = useContext(ProfilePageContext);
  if (!context) {
    throw new Error("ProfilePageContext is missing");
  }
  return context;
};

const ProfileSidebar = ({ compact = false }: { compact?: boolean }) => {
  const { token } = theme.useToken();
  const location = useLocation();
  const { t, user, menuItems } = useProfileContext();
  const showReward = user.customerLevel?.name || user.rewardPoint > 0;

  return (
    <Card styles={{ body: { padding: 0 } }}>
      <Flex
        vertical
        align="center"
        gap={token.marginXS}
        style={{
          padding: compact ? token.paddingLG : token.paddingXL,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Avatar size={compact ? 72 : 88} src={user.avatar} icon={<UserOutlined />} />
        <Typography.Title level={5} style={{ margin: `${token.marginSM}px 0 0`, textAlign: "center" }}>
          {user.fullname || user.username || emptyText}
        </Typography.Title>
        <Typography.Text type="secondary">
          {[user.username, user.code].filter(Boolean).join(" | ") || emptyText}
        </Typography.Text>
        {showReward && (
          <Tag color="gold" style={{ marginInlineEnd: 0 }}>
            {user.customerLevel?.name || t("orderDetail.no_level_yet")} | {user.rewardPoint.toLocaleString()}{" "}
            {t("customer_info.point_2")}
          </Tag>
        )}
        {compact && (
          <Typography.Text strong style={{ color: token.colorPrimary }}>
            {formatCurrency(user.balance)}
          </Typography.Text>
        )}
      </Flex>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: <Link to={item.key}>{item.label}</Link>,
        }))}
      />
    </Card>
  );
};

const EditableField = ({
  label,
  name,
  value,
  type = "text",
  required,
  onSave,
  onEmailSave,
}: {
  label: string;
  name: string;
  value?: string;
  type?: "text" | "date" | "select" | "readonly";
  required?: boolean;
  onSave: (name: string, value: string) => Promise<void>;
  onEmailSave: (value: string) => void;
}) => {
  const { token } = theme.useToken();
  const { t } = useProfileContext();
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

  return (
    <Flex align="flex-start" gap={token.marginSM} style={{ minHeight: 34 }}>
      <Typography.Text type="secondary" style={{ width: 150, flex: "0 0 150px" }}>
        {label}:{required && <Typography.Text type="danger"> *</Typography.Text>}
      </Typography.Text>
      {editing ? (
        <Flex gap={token.marginXS} style={{ width: "100%" }}>
          {type === "date" ? (
            <DatePicker
              autoFocus
              format="DD/MM/YYYY"
              value={draft ? dayjs(draft) : null}
              onChange={(date) => setDraft(date ? date.format("YYYY-MM-DD") : "")}
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
          <Button type="primary" icon={<SaveOutlined />} loading={loading} onMouseDown={(e) => e.preventDefault()} onClick={save} />
          <Button
            icon={<CloseOutlined />}
            disabled={loading}
            onMouseDown={(e) => e.preventDefault()}
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
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setEditing(true)} />
          )}
        </Flex>
      )}
    </Flex>
  );
};

const ProfileForm = () => {
  const { token } = theme.useToken();
  const { t, user, isSubmitting, updateField, requestEmailUpdate, setMode, setRecoverPinOpen } = useProfileContext();

  return (
    <Spin spinning={isSubmitting}>
      <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
        <Row gutter={[24, 14]}>
          <Col xs={24} xl={12}>
            <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
              <EditableField label={t("customer_info.username")} name="username" value={user.username} type="readonly" onSave={updateField} onEmailSave={requestEmailUpdate} />
              <EditableField label={t("customer_info.fullname")} name="fullname" value={user.fullname} required onSave={updateField} onEmailSave={requestEmailUpdate} />
              <EditableField label={t("customer_info.date_of_birth")} name="dob" value={user.dob} type="date" onSave={updateField} onEmailSave={requestEmailUpdate} />
              <EditableField label={t("customer_info.contact_address")} name="contactAddress" value={user.contactAddress} onSave={updateField} onEmailSave={requestEmailUpdate} />
            </Space>
          </Col>
          <Col xs={24} xl={12}>
            <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
              <EditableField label={t("customer_info.email")} name="email" value={user.email} onSave={updateField} onEmailSave={requestEmailUpdate} />
              <EditableField label={t("customer_info.gender")} name="gender" value={user.gender} type="select" onSave={updateField} onEmailSave={requestEmailUpdate} />
              <EditableField label={t("customer_info.phone")} name="phone" value={user.phone} onSave={updateField} onEmailSave={requestEmailUpdate} />
            </Space>
          </Col>
        </Row>
        <Divider />
        <Space wrap>
          <Button icon={<LockOutlined />} onClick={() => setMode("password")}>
            {t("customer_info.change_password")}
          </Button>
          <Button icon={<KeyOutlined />} onClick={() => setMode("pin")}>
            {t("customer_info.change_pin")}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => setRecoverPinOpen(true)}>
            {t("forgot_pin.reset_pin")}
          </Button>
        </Space>
      </Space>
    </Spin>
  );
};

const ProfileVipLevelBox = () => {
  const { token } = theme.useToken();
  const { t, user, showVipLevelBox } = useProfileContext();
  const [open, setOpen] = useState(false);
  const { data: levels = [], isLoading: isLevelsLoading } = useCustomerLevelsQuery(showVipLevelBox);
  const { data: discounts = {}, isLoading: isDiscountLoading } = useCustomerDiscountQuery(showVipLevelBox);
  const { data: fees = [], isLoading: isFeesLoading } = useFeesQuery(showVipLevelBox);

  if (!showVipLevelBox) return null;
  if (isLevelsLoading) return <Skeleton active paragraph={{ rows: 2 }} />;
  if (!levels.length) return null;

  const currentLevel = user.customerLevel;
  const currentIndex = currentLevel ? levels.findIndex((item: any) => item.id === currentLevel.id) : -1;
  const nextLevel = levels[currentIndex + 1] || levels[0];
  const highestLevel = currentLevel && !levels[currentIndex + 1];
  const progressPercent = nextLevel?.minPoint
    ? Math.min((Number(user.rewardPoint || 0) * 100) / Number(nextLevel.minPoint || 1), 100)
    : 100;

  const discountRows = [
    {
      key: "deposit",
      name: t("customer_info.deposit"),
      current: getEmdLevelValue(discounts?.emdLevels, currentLevel),
      next: getEmdLevelValue(discounts?.emdLevels, nextLevel),
    },
    ...fees.map((fee: any) => ({
      key: fee.code || fee.id,
      name: fee.name,
      current: getDiscountValue(discounts?.discounts, currentLevel, fee.code),
      next: getDiscountValue(discounts?.discounts, nextLevel, fee.code),
    })),
  ];

  const levelBoxAlign = highestLevel ? "center" : "flex-end";
  const rightLevel = highestLevel ? currentLevel : nextLevel;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: levelBoxAlign,
          backgroundColor: "#2e9aff",
          padding: "10px 20px",
          position: "relative",
          minHeight: 122,
        }}
      >
        <div style={{ marginRight: 10, textAlign: "center", color: token.colorWhite, width: 110 }}>
          {currentLevel ? (
            <>
              {currentLevel.imageUrl ? (
                <img
                  src={currentLevel.imageUrl}
                  alt=""
                  style={{ maxHeight: 100, maxWidth: 100, objectFit: "contain" }}
                />
              ) : (
                <Avatar size={80} icon={<UserOutlined />} />
              )}
              <div style={{ fontWeight: token.fontWeightStrong, marginTop: 5 }}>
                {currentLevel.name}
              </div>
            </>
          ) : (
            <>
              <Avatar size={80} icon={<UserOutlined />} />
              <div style={{ fontWeight: token.fontWeightStrong, marginTop: 5 }}>
                {t("orderDetail.no_level_yet")}
              </div>
            </>
          )}
        </div>

        <div style={{ width: "50%", minWidth: 260 }}>
          {highestLevel ? (
            <div style={{ color: token.colorWhite, fontSize: token.fontSizeHeading3, textAlign: "center" }}>
              <div>{t("customer_info.congratulation_on_highest_level")}</div>
            </div>
          ) : (
            <>
              <div style={{ color: token.colorWhite, fontSize: token.fontSizeHeading2 }}>
                <span style={{ fontWeight: token.fontWeightStrong }}>
                  {quantityFormat(user.rewardPoint)}
                </span>{" "}
                /{" "}
                <span style={{ fontSize: token.fontSizeHeading4 }}>
                  {quantityFormat(nextLevel?.minPoint)}
                </span>
                <Tooltip title={t("customer_info.updated_level")}>
                  <InfoCircleOutlined style={{ marginLeft: 10, fontSize: token.fontSizeHeading4 }} />
                </Tooltip>
              </div>
              <Progress
                showInfo={false}
                percent={progressPercent}
                strokeColor={token.colorWhite}
                trailColor="#0983c6"
                style={{ marginBottom: 5 }}
              />
            </>
          )}
        </div>

        <div style={{ marginLeft: 10, textAlign: "center", color: token.colorWhite, width: 110 }}>
          {rightLevel?.imageUrl ? (
            <img
              src={rightLevel.imageUrl}
              alt=""
              style={{ maxHeight: 100, maxWidth: 100, objectFit: "contain" }}
            />
          ) : (
            <Avatar size={80} icon={<UserOutlined />} />
          )}
          <div style={{ fontWeight: token.fontWeightStrong, marginTop: 5 }}>
            {highestLevel ? t("customer_info.max_level") : nextLevel?.name}
          </div>
        </div>

        <Typography.Link
          onClick={() => setOpen(true)}
          style={{
            position: "absolute",
            bottom: 10,
            right: 20,
            color: token.colorWhite,
            textDecoration: "underline",
          }}
        >
            {t("customer_info.detail")}
        </Typography.Link>
      </div>

      <Modal
        title={t("customer_info.level_preferential_detail")}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={720}
      >
        <Table
          size="small"
          loading={isDiscountLoading || isFeesLoading}
          pagination={false}
          dataSource={discountRows}
          columns={[
            { title: "", dataIndex: "name" },
            ...(currentLevel
              ? [{ title: currentLevel.name, dataIndex: "current", align: "right" as const }]
              : []),
            ...(nextLevel
              ? [{ title: nextLevel.name, dataIndex: "next", align: "right" as const }]
              : []),
          ]}
        />
      </Modal>
    </>
  );
};

const getEmdLevelValue = (emdLevels: any[] = [], level: any) => {
  if (!level) return emptyText;
  const emd = emdLevels.find((item) => item.customerLevelId === level.id);
  return emd ? `${emd.emdPercent}%` : emptyText;
};

const getDiscountValue = (discounts: any[] = [], level: any, feeCode?: string) => {
  if (!level || !feeCode) return emptyText;
  const discount = discounts.find((item) => item.customerLevelId === level.id && item.feeCode === feeCode);
  if (!discount) return emptyText;
  return discount.discountType === "PERCENT"
    ? `${quantityFormat(discount.discountValue)}%`
    : moneyFormat(moneyCeil(discount.discountValue));
};

const PasswordForm = () => {
  const { t, isSubmitting, submitPassword, setMode } = useProfileContext();
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical" onFinish={submitPassword} style={{ maxWidth: 520 }}>
      <Form.Item name="currentPassword" label={t("customer_info.current_pass")} rules={[{ required: true, message: t("customer_info.not_empty_pass") }]}>
        <Input.Password placeholder={t("customer_info.input_current_pass")} />
      </Form.Item>
      <Form.Item
        name="newPassword"
        label={t("customer_info.new_pass")}
        rules={[
          { required: true, message: t("customer_info.not_empty_newPass") },
          { min: 6, max: 32, message: t("customer_info.require_characters_length") },
        ]}
      >
        <Input.Password placeholder={t("customer_info.input_new_pass")} />
      </Form.Item>
      <Form.Item
        name="rePassword"
        label={t("customer_info.retype_new_pass")}
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: t("customer_info.please_retype_newPass") },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
              return Promise.reject(new Error(t("customer_info.not_match_pass")));
            },
          }),
        ]}
      >
        <Input.Password placeholder={t("customer_info.please_retype_newPass")} />
      </Form.Item>
      <Space>
        <Button onClick={() => setMode("profile")}>{t("button.cancel")}</Button>
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          {t("button.save")}
        </Button>
      </Space>
    </Form>
  );
};

const PinForm = () => {
  const { t, isSubmitting, submitPin, setMode } = useProfileContext();
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical" onFinish={submitPin} style={{ maxWidth: 520 }}>
      <Form.Item name="currentPIN" label={t("customer_info.old_pin")} rules={[{ required: true, message: t("customer_info.input_old_pin") }]}>
        <Input.Password placeholder={t("customer_info.input_old_pin")} />
      </Form.Item>
      <Form.Item
        name="newPIN"
        label={t("customer_info.new_pin")}
        rules={[
          { required: true, message: t("customer_info.input_new_pin") },
          { min: 4, message: t("customer_info.least_four_characters") },
          { pattern: /^[0-9]+$/, message: t("customer_info.numbers_required") },
        ]}
      >
        <Input.Password placeholder={t("customer_info.input_new_pin")} />
      </Form.Item>
      <Form.Item
        name="rePIN"
        label={t("customer_info.retype_pin")}
        dependencies={["newPIN"]}
        rules={[
          { required: true, message: t("customer_info.please_retype_pin") },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPIN") === value) return Promise.resolve();
              return Promise.reject(new Error(t("customer_info.not_match_pin")));
            },
          }),
        ]}
      >
        <Input.Password placeholder={t("customer_info.please_retype_pin")} />
      </Form.Item>
      <Space>
        <Button onClick={() => setMode("profile")}>{t("button.cancel")}</Button>
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          {t("button.save")}
        </Button>
      </Space>
    </Form>
  );
};

const ProfileContent = () => {
  const { t, mode } = useProfileContext();

  if (mode === "password") {
    return (
      <Card title={t("customer_info.change_password")}>
        <PasswordForm />
      </Card>
    );
  }

  if (mode === "pin") {
    return (
      <Card title={t("customer_info.change_pin")}>
        <PinForm />
      </Card>
    );
  }

  return (
    <Card title={t("customer_info.account_info")}>
      <ProfileForm />
    </Card>
  );
};

const ProfileModals = () => {
  const { t, emailConfirmOpen, setEmailConfirmOpen, recoverPinOpen, setRecoverPinOpen, confirmEmailUpdate, submitRecoverPin, isSubmitting } = useProfileContext();
  const [emailForm] = Form.useForm();
  const [recoverForm] = Form.useForm();

  return (
    <>
      <Modal
        title={t("login.password")}
        open={emailConfirmOpen}
        confirmLoading={isSubmitting}
        onCancel={() => setEmailConfirmOpen(false)}
        onOk={() => emailForm.submit()}
        okText={t("cartCheckout.confirm")}
        cancelText={t("button.cancel")}
      >
        <Form form={emailForm} layout="vertical" onFinish={(values) => confirmEmailUpdate(values.password)}>
          <Form.Item name="password" label={t("login.password")} rules={[{ required: true, message: t("login.password_error") }]}>
            <Input.Password autoFocus placeholder={t("login.password")} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={t("login.password")}
        open={recoverPinOpen}
        confirmLoading={isSubmitting}
        onCancel={() => setRecoverPinOpen(false)}
        onOk={() => recoverForm.submit()}
        okText={t("cartCheckout.confirm")}
        cancelText={t("button.cancel")}
      >
        <Form form={recoverForm} layout="vertical" onFinish={(values) => submitRecoverPin(values.password)}>
          <Form.Item name="password" label={t("login.password")} rules={[{ required: true, message: t("login.password_error") }]}>
            <Input.Password autoFocus placeholder={t("login.password")} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export const ProfileGobizView = ({ variant = "classic" }: ProfileGobizViewProps) => {
  const { token } = theme.useToken();
  const profilePage = useProfilePage();
  const { t, user, isLoading } = profilePage;

  if (isLoading) {
    return <Skeleton active avatar paragraph={{ rows: 10 }} />;
  }

  const compact = variant !== "classic";

  return (
    <ProfilePageContext.Provider value={profilePage}>
    <Space direction="vertical" size={token.marginLG} style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("customer_info.personal_info")}
      </Typography.Title>
      {variant === "summary" && (
        <Card>
          <Flex align="center" justify="space-between" wrap gap={token.marginMD}>
            <Space>
              <Avatar size={64} src={user.avatar} icon={<UserOutlined />} />
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {user.fullname || user.username || emptyText}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {[user.username, user.code].filter(Boolean).join(" | ") || emptyText}
                </Typography.Text>
              </div>
            </Space>
            <Typography.Text strong style={{ color: token.colorPrimary, fontSize: token.fontSizeHeading4 }}>
              {formatCurrency(user.balance)}
            </Typography.Text>
          </Flex>
        </Card>
      )}
      <Row gutter={[token.marginLG, token.marginLG]}>
        <Col xs={24} lg={compact ? 7 : 6}>
          <ProfileSidebar compact={compact} />
        </Col>
        <Col xs={24} lg={compact ? 17 : 18}>
          <Space direction="vertical" size={token.marginLG} style={{ width: "100%" }}>
          <ProfileVipLevelBox />
          <ProfileContent />
          </Space>
        </Col>
      </Row>
      <ProfileModals />
    </Space>
    </ProfilePageContext.Provider>
  );
};

export default ProfileGobizView;
