import {
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
  theme,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { moneyFormat, quantityFormat } from "@repo/util";
import { FilterPanel } from "@repo/ui";
import {
  getDeliveryNotePageTotals,
  useDeliveryNotesMobileModel,
} from "@repo/features/delivery-notes";
import { DeliveryNotesList } from "./DeliveryNotesShared";

export const DeliveryNotesStyleGobiz = ({ isTabView }: { isTabView?: boolean }) => {
  const { token } = theme.useToken();
  const page = useDeliveryNotesMobileModel();
  const rows = page.listData?.data || [];
  const total = page.listData?.total || 0;
  const { totalWeight, totalCollect } = getDeliveryNotePageTotals(rows);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {!isTabView && (
        <Card>
          <Flex justify="space-between" align="center" wrap gap={token.marginMD}>
            <Space size="small" align="center">
              <Typography.Title level={3} style={{ margin: 0 }}>
                Phiếu xuất
              </Typography.Title>
              <Tag color="blue">{quantityFormat(total)}</Tag>
            </Space>
            <Space wrap>
              <Statistic title="Tiền cần thu trong trang" value={moneyFormat(totalCollect)} />
              <Statistic title="Cân nặng trong trang" value={`${quantityFormat(totalWeight)} kg`} />
            </Space>
          </Flex>
        </Card>
      )}

      <Card className="mb-4 shadow-sm">
        <FilterPanel
          form={page.form}
          onSearch={page.handleSearch}
          onReset={page.handleReset}
          searchText="Tìm kiếm"
          resetText="Làm mới"
          primaryContent={
            <Row gutter={[16, 12]} align="bottom">
              <Col xs={24} md={8}>
                <Form.Item name="code" label="Mã phiếu xuất" style={{ marginBottom: 0 }}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder="Mã phiếu xuất"
                    onPressEnter={page.handleSearch}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="exportedAtFrom" label="Ngày bắt đầu" style={{ marginBottom: 0 }}>
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="exportedAtTo" label="Ngày kết thúc" style={{ marginBottom: 0 }}>
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
          }
        />
      </Card>

      <DeliveryNotesList page={page} compactHeader={isTabView} />
    </Space>
  );
};

export const DeliveryNoteStyleGobiz = DeliveryNotesStyleGobiz;

export default DeliveryNotesStyleGobiz;
