import { Alert, Button, Flex, Input, Modal, Space, Typography, theme } from "antd";
import { orderDetailDateTime } from "../../domain/coupons";

export type CouponModalProps = {
  open: boolean;
  code: string;
  valid: boolean;
  validMessage?: string;
  validTo?: any;
  checking?: boolean;
  applying?: boolean;
  t: (key: string, options?: any) => string;
  onChangeCode: (value: string) => void;
  onCheck: () => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export const CouponModal = ({
  open,
  code,
  valid,
  validMessage,
  validTo,
  checking,
  applying,
  t,
  onChangeCode,
  onCheck,
  onSubmit,
  onCancel,
}: CouponModalProps) => {
  const { token } = theme.useToken();

  return (
    <Modal
      title={t("coupon.modalTitle")}
      open={open}
      footer={null}
      width={600}
      onCancel={onCancel}
    >
      <Space
        direction="vertical"
        size={token.marginMD}
        style={{ width: "100%" }}
      >
        <Typography.Text>{t("coupon.inputVoucher")}</Typography.Text>
        <Input.Search
          value={code}
          placeholder={t("message.enter_coupon")}
          enterButton={t("button.check")}
          loading={checking}
          onChange={(event) => onChangeCode(event.target.value)}
          onSearch={onCheck}
        />
        {validTo && (
          <Alert
            type="success"
            showIcon
            message={t("coupon.voucherValidTo", {
              value: orderDetailDateTime(validTo),
            })}
          />
        )}
        {validMessage && (
          <Alert
            type={valid ? "success" : "error"}
            showIcon
            message={validMessage}
          />
        )}
        <Flex justify="end" gap={token.marginSM}>
          <Button onClick={onCancel}>{t("button.cancel")}</Button>
          <Button
            type="primary"
            disabled={!valid}
            loading={applying}
            onClick={onSubmit}
          >
            {t("button.use")}
          </Button>
        </Flex>
      </Space>
    </Modal>
  );
};

