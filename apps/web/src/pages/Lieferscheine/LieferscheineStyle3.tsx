import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Space,
  theme,
} from "antd";
import { SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { useLieferscheinePage } from "./hooks/useLieferscheinePage";
import { LieferscheineList } from "./LieferscheineShared";

export const LieferscheineStyle3 = () => {
  const { token } = theme.useToken();
  const page = useLieferscheinePage();

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card>
        <Form form={page.form} layout="vertical">
          <Row gutter={[16, 12]} align="bottom">
            <Col xs={24} md={5}>
              <Form.Item name="query" label="Mã phiếu giao">
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Mã phiếu giao"
                  onPressEnter={page.handleSearch}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={5}>
              <Form.Item name="orderCode" label="Mã đơn">
                <Input
                  allowClear
                  placeholder="Mã đơn"
                  onPressEnter={page.handleSearch}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="issueDateFrom" label="Ngày tạo từ">
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="issueDateTo" label="Đến">
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="status" label="Trạng thái">
                <Select
                  allowClear
                  optionFilterProp="label"
                  options={page.statuses.map((item) => ({
                    label: item.label,
                    value: item.value,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={2}>
              <Flex gap={token.marginXS}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={page.handleSearch}
                />
                <Button icon={<SyncOutlined />} onClick={page.handleReset} />
              </Flex>
            </Col>
          </Row>
        </Form>
      </Card>

      <LieferscheineList page={page} />
    </Space>
  );
};

export default LieferscheineStyle3;
