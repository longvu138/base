import { createContext, useContext, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Menu,
  Modal,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  ArrowRightOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { moneyCeil, moneyFormat } from "@repo/util";
import {
  useCustomerDiscountQuery,
  useCustomerLevelsQuery,
  useFeesQuery,
} from "@repo/hooks";
import { useProfilePage } from "./hooks/useProfilePage";
import { ProfileAccountInfo } from "./components/ProfileAccountInfo";
import { ProfileAddressContent as ProfileAddressSection } from "./components/ProfileAddressContent";
import { ProfileTransactionsContent } from "./components/ProfileTransactionsContent";
import { ProfileNotificationSettingsContent } from "./components/ProfileNotificationSettingsContent";
import { ProfileFaqsContent } from "./components/ProfileFaqsContent";
import { ProfileVouchersContent } from "./components/ProfileVouchersContent";
import { ProfileVipLevelsContent } from "./components/ProfileVipLevelsContent";
import { ProfilePurchasingAccountContent } from "./components/ProfilePurchasingAccountContent";
import { ProfileTelegramContent } from "./components/ProfileTelegramContent";
import { ProfileSavedProductsContent } from "./components/ProfileSavedProductsContent";

type ProfileGobizViewProps = {
  variant?: "classic" | "compact" | "summary";
};

const emptyText = "---";

const quantityFormat = (value?: number) => Number(value || 0).toLocaleString();

const levelImageStyle = {
  maxHeight: 76,
  maxWidth: 76,
  objectFit: "contain" as const,
  filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.14))",
};

const vipLevelCardMinHeight = 172;

type ProfilePageLogic = ReturnType<typeof useProfilePage>;

const ProfilePageContext = createContext<ProfilePageLogic | null>(null);

const useProfileContext = () => {
  const context = useContext(ProfilePageContext);
  if (!context) {
    throw new Error("ProfilePageContext is missing");
  }
  return context;
};

const ProfileSidebar = () => {
  const { token } = theme.useToken();
  const location = useLocation();
  const { t, user, menuItems, showVipLevelBox, mode, setMode } =
    useProfileContext();
  const selectedKey =
    mode === "address"
      ? "/address"
      : mode === "transactions"
        ? "/transactions"
        : mode === "notifications"
          ? "/notifications"
          : mode === "faqs"
            ? "/faqs"
            : mode === "vouchers"
              ? "/vouchers"
              : mode === "vip-levels"
                ? "/profile/vip-levels"
                : mode === "purchasing-account"
                  ? "/profile/purchasing-account"
                  : mode === "telegram"
                    ? "/profile/telegram"
                    : mode === "saved-products"
                      ? "/profile/products"
                      : location.pathname;

  return (
    <Card
      bordered={false}
      styles={{
        body: {
          padding: `${token.paddingXL}px 0 ${token.paddingSM}px`,
          position: "relative",
        },
      }}
      style={{ boxShadow: token.boxShadowTertiary }}
    >
      <div className="flex items-center justify-center mb-4">
        <Avatar
          size={80}
          src={user.avatar}
          icon={<UserOutlined />}
          style={{
            background: token.colorFillSecondary,
            border: `2px solid ${token.colorWhite}`,
            boxShadow: token.boxShadowSecondary,
          }}
        />
      </div>

      <Space
        direction="vertical"
        size={token.marginXXS}
        style={{ width: "100%" }}
      >
        <Typography.Title
          level={4}
          style={{
            margin: 0,
            paddingInline: token.paddingMD,
            textAlign: "center",
            wordBreak: "break-word",
          }}
        >
          {user.fullname || user.username || emptyText}
        </Typography.Title>
        <Typography.Paragraph
          type="secondary"
          style={{
            marginBottom: showVipLevelBox ? token.marginXS : token.marginMD,
            paddingInline: token.paddingMD,
            textAlign: "center",
            wordBreak: "break-word",
          }}
        >
          {[user.username, user.code].filter(Boolean).join(" | ") || emptyText}
        </Typography.Paragraph>
        {showVipLevelBox && (
          <Flex
            justify="center"
            style={{
              marginBottom: token.marginMD,
              paddingInline: token.paddingMD,
            }}
          >
            <Tag
              color="gold"
              style={{
                marginInlineEnd: 0,
                whiteSpace: "normal",
                textAlign: "center",
              }}
            >
              {user.customerLevel?.name || t("orderDetail.no_level_yet")} |{" "}
              {user.rewardPoint.toLocaleString()} {t("customer_info.point_2")}
            </Tag>
          </Flex>
        )}
      </Space>

      <Menu
        mode="inline"
        onClick={({ key }) => {
          if (key === "/address") {
            setMode("address");
          } else if (key === "/transactions") {
            setMode("transactions");
          } else if (key === "/notifications") {
            setMode("notifications");
          } else if (key === "/faqs") {
            setMode("faqs");
          } else if (key === "/vouchers") {
            setMode("vouchers");
          } else if (key === "/profile/vip-levels") {
            setMode("vip-levels");
          } else if (key === "/profile/purchasing-account") {
            setMode("purchasing-account");
          } else if (key === "/profile/telegram") {
            setMode("telegram");
          } else if (key === "/profile/products") {
            setMode("saved-products");
          } else if (key === "/profile") {
            setMode("profile");
          }
        }}
        selectedKeys={[selectedKey]}
        style={{ borderInlineEnd: 0 }}
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: (
            <span style={{ position: "relative", display: "block" }}>
              {item.key === "/address" ||
              item.key === "/transactions" ||
              item.key === "/notifications" ||
              item.key === "/faqs" ||
              item.key === "/vouchers" ||
              item.key === "/profile/vip-levels" ||
              item.key === "/profile/purchasing-account" ||
              item.key === "/profile/telegram" ||
              item.key === "/profile/products" ? (
                item.label
              ) : (
                <Link to={item.key}>{item.label}</Link>
              )}
              {selectedKey === item.key && (
                <span
                  style={{
                    position: "absolute",
                    top: -token.paddingXS,
                    right: -token.paddingLG,
                    bottom: -token.paddingXS,
                    width: 3,
                    background: token.colorPrimary,
                  }}
                />
              )}
            </span>
          ),
        }))}
      />
    </Card>
  );
};

