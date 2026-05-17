import {
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Space,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FilterPanel } from "@repo/ui";
import { useLieferscheinePage } from "./hooks/useLieferscheinePage";
import { LieferscheineList } from "./LieferscheineShared";

export const LieferscheineStyle3 = () => {
  const page = useLieferscheinePage();

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card className="mb-4 shadow-sm">
        <FilterPanel
          form={page.form}
          onSearch={page.handleSearch}
          onReset={page.handleReset}
          searchText="Tìm kiếm"
          resetText="Làm mới"
          primaryContent={
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Form.Item name="status" label="Trạng thái" style={{ marginBottom: 0 }}>
                <Checkbox.Group>
                  <Space wrap>
                    {page.statuses.map((item) => (
                      <Checkbox key={item.value} value={item.value}>
                        {item.label}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              </Form.Item>

              <Row gutter={[16, 12]} align="bottom">
                <Col xs={24} md={6}>
                  <Form.Item name="query" label="Mã phiếu giao" style={{ marginBottom: 0 }}>
                    <Input
                      allowClear
                      prefix={<SearchOutlined />}
                      placeholder="Mã phiếu giao"
                      onPressEnter={page.handleSearch}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="orderCode" label="Mã đơn" style={{ marginBottom: 0 }}>
                    <Input
                      allowClear
                      placeholder="Mã đơn"
                      onPressEnter={page.handleSearch}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="issueDateFrom" label="Ngày tạo từ" style={{ marginBottom: 0 }}>
                    <DatePicker
                      showTime={{ format: "HH:mm" }}
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY HH:mm"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item name="issueDateTo" label="Đến" style={{ marginBottom: 0 }}>
                    <DatePicker
                      showTime={{ format: "HH:mm" }}
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY HH:mm"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Space>
          }
        />
      </Card>

      <LieferscheineList page={page} />
    </Space>
  );
};

export default LieferscheineStyle3;
