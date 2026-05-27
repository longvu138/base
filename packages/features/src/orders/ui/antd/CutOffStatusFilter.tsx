import { Col, Form, InputNumber, Row, Select, Space } from "antd";

const HandlingTimeInput = ({
  typeSearch,
  t,
}: {
  typeSearch?: string;
  t: (key: string) => string;
}) => {
  if (!typeSearch || typeSearch === "range") {
    return (
      <Space.Compact style={{ width: "100%" }}>
        <Form.Item name="handlingTimeFrom" noStyle>
          <InputNumber
            style={{ width: "50%" }}
            placeholder={t("orders.filters.from")}
          />
        </Form.Item>
        <Form.Item name="handlingTimeTo" noStyle>
          <InputNumber
            style={{ width: "50%" }}
            placeholder={t("orders.filters.to")}
          />
        </Form.Item>
      </Space.Compact>
    );
  }

  if (typeSearch === "equal" || typeSearch === "from") {
    return (
      <Form.Item name="handlingTimeFrom" noStyle>
        <InputNumber
          style={{ width: "100%" }}
          placeholder={t("orders.filters.days")}
        />
      </Form.Item>
    );
  }

  return (
    <Form.Item name="handlingTimeTo" noStyle>
      <InputNumber
        style={{ width: "100%" }}
        placeholder={t("orders.filters.days")}
      />
    </Form.Item>
  );
};

export type CutOffStatusFilterProps = {
  form: any;
  statusData?: any[];
  t: (key: string) => string;
  typeSearch?: string;
};

export const CutOffStatusFilter = ({
  form,
  statusData,
  t,
  typeSearch,
}: CutOffStatusFilterProps) => (
  <Form.Item
    label={t("orders.filters.stuck_status")}
    style={{ marginBottom: 0, marginTop: 16 }}
  >
    <Row gutter={[10, 10]}>
      <Col xs={24} md={6}>
        <Form.Item name="cutOffStatus" noStyle>
          <Select
            allowClear
            showSearch
            placeholder={t("orders.filters.status")}
            optionFilterProp="label"
            options={statusData?.map((item: any) => ({
              label: item.name,
              value: item.code,
            }))}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={6}>
        <Form.Item name="typeSearch" noStyle>
          <Select
            allowClear
            placeholder={t("orders.filters.period")}
            onChange={() => {
              form.setFieldValue("handlingTimeFrom", undefined);
              form.setFieldValue("handlingTimeTo", undefined);
            }}
            options={[
              {
                label: t("orders.filters.cut_off_range"),
                value: "range",
              },
              {
                label: t("orders.filters.cut_off_equal"),
                value: "equal",
              },
              {
                label: t("orders.filters.cut_off_from"),
                value: "from",
              },
              {
                label: t("orders.filters.cut_off_to"),
                value: "to",
              },
            ]}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <HandlingTimeInput typeSearch={typeSearch} t={t} />
      </Col>
    </Row>
  </Form.Item>
);
