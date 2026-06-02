import {
  Alert,
  App,
  Avatar,
  Button,
  Card,
  Flex,
  Input,
  Modal,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import {
  useApplyDraftOrderCouponMutation,
  useCheckVoucherMutation,
} from "@repo/hooks";
import { useTranslation } from "@repo/i18n";
import dayjs from "dayjs";
import { useState } from "react";
import {
  getErrorTitle,
  sumDraftOrderCouponDiscount,
} from "../hooks/useCartCheckoutPage";

export const DraftOrderVoucherModal = ({
  open,
  draftOrderId,
  appliedVouchers,
  onApply,
  onClose,
}: {
  open: boolean;
  draftOrderId?: string;
  appliedVouchers: any[];
  onApply: (vouchers: any[]) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const { token } = theme.useToken();
  const [code, setCode] = useState("");
  const [voucher, setVoucher] = useState<any>(null);
  const [message, setMessage] = useState("");
  const checkVoucher = useCheckVoucherMutation();
  const applyCoupon = useApplyDraftOrderCouponMutation(draftOrderId);

  const reset = () => {
    setCode("");
    setVoucher(null);
    setMessage("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const checkCouponCode = async () => {
    const nextCode = code.trim();
    if (!nextCode) return;

    setVoucher(null);
    setMessage("");
    try {
      const result = await checkVoucher.mutateAsync({ code: nextCode });
      if (result?.code) {
        setVoucher(result);
      } else {
        setMessage(t("message.coupon_invalid_for_you"));
      }
    } catch (error: any) {
      setMessage(
        t(`message.${getErrorTitle(error) || "coupon_invalid_for_you"}`),
      );
    }
  };

  const submitCouponCode = async () => {
    if (!voucher?.code || !draftOrderId) return;

    try {
      const result = await applyCoupon.mutateAsync({
        couponCode: voucher.code,
      });
      const couponApply = {
        ...voucher,
        totalDiscountFee: sumDraftOrderCouponDiscount(result),
      };
      onApply(
        [...appliedVouchers, couponApply].filter(
          (item, index, list) =>
            list.findIndex((candidate) => candidate.code === item.code) ===
            index,
        ),
      );
      notification.success({ message: t("message.coupon_apply_success") });
      close();
    } catch (error: any) {
      notification.error({
        message: t(
          `message.${getErrorTitle(error) || "coupon_invalid_for_you"}`,
        ),
      });
    }
  };

  return (
    <Modal
      title={t("coupon.modalTitle")}
      open={open}
      width={660}
      centered
      okText={t("coupon.apply")}
      cancelText={t("button.cancel")}
      okButtonProps={{ disabled: !voucher }}
      confirmLoading={applyCoupon.isPending}
      onOk={submitCouponCode}
      onCancel={close}
    >
      <Space
        direction="vertical"
        size={token.marginMD}
        style={{ width: "100%" }}
      >
        <Card styles={{ body: { padding: token.paddingMD } }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Typography.Text>{t("coupon.inputVoucher")}</Typography.Text>
            <Flex gap={token.marginSM}>
              <Input
                value={code}
                allowClear
                placeholder={t("coupon.voucherCode")}
                onChange={(event) => {
                  setCode(event.target.value);
                  setVoucher(null);
                  setMessage("");
                }}
                onPressEnter={checkCouponCode}
              />
              <Button
                loading={checkVoucher.isPending}
                onClick={checkCouponCode}
              >
                {t("modal.confirm")}
              </Button>
            </Flex>
          </Space>
        </Card>

        {message && <Alert type="error" showIcon message={message} />}

        {voucher && (
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Flex justify="space-between" gap={token.marginSM}>
                <Space>
                  {voucher.image && <Avatar src={voucher.image} />}
                  <Space direction="vertical" size={0}>
                    <Typography.Text strong>{voucher.title}</Typography.Text>
                    <Typography.Text type="secondary">
                      {voucher.code}
                    </Typography.Text>
                  </Space>
                </Space>
                <Tag color="red">
                  {t("coupon.voucherRemaining", {
                    value: voucher.remaining,
                  })}
                </Tag>
              </Flex>
              {voucher.description && (
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  {voucher.description}
                </Typography.Paragraph>
              )}
              {voucher.customerLimit !== undefined && (
                <Typography.Text type="secondary">
                  {t("coupon.voucherCustomerLimit", {
                    value: voucher.customerLimit,
                  })}
                </Typography.Text>
              )}
              {voucher.validTo && (
                <Typography.Text type="secondary">
                  {t("coupon.voucherValidTo", {
                    value: dayjs(voucher.validTo).format("DD/MM/YYYY"),
                  })}
                </Typography.Text>
              )}
              {voucher.termsAndConditions && (
                <Typography.Paragraph
                  type="secondary"
                  style={{ maxHeight: 240, overflow: "auto", marginBottom: 0 }}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: voucher.termsAndConditions,
                    }}
                  />
                </Typography.Paragraph>
              )}
            </Space>
          </Card>
        )}
      </Space>
    </Modal>
  );
};