const ProfileVipLevelBox = () => {
  const { token } = theme.useToken();
  const { t, user, showVipLevelBox } = useProfileContext();
  const [open, setOpen] = useState(false);
  const { data: levels = [], isLoading: isLevelsLoading } =
    useCustomerLevelsQuery(showVipLevelBox);
  const { data: discounts = {}, isLoading: isDiscountLoading } =
    useCustomerDiscountQuery(showVipLevelBox);
  const { data: fees = [], isLoading: isFeesLoading } =
    useFeesQuery(showVipLevelBox);

  if (!showVipLevelBox) return null;
  if (isLevelsLoading) return <Skeleton active paragraph={{ rows: 2 }} />;
  if (!levels.length) return null;

  const currentLevel = user.customerLevel;
  const currentIndex = currentLevel
    ? levels.findIndex((item: any) => item.id === currentLevel.id)
    : -1;
  const nextLevel =
    levels[currentIndex + 1] || (!currentLevel ? levels[0] : undefined);
  const highestLevel = !!currentLevel && !nextLevel;
  const progressPercent = nextLevel?.minPoint
    ? Math.min(
        (Number(user.rewardPoint || 0) * 100) / Number(nextLevel.minPoint || 1),
        100,
      )
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

  const rightLevel = highestLevel ? currentLevel : nextLevel;
  const remainingPoint = nextLevel?.minPoint
    ? Math.max(
        Number(nextLevel.minPoint || 0) - Number(user.rewardPoint || 0),
        0,
      )
    : 0;
  const progressStatus = highestLevel ? "success" : "active";
  const renderLevelMedal = (level: any, label: string, tag?: string) => (
    <Card
      size="small"
      bordered={false}
      styles={{ body: { padding: token.paddingMD } }}
      style={{
        height: "100%",
        background: token.colorBgContainer,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <Flex
        vertical
        align="center"
        justify="center"
        gap={token.marginXS}
        style={{ minHeight: vipLevelCardMinHeight }}
      >
        {tag && (
          <Tag
            color={tag === "current" ? "blue" : "gold"}
            style={{ marginInlineEnd: 0 }}
          >
            {tag === "current" ? label : t("customer_info.max_level")}
          </Tag>
        )}
        {level?.imageUrl ? (
          <img src={level.imageUrl} alt="" style={levelImageStyle} />
        ) : (
          <Avatar
            size={76}
            icon={<TrophyOutlined />}
            style={{
              background: tag === "next" ? token.gold6 : token.colorPrimary,
              color: token.colorWhite,
            }}
          />
        )}
        <Typography.Text strong style={{ textAlign: "center" }}>
          {label}
        </Typography.Text>
      </Flex>
    </Card>
  );

  return (
    <>
      <Card
        bordered={false}
        styles={{ body: { padding: token.paddingLG } }}
        style={{
          background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorFillQuaternary} 58%, #fff7e6 100%)`,
          overflow: "hidden",
          boxShadow: token.boxShadowTertiary,
        }}
      >
        <Flex
          justify="space-between"
          align="center"
          wrap
          gap={token.marginMD}
          style={{ marginBottom: token.marginMD }}
        >
          <Space size={token.marginSM}>
            <Avatar
              icon={<TrophyOutlined />}
              style={{ background: token.gold6, color: token.colorWhite }}
            />
            <div>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {currentLevel?.name || t("orderDetail.no_level_yet")}
              </Typography.Title>
              <Typography.Text type="secondary">
                {t("customer_info.updated_level")}
              </Typography.Text>
            </div>
          </Space>
          <Button
            type="primary"
            ghost
            icon={<InfoCircleOutlined />}
            onClick={() => setOpen(true)}
          >
            {t("customer_info.detail")}
          </Button>
        </Flex>

        <Row gutter={[token.marginMD, token.marginMD]} align="stretch">
          <Col xs={24} md={6}>
            {renderLevelMedal(
              currentLevel,
              currentLevel?.name || t("orderDetail.no_level_yet"),
              "current",
            )}
          </Col>
          <Col xs={24} md={12}>
            <Card
              size="small"
              bordered={false}
              styles={{
                body: {
                  alignItems: "center",
                  display: "flex",
                  minHeight: vipLevelCardMinHeight,
                  padding: token.paddingLG,
                  width: "100%",
                },
              }}
              style={{ height: "100%", width: "100%" }}
            >
              <Space
                direction="vertical"
                size={token.marginSM}
                style={{ width: "100%" }}
              >
                {highestLevel ? (
                  <Flex vertical align="center" gap={token.marginXS}>
                    <TrophyOutlined
                      style={{
                        color: token.gold6,
                        fontSize: token.fontSizeHeading2,
                      }}
                    />
                    <Typography.Title
                      level={4}
                      style={{ margin: 0, textAlign: "center" }}
                    >
                      {t("customer_info.congratulation_on_highest_level")}
                    </Typography.Title>
                    <Tag color="gold" style={{ marginInlineEnd: 0 }}>
                      {t("customer_info.max_level")}
                    </Tag>
                  </Flex>
                ) : (
                  <>
                    <Flex
                      justify="space-between"
                      align="start"
                      wrap
                      gap={token.marginSM}
                    >
                      <Statistic
                        title={t("customer_info.point_2")}
                        value={user.rewardPoint}
                        formatter={(value) => quantityFormat(Number(value))}
                      />
                      <Space direction="vertical" size={0} align="end">
                        <Typography.Text type="secondary">
                          {nextLevel?.name || t("customer_info.max_level")}
                        </Typography.Text>
                        <Typography.Text strong>
                          {quantityFormat(nextLevel?.minPoint)}
                        </Typography.Text>
                      </Space>
                    </Flex>
                    <Progress
                      percent={progressPercent}
                      status={progressStatus}
                      strokeColor={token.gold6}
                      format={() => `${Math.round(progressPercent)}%`}
                    />
                    <Flex
                      justify="space-between"
                      align="center"
                      wrap
                      gap={token.marginXS}
                    >
                      <Typography.Text type="secondary">
                        {currentLevel?.name || t("orderDetail.no_level_yet")}
                      </Typography.Text>
                      <Space size={token.marginXS}>
                        <Typography.Text type="secondary">
                          {quantityFormat(remainingPoint)}{" "}
                          {t("customer_info.point_2")}
                        </Typography.Text>
                        <ArrowRightOutlined
                          style={{ color: token.colorTextTertiary }}
                        />
                        <Typography.Text strong>
                          {nextLevel?.name}
                        </Typography.Text>
                      </Space>
                    </Flex>
                  </>
                )}
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            {renderLevelMedal(
              rightLevel,
              highestLevel
                ? t("customer_info.max_level")
                : nextLevel?.name || t("customer_info.max_level"),
              highestLevel ? "next" : undefined,
            )}
          </Col>
        </Row>
      </Card>

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
              ? [
                  {
                    title: currentLevel.name,
                    dataIndex: "current",
                    align: "right" as const,
                  },
                ]
              : []),
            ...(nextLevel
              ? [
                  {
                    title: nextLevel.name,
                    dataIndex: "next",
                    align: "right" as const,
                  },
                ]
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

const getDiscountValue = (
  discounts: any[] = [],
  level: any,
  feeCode?: string,
) => {
  if (!level || !feeCode) return emptyText;
  const discount = discounts.find(
    (item) => item.customerLevelId === level.id && item.feeCode === feeCode,
  );
  if (!discount) return emptyText;
  return discount.discountType === "PERCENT"
    ? `${quantityFormat(discount.discountValue)}%`
    : moneyFormat(moneyCeil(discount.discountValue));
};

const PasswordForm = () => {
  const { t, isSubmitting, submitPassword, setMode } = useProfileContext();
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={submitPassword}
      style={{ maxWidth: 520 }}
    >
      <Form.Item
        name="currentPassword"
        label={t("customer_info.current_pass")}
        rules={[{ required: true, message: t("customer_info.not_empty_pass") }]}
      >
        <Input.Password placeholder={t("customer_info.input_current_pass")} />
      </Form.Item>
      <Form.Item
        name="newPassword"
        label={t("customer_info.new_pass")}
        rules={[
          { required: true, message: t("customer_info.not_empty_newPass") },
          {
            min: 6,
            max: 32,
            message: t("customer_info.require_characters_length"),
          },
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
              if (!value || getFieldValue("newPassword") === value)
                return Promise.resolve();
              return Promise.reject(
                new Error(t("customer_info.not_match_pass")),
              );
            },
          }),
        ]}
      >
        <Input.Password
          placeholder={t("customer_info.please_retype_newPass")}
        />
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
    <Form
      form={form}
      layout="vertical"
      onFinish={submitPin}
      style={{ maxWidth: 520 }}
    >
      <Form.Item
        name="currentPIN"
        label={t("customer_info.old_pin")}
        rules={[{ required: true, message: t("customer_info.input_old_pin") }]}
      >
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
              if (!value || getFieldValue("newPIN") === value)
                return Promise.resolve();
              return Promise.reject(
                new Error(t("customer_info.not_match_pin")),
              );
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

const ProfileContent = ({
  variant,
}: {
  variant: "classic" | "compact" | "summary";
}) => {
  const {
    t,
    mode,
    user,
    isSubmitting,
    updateField,
    requestEmailUpdate,
    setMode,
    setRecoverPinOpen,
  } = useProfileContext();

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

  if (mode === "address") {
    return <ProfileAddressSection t={t} variant={variant} />;
  }

  if (mode === "transactions") {
    return <ProfileTransactionsContent t={t} variant={variant} />;
  }

  if (mode === "notifications") {
    return <ProfileNotificationSettingsContent t={t} />;
  }

  if (mode === "faqs") {
    return <ProfileFaqsContent t={t} />;
  }

  if (mode === "vouchers") {
    return <ProfileVouchersContent t={t} />;
  }

  if (mode === "vip-levels") {
    return (
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <ProfileVipLevelBox />
        <ProfileVipLevelsContent t={t} />
      </Space>
    );
  }

  if (mode === "purchasing-account") {
    return <ProfilePurchasingAccountContent t={t} />;
  }

  if (mode === "telegram") {
    return <ProfileTelegramContent t={t} />;
  }

  if (mode === "saved-products") {
    return <ProfileSavedProductsContent t={t} />;
  }

  return (
    <Card title={t("customer_info.account_info")}>
      <ProfileAccountInfo
        t={t}
        user={user}
        isSubmitting={isSubmitting}
        variant={variant}
        updateField={updateField}
        requestEmailUpdate={requestEmailUpdate}
        setMode={setMode}
        setRecoverPinOpen={setRecoverPinOpen}
      />
    </Card>
  );
};

const ProfileModals = () => {
  const {
    t,
    emailConfirmOpen,
    setEmailConfirmOpen,
    recoverPinOpen,
    setRecoverPinOpen,
    confirmEmailUpdate,
    submitRecoverPin,
    isSubmitting,
  } = useProfileContext();
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
        <Form
          form={emailForm}
          layout="vertical"
          onFinish={(values) => confirmEmailUpdate(values.password)}
        >
          <Form.Item
            name="password"
            label={t("login.password")}
            rules={[{ required: true, message: t("login.password_error") }]}
          >
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
        <Form
          form={recoverForm}
          layout="vertical"
          onFinish={(values) => submitRecoverPin(values.password)}
        >
          <Form.Item
            name="password"
            label={t("login.password")}
            rules={[{ required: true, message: t("login.password_error") }]}
          >
            <Input.Password autoFocus placeholder={t("login.password")} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export const ProfileGobizView = ({
  variant = "classic",
}: ProfileGobizViewProps) => {
  const { token } = theme.useToken();
  const profilePage = useProfilePage();
  const { t, isLoading, mode } = profilePage;

  if (isLoading) {
    return <Skeleton active avatar paragraph={{ rows: 10 }} />;
  }

  const compact = variant !== "classic";

  return (
    <ProfilePageContext.Provider value={profilePage}>
      <Space
        direction="vertical"
        size={token.marginLG}
        style={{ width: "100%" }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t("customer_info.personal_info")}
        </Typography.Title>

        <Row gutter={[token.marginLG, token.marginLG]}>
          <Col xs={24} lg={compact ? 7 : 6}>
            <ProfileSidebar />
          </Col>
          <Col xs={24} lg={compact ? 17 : 18}>
            <Space
              direction="vertical"
              size={token.marginLG}
              style={{ width: "100%" }}
            >
              {mode === "profile" && <ProfileVipLevelBox />}
              <ProfileContent variant={variant} />
            </Space>
          </Col>
        </Row>
        <ProfileModals />
      </Space>
    </ProfilePageContext.Provider>
  );
};

export default ProfileGobizView;
