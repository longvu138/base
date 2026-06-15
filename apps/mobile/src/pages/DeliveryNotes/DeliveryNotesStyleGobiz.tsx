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
import { useDeliveryNotesMobilePage } from "@repo/hooks";
import { DeliveryNotesList } from "./DeliveryNotesShared";
import MobileFilterPanel from "../../components/MobileFilterPanel";

export const DeliveryNotesStyleGobiz = ({ isTabView }: { isTabView?: boolean }) => {
  const { token } = theme.useToken();
  const page = useDeliveryNotesMobilePage();
  const rows = page.listData?.data || [];
  const total = page.listData?.total || 0;
  const totalWeight = rows.reduce(
    (sum: number, item: any) => sum + Number(item?.delivery_note?.total_weight || 0),
    0,
  );
  const totalCollect = rows.reduce(
    (sum: number, item: any) => sum + Number(item?.delivery_note?.amount_collect || 0),
    0,
  );

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

      <MobileFilterPanel
          className="mb-4 shadow-sm"
          form={page.form}
          onSearch={page.handleSearch}
          onReset={page.handleReset}
          searchText="Tìm kiếm"
          resetText="Làm mới"
          primaryContent={
                <Form.Item name="code" label="Mã phiếu xuất" style={{ marginBottom: 0 }}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder="Mã phiếu xuất"
                    onPressEnter={page.handleSearch}
                  />
                </Form.Item>
          }
          secondaryContent={
            <Row gutter={[16, 12]}>
              <Col xs={24} md={12}>
                <Form.Item name="exportedAtFrom" label="Ngày bắt đầu" style={{ marginBottom: 0 }}>
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="exportedAtTo" label="Ngày kết thúc" style={{ marginBottom: 0 }}>
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>
          }
        />

      <DeliveryNotesList page={page} compactHeader={isTabView} />
    </Space>
  );
};

export const DeliveryNoteStyleGobiz = DeliveryNotesStyleGobiz;

export default DeliveryNotesStyleGobiz;
