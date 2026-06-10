import {
  Alert,
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
  Statistic,
  Typography,
  Upload,
  theme,
} from "antd";
import type { UploadProps } from "antd";
import {
  ArrowLeftOutlined,
  FileImageOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCreateClaimPage } from "@repo/hooks";
import { LocaleInputNumber } from "../../components/LocaleInputNumber";

const { Text, Title } = Typography;

export const CreateClaimStyleThanhla = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const logic = useCreateClaimPage();
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
  } = logic;

  const uploadProps: UploadProps = {
    accept: "image/*",
    className: "create-claim-image-upload",
    multiple: true,
    fileList,
    beforeUpload,
    onRemove: handleRemoveFile,
    onChange: ({ fileList: nextFileList }) =>
      setFileList(normalizeUploadFileList(nextFileList)),
  };
  const watchedOrderCode = Form.useWatch("orderCode", form);
  const watchedProductCode = Form.useWatch("productCode", form);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
      requiredMark={false}
    >
      <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
        <Flex align="center" justify="space-between" wrap gap={token.marginSM}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              {t("login.go_back")}
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              {t("ticket_add.create_claims")}
            </Title>
          </Space>
          <Checkbox
            checked={isShipment}
            onChange={(event) => handleShipmentChange(event.target.checked)}
          >
            {t("menu.shipments")}
          </Checkbox>
        </Flex>

        <Row gutter={[token.margin, token.margin]}>
          <Col xs={24} xl={17}>
            <Card title={t("ticket_add.order")}>
              <Row gutter={token.margin}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="orderCode"
                    label={t("ticket_add.order_code")}
                    rules={[{ required: true, message: t("message.required") }]}
                  >
                    <Input autoFocus placeholder={t("ticket_add.order_code_type")} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="productCode" label={t("ticket_add.product_code")}>
                    <Input
                      placeholder={t("ticket_add.product_code_type")}
                      onChange={resetReasonState}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={token.margin}>
                <Col xs={24} md={requiresMissingQuantity ? 12 : 24}>
                  <Form.Item
                    name="reasonCode"
                    label={t("ticket_add.claim_reason")}
                    rules={[{ required: true, message: t("message.claim_reason") }]}
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
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="notReceived"
                      label={t("ticket_add.missing_number")}
                      extra={t("ticket_add.entirely_missing")}
                      rules={[
                        { required: true, message: t("message.required") },
                        {
                          validator: (_, value) =>
                            Number(value || 0) > 9999
                              ? Promise.reject(new Error(t("ticket_add.missing_number_type")))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={9999}
                        controls={false}
                        style={{ width: "100%" }}
                        placeholder={t("ticket_add.missing_number_type")}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>

              <Form.Item
                name="description"
                label={`${t("ticket_add.descriptions")} ${t("ticket_add.description_required")}`}
                rules={[
                  { required: requiresDescription, message: t("message.required") },
                  { max: 1000, message: t("message.validate_characters") },
                ]}
              >
                <Input.TextArea
                  rows={8}
                  maxLength={1000}
                  showCount
                  placeholder={t("ticket_add.descriptions_type")}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} xl={7}>
            <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
              <Card>
                <Row gutter={token.margin}>
                  <Col span={12}>
                    <Statistic title={t("ticket_add.order_code")} value={watchedOrderCode || "---"} />
                  </Col>
                  <Col span={12}>
                    <Statistic title={t("ticket_add.product_code")} value={watchedProductCode || "---"} />
                  </Col>
                </Row>
              </Card>

              <Card title={t("ticket_add.solutions")}>
                <Form.Item
                  name="solutionCode"
                  label={t("ticket_add.solutions")}
                  rules={[{ required: true, message: t("message.solutions_select") }]}
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
                    rules={[{ required: true, message: t("message.required") }]}
                  >
                    <LocaleInputNumber
                      min={0}
                      max={9999999999}
                      controls={false}
                      maximumFractionDigits={0}
                      precision={0}
                      style={{ width: "100%" }}
                      placeholder={t("ticket_add.count_money_type")}
                    />
                  </Form.Item>
                )}

                <Form.Item
                  required={requiresAttachment}
                  validateStatus={requiresAttachment && fileList.length === 0 ? "error" : undefined}
                  help={requiresAttachment && fileList.length === 0 ? t("message.picture") : undefined}
                >
                  <Upload {...uploadProps} listType="picture-card">
                    <Space direction="vertical" size={4}>
                      <FileImageOutlined />
                      <Text>{t("ticket_add.upload")}</Text>
                    </Space>
                  </Upload>
                </Form.Item>

                <Alert
                  type="info"
                  showIcon
                  message={t("ticket_add.picture_size")}
                />
              </Card>
            </Space>
          </Col>
        </Row>

        <Flex justify="flex-end">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={createClaim.isPending}
          >
            {t("ticket_add.create_claims")}
          </Button>
        </Flex>
      </Space>
    </Form>
  );
};

export default CreateClaimStyleThanhla;
