import {
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  Upload,
  theme,
} from "antd";
import type { UploadProps } from "antd";
import {
  ArrowLeftOutlined,
  InboxOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCreateClaimPage } from "@repo/hooks";

const { Text, Title } = Typography;

export const CreateClaimStyleDefault = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const {
    t,
    form,
    initialValues,
    isShipment,
    handleShipmentChange,
    reasonOptions,
    solutions,
    requiresMissingQuantity,
    requiresDescription,
    requiresAttachment,
    requiresSuggest,
    fileList,
    setFileList,
    normalizeUploadFileList,
    beforeUpload,
    handleRemoveFile,
    handleSubmit,
    createClaim,
    isLoading,
    resetReasonState,
  } = useCreateClaimPage();

  const uploadProps: UploadProps = {
    multiple: true,
    accept: "image/*",
    className: "create-claim-image-upload",
    listType: "picture-card",
    fileList,
    beforeUpload,
    onRemove: handleRemoveFile,
    onChange: ({ fileList: nextFileList }) => {
      setFileList(normalizeUploadFileList(nextFileList));
    },
  };

  return (
    <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ paddingInline: 0 }}
      >
        {t("login.go_back")}
      </Button>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Card>
          <Row gutter={[token.marginLG, token.marginLG]}>
            <Col xs={24} lg={16}>
              <Space
                direction="vertical"
                size={token.margin}
                style={{ width: "100%" }}
              >
                <Flex align="center" gap={token.marginSM} wrap>
                  <Title level={4} style={{ margin: 0 }}>
                    {t("ticket_add.create_claims")}
                  </Title>
                  <Checkbox
                    checked={isShipment}
                    onChange={(event) =>
                      handleShipmentChange(event.target.checked)
                    }
                  >
                    {t("menu.shipments")}
                  </Checkbox>
                </Flex>

                <Row gutter={[token.margin, token.marginSM]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="orderCode"
                      label={t("ticket_add.order_code")}
                      rules={[
                        { required: true, message: t("message.required") },
                      ]}
                    >
                      <Input
                        autoFocus
                        placeholder={t("ticket_add.order_code_type")}
                        onBlur={() =>
                          form
                            .validateFields(["orderCode"])
                            .catch(() => undefined)
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="productCode"
                      label={t("ticket_add.product_code")}
                    >
                      <Input
                        placeholder={t("ticket_add.product_code_type")}
                        onChange={() => resetReasonState()}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Card
                  size="small"
                  style={{
                    background: token.colorFillAlter,
                    borderColor: token.colorBorderSecondary,
                  }}
                >
                  <Row gutter={[token.margin, token.margin]}>
                    <Col xs={24} md={requiresMissingQuantity ? 8 : 12}>
                      <Form.Item
                        name="reasonCode"
                        label={t("ticket_add.claim_reason")}
                        rules={[
                          {
                            required: true,
                            message: t("message.claim_reason"),
                          },
                        ]}
                      >
                        <Select
                          loading={isLoading}
                          placeholder={t("ticket_add.claim_reason")}
                          options={reasonOptions.map((item: any) => ({
                            value: item.code,
                            label: item.name,
                          }))}
                        />
                      </Form.Item>
                    </Col>

                    {requiresMissingQuantity && (
                      <>
                        <Col xs={24} md={8}>
                          <Form.Item
                            name="notReceived"
                            label={t("ticket_add.missing_number")}
                            rules={[
                              {
                                required: true,
                                message: t("message.required"),
                              },
                              {
                                validator: (_, value) => {
                                  const numericValue = Number(
                                    String(value || "").replace(/\D/g, ""),
                                  );
                                  if (numericValue > 9999) {
                                    return Promise.reject(
                                      new Error(
                                        t("ticket_add.missing_number_type"),
                                      ),
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              max={9999}
                              style={{ width: "100%" }}
                              controls={false}
                              placeholder={t("ticket_add.missing_number_type")}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Flex align="center" style={{ height: "100%" }}>
                            <Text type="secondary">
                              {t("ticket_add.entirely_missing")}
                            </Text>
                          </Flex>
                        </Col>
                      </>
                    )}

                    <Col span={24}>
                      <Form.Item
                        name="description"
                        label={`${t("ticket_add.descriptions")} ${t("ticket_add.description_required")}`}
                        rules={[
                          {
                            required: requiresDescription,
                            message: t("message.required"),
                          },
                          {
                            max: 1000,
                            message: t("message.validate_characters"),
                          },
                        ]}
                      >
                        <Input.TextArea
                          rows={6}
                          maxLength={1000}
                          showCount
                          placeholder={t("ticket_add.descriptions_type")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Space>
            </Col>

            <Col xs={24} lg={8}>
              <Space
                direction="vertical"
                size={token.margin}
                style={{ width: "100%" }}
              >
                <Form.Item
                  name="solutionCode"
                  label={t("ticket_add.solutions")}
                  rules={[
                    { required: true, message: t("message.solutions_select") },
                  ]}
                >
                  <Select
                    loading={isLoading}
                    placeholder={t("ticket_add.solutions_select")}
                    options={solutions.map((item: any) => ({
                      value: item.code,
                      label: item.name,
                    }))}
                  />
                </Form.Item>

                {requiresSuggest && (
                  <Form.Item
                    name="suggest"
                    label={t("ticket_add.count_money")}
                    rules={[
                      { required: true, message: t("message.required") },
                      {
                        validator: (_, value) => {
                          const numericValue = Number(
                            String(value || "").replace(/\D/g, ""),
                          );
                          if (numericValue > 9999999999) {
                            return Promise.reject(
                              new Error(t("ticket_add.count_money_type")),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={9999999999}
                      controls={false}
                      style={{ width: "100%" }}
                      placeholder={t("ticket_add.count_money_type")}
                    />
                  </Form.Item>
                )}

                <Space
                  direction="vertical"
                  size={token.marginXS}
                  style={{ width: "100%" }}
                >
                  <Space direction="vertical" size={0}>
                    <Text strong>
                      {t("ticket_add.upload_picture")}{" "}
                      {t("ticket_add.product_error_require")}
                    </Text>
                    <Text type="secondary">
                      * {t("ticket_add.picture_size")}.
                    </Text>
                  </Space>

                  <Form.Item
                    required={requiresAttachment}
                    validateStatus={
                      requiresAttachment && fileList.length === 0
                        ? "error"
                        : undefined
                    }
                    help={
                      requiresAttachment && fileList.length === 0
                        ? `* ${t("message.picture")}`
                        : undefined
                    }
                  >
                    <Upload.Dragger {...uploadProps}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">
                        {t("ticket_add.upload")}
                      </p>
                      <p className="ant-upload-hint">
                        {t("ticket_add.photos_rule")}
                      </p>
                    </Upload.Dragger>
                  </Form.Item>
                </Space>
              </Space>
            </Col>
          </Row>

          <Flex justify="flex-end" style={{ marginTop: token.marginLG }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={createClaim.isPending}
            >
              {t("ticket_add.create_claims")}
            </Button>
          </Flex>
        </Card>
      </Form>
    </Space>
  );
};

export default CreateClaimStyleDefault;
