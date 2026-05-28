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
  Tabs,
  Tag,
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

export const CreateClaimStyleGobiz = () => {
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
    beforeUpload,
    handleRemoveFile,
    handleSubmit,
    createClaim,
    isLoading,
    resetReasonState,
  } = useCreateClaimPage();

  const watchedOrderCode = Form.useWatch("orderCode", form);
  const watchedProductCode = Form.useWatch("productCode", form);
  const watchedReasonCode = Form.useWatch("reasonCode", form);
  const watchedSolutionCode = Form.useWatch("solutionCode", form);

  const uploadProps: UploadProps = {
    accept: "image/*",
    multiple: true,
    fileList,
    beforeUpload,
    onRemove: handleRemoveFile,
    onChange: ({ fileList: nextFileList }) => setFileList(nextFileList.slice(0, 10)),
  };

  const orderPane = (
    <Row gutter={[token.margin, token.margin]}>
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
          <Input placeholder={t("ticket_add.product_code_type")} onChange={resetReasonState} />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Alert
          type="info"
          showIcon
          message={t("ticket_add.claim_reason")}
          description={t("ticket_add.describe")}
        />
      </Col>
    </Row>
  );

  const reasonPane = (
    <Row gutter={[token.margin, token.margin]}>
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
      <Col span={24}>
        <Form.Item
          name="description"
          label={`${t("ticket_add.descriptions")} ${t("ticket_add.description_required")}`}
          rules={[
            { required: requiresDescription, message: t("message.required") },
            { max: 1000, message: t("message.validate_characters") },
          ]}
        >
          <Input.TextArea
            rows={7}
            maxLength={1000}
            showCount
            placeholder={t("ticket_add.descriptions_type")}
          />
        </Form.Item>
      </Col>
    </Row>
  );

  const solutionPane = (
    <Row gutter={[token.margin, token.margin]}>
      <Col xs={24} md={12}>
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
      </Col>
      {requiresSuggest && (
        <Col xs={24} md={12}>
          <Form.Item
            name="suggest"
            label={t("ticket_add.count_money")}
            rules={[{ required: true, message: t("message.required") }]}
          >
            <InputNumber
              min={0}
              max={9999999999}
              controls={false}
              style={{ width: "100%" }}
              placeholder={t("ticket_add.count_money_type")}
            />
          </Form.Item>
        </Col>
      )}
      <Col span={24}>
        <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
          <Text strong>
            {t("ticket_add.upload_picture")} {t("ticket_add.product_error_require")}
          </Text>
          <Form.Item
            required={requiresAttachment}
            validateStatus={requiresAttachment && fileList.length === 0 ? "error" : undefined}
            help={requiresAttachment && fileList.length === 0 ? `* ${t("message.picture")}` : undefined}
          >
            <Upload.Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{t("ticket_add.upload")}</p>
              <p className="ant-upload-hint">{t("ticket_add.photos_rule")}</p>
            </Upload.Dragger>
          </Form.Item>
        </Space>
      </Col>
    </Row>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
      requiredMark={false}
    >
      <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
        <Card>
          <Flex align="center" justify="space-between" wrap gap={token.marginSM}>
            <Space>
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
              <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>
                  {t("ticket_add.create_claims")}
                </Title>
                <Text type="secondary">{t("ticket_add.picture_size")}</Text>
              </Space>
            </Space>
            <Space wrap>
              <Checkbox
                checked={isShipment}
                onChange={(event) => handleShipmentChange(event.target.checked)}
              >
                {t("menu.shipments")}
              </Checkbox>
              {watchedOrderCode && <Tag color="processing">{watchedOrderCode}</Tag>}
              {watchedProductCode && <Tag>{watchedProductCode}</Tag>}
            </Space>
          </Flex>
        </Card>

        <Row gutter={[token.margin, token.margin]}>
          <Col xs={24} lg={17}>
            <Card>
              <Tabs
                items={[
                  {
                    key: "order",
                    label: t("ticket_add.order"),
                    children: orderPane,
                  },
                  {
                    key: "reason",
                    label: t("ticket_add.claim_reason"),
                    children: reasonPane,
                  },
                  {
                    key: "solution",
                    label: t("ticket_add.solutions"),
                    children: solutionPane,
                  },
                ]}
              />
            </Card>
          </Col>

          <Col xs={24} lg={7}>
            <Card title={t("ticket_add.create_claims")}>
              <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
                <Flex justify="space-between" gap={token.marginSM}>
                  <Text type="secondary">{t("ticket_add.order_code")}</Text>
                  <Text strong>{watchedOrderCode || "---"}</Text>
                </Flex>
                <Flex justify="space-between" gap={token.marginSM}>
                  <Text type="secondary">{t("ticket_add.product_code")}</Text>
                  <Text strong>{watchedProductCode || "---"}</Text>
                </Flex>
                <Flex justify="space-between" gap={token.marginSM}>
                  <Text type="secondary">{t("ticket_add.claim_reason")}</Text>
                  <Text strong>{watchedReasonCode || "---"}</Text>
                </Flex>
                <Flex justify="space-between" gap={token.marginSM}>
                  <Text type="secondary">{t("ticket_add.solutions")}</Text>
                  <Text strong>{watchedSolutionCode || "---"}</Text>
                </Flex>
                <Flex justify="space-between" gap={token.marginSM}>
                  <Text type="secondary">{t("ticket_add.upload_picture")}</Text>
                  <Text strong>{fileList.length}/10</Text>
                </Flex>
                <Button
                  type="primary"
                  block
                  htmlType="submit"
                  icon={<SendOutlined />}
                  loading={createClaim.isPending}
                >
                  {t("ticket_add.create_claims")}
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </Form>
  );
};

export default CreateClaimStyleGobiz;
