import React, { useState, useEffect } from "react";
import { Modal, Space, Typography, Input } from "antd";

interface PinModalProps {
  open: boolean;
  confirmLoading: boolean;
  onConfirm: (secret: string) => void;
  onCancel: () => void;
  t: (key: string) => string;
}

export const PinModal: React.FC<PinModalProps> = ({
  open,
  confirmLoading,
  onConfirm,
  onCancel,
  t,
}) => {
  const [secret, setSecret] = useState("");

  useEffect(() => {
    if (!open) {
      setSecret("");
    }
  }, [open]);

  const handleOk = () => {
    onConfirm(secret);
  };

  return (
    <Modal
      title={t("modal.confirm_pin")}
      open={open}
      okText={t("cartCheckout.confirm")}
      cancelText={t("cartCheckout.cancel")}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Typography.Text>{t("cartCheckout.please_input_pin")}</Typography.Text>
        <Input.Password
          autoFocus
          value={secret}
          placeholder={t("shipments.input_pin")}
          onChange={(event) => setSecret(event.target.value)}
          onPressEnter={handleOk}
        />
        <Typography.Text type="secondary">{t("cartCheckout.default_pin")}</Typography.Text>
      </Space>
    </Modal>
  );
};
