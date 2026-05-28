import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  List,
  Row,
  Select,
  Skeleton,
  Space,
  Tag,
  Timeline,
  Typography,
  theme,
} from 'antd';
import { BarcodeOutlined, DownloadOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { FilterPanel, PinModal } from '@repo/ui';
import { quantityFormat } from '@repo/util';
import {
  usePackageMilestonesQuery,
  usePackagesMobilePage,
  useParcelMilestonesQuery,
} from '@repo/hooks';

const { Paragraph, Text, Link } = Typography;

type PackagesPageState = ReturnType<typeof usePackagesMobilePage>;

const formatPackageDate = (value?: string) =>
  value ? dayjs(value).format('HH:mm DD/MM/YYYY') : '---';

const formatCm = (value: number | string | null | undefined) =>
  `${quantityFormat(Number(value || 0))} cm`;

const formatCm3 = (value: number | string | null | undefined) =>
  value ? `${quantityFormat(Number(value))} cm3` : 'Chưa xác định';

const formatKg = (value: number | string | null | undefined) =>
  value ? `${quantityFormat(Number(value))} kg` : '---';

const getStatusMeta = (status: any, statusData: any[] = []) => {
  const code = typeof status === 'object' ? status?.code : status;
  const fallbackName = typeof status === 'object' ? status?.name : status;
  const found = statusData.find((item) => item.code === code);

  return {
    code,
    name: found?.name || fallbackName || '---',
    color: found?.color,
  };
};

const HandlingTimeInput = ({ typeSearch }: { typeSearch?: string }) => {
  if (!typeSearch || typeSearch === 'range') {
    return (
      <Space.Compact style={{ width: '100%' }}>
        <Form.Item name="handlingTimeFrom" noStyle>
          <InputNumber style={{ width: '50%' }} placeholder="Từ" />
        </Form.Item>
        <Form.Item name="handlingTimeTo" noStyle>
          <InputNumber style={{ width: '50%' }} placeholder="Đến" />
        </Form.Item>
      </Space.Compact>
    );
  }

  return (
    <Form.Item name={typeSearch === 'to' ? 'handlingTimeTo' : 'handlingTimeFrom'} noStyle>
      <InputNumber style={{ width: '100%' }} placeholder="Số ngày" />
    </Form.Item>
  );
};

const PackagesFilter = ({ page }: { page: PackagesPageState }) => {
  const { token } = theme.useToken();
  const typeSearch = Form.useWatch('typeSearch', page.form);

  return (
    <Card className="shadow-sm">
      <FilterPanel
        form={page.form}
        onSearch={page.handleSearch}
        onReset={page.handleReset}
        searchText="Tìm kiếm"
        resetText="Làm mới"
        showCollapseAll
        loading={page.isPackageLoading}
        primaryContent={
          <Space direction="vertical" size={token.marginMD} style={{ width: '100%' }}>
            <Form.Item name="statuses" label="Trạng thái" style={{ marginBottom: 0 }}>
              <Checkbox.Group style={{ width: '100%' }}>
                <Flex wrap gap={token.marginXS}>
                  {(page.packageStatusData || []).map((item: any) => (
                    <Checkbox key={item.code} value={item.code}>
                      {item.name}
                    </Checkbox>
                  ))}
                </Flex>
              </Checkbox.Group>
            </Form.Item>

            <Divider style={{ margin: 0 }} />

            <Form.Item name="orderCode" label="Mã đơn" style={{ marginBottom: 0 }}>
              <Input allowClear onPressEnter={page.handleSearch} />
            </Form.Item>
            <Form.Item name="packageCode" label="Mã kiện" style={{ marginBottom: 0 }}>
              <Input allowClear onPressEnter={page.handleSearch} />
            </Form.Item>
            <Form.Item name="trackingNumber" label="Mã vận đơn" style={{ marginBottom: 0 }}>
              <Input allowClear onPressEnter={page.handleSearch} />
            </Form.Item>
            <Form.Item label="Thời gian" style={{ marginBottom: 0 }}>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="createdFrom" noStyle>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Ngày bắt đầu" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="createdTo" noStyle>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Ngày kết thúc" />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Space>
        }
        secondaryContent={
          <Space direction="vertical" size={token.marginMD} style={{ width: '100%', marginTop: token.marginMD }}>
            <Form.Item name="cutOffStatus" label="Kiện dừng ở trạng thái" style={{ marginBottom: 0 }}>
              <Select
                allowClear
                showSearch
                placeholder="Trạng thái đơn"
                optionFilterProp="label"
                options={(page.packageStatusData || []).map((item: any) => ({
                  label: item.name,
                  value: item.code,
                }))}
              />
            </Form.Item>
            <Form.Item name="typeSearch" label="Khoảng ngày" style={{ marginBottom: 0 }}>
              <Select
                allowClear
                placeholder="Khoảng"
                onChange={() => {
                  page.form.setFieldValue('handlingTimeFrom', undefined);
                  page.form.setFieldValue('handlingTimeTo', undefined);
                }}
                options={[
                  { label: 'Khoảng', value: 'range' },
                  { label: 'Bằng', value: 'equal' },
                  { label: 'Lớn hơn', value: 'from' },
                  { label: 'Nhỏ hơn', value: 'to' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Số ngày" style={{ marginBottom: 0 }}>
              <HandlingTimeInput typeSearch={typeSearch} />
            </Form.Item>
          </Space>
        }
      />
    </Card>
  );
};

const PackageSkeleton = () => (
  <Card>
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex justify="space-between" gap={12}>
        <Skeleton.Input active style={{ width: 160 }} />
        <Skeleton.Button active style={{ width: 96 }} />
      </Flex>
      <Row gutter={[12, 12]}>
        {[0, 1, 2, 3].map((item) => (
          <Col xs={12} key={item}>
            <Skeleton.Input active size="small" style={{ width: '100%' }} />
          </Col>
        ))}
      </Row>
    </Space>
  </Card>
);

const PackageMilestones = ({
  packageCode,
  active,
  isShipment,
}: {
  packageCode: string;
  active: boolean;
  isShipment?: boolean;
}) => {
  const { data: parcelMilestones = [], isLoading: isParcelMilestonesLoading } =
    useParcelMilestonesQuery(packageCode, active && !!isShipment);
  const { data: packageMilestones = [], isLoading: isPackageMilestonesLoading } =
    usePackageMilestonesQuery(packageCode, active && !isShipment);
  const data = isShipment ? parcelMilestones : packageMilestones;
  const isLoading = isShipment ? isParcelMilestonesLoading : isPackageMilestonesLoading;

  if (!active) return null;
  if (isLoading) return <Skeleton active paragraph={{ rows: 2 }} />;
  if (!Array.isArray(data) || !data.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lịch sử trạng thái" />;
  }

  return (
    <Timeline
      items={data.map((item: any, index: number) => ({
        color: index === 0 ? 'green' : 'gray',
        children: (
          <Space direction="vertical" size={2}>
            <Text strong>{item.statusName || item.status || '---'}</Text>
            <Text type="secondary">{item.timestamp ? formatPackageDate(item.timestamp) : '---'}</Text>
          </Space>
        ),
      }))}
    />
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <Col xs={12}>
    <Space direction="vertical" size={0} style={{ width: '100%', minWidth: 0 }}>
      <Text type="secondary" ellipsis={{ tooltip: label }}>
        {label}
      </Text>
      <Text strong ellipsis={{ tooltip: value }}>
        {value}
      </Text>
    </Space>
  </Col>
);

const PackageCard = ({
  page,
  record,
  sentinelRef,
}: {
  page: PackagesPageState;
  record: any;
  sentinelRef?: (node: HTMLDivElement | null) => void;
}) => {
  const { token } = theme.useToken();
  const [expanded, setExpanded] = useState(false);
  const status = getStatusMeta(record.status, page.packageStatusData || []);

  return (
    <div ref={sentinelRef}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Flex justify="space-between" align="flex-start" wrap gap={token.marginSM}>
            <Space size="small" style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: token.borderRadiusLG,
                  background: token.colorPrimaryBg,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: token.colorPrimary,
                  flex: '0 0 32px',
                }}
              >
                <BarcodeOutlined />
              </span>
              <Paragraph copyable={record.code ? { text: record.code } : false} style={{ marginBottom: 0 }} ellipsis={{ rows: 1, tooltip: record.code }}>
                <Text strong>{record.code || '---'}</Text>
              </Paragraph>
            </Space>
            <Tag
              style={{
                backgroundColor: status.color || token.colorTextSecondary,
                borderColor: status.color || token.colorTextSecondary,
                color: token.colorWhite,
                marginInlineEnd: 0,
              }}
            >
              {status.name}
            </Tag>
          </Flex>

          <Row gutter={[12, 12]}>
            <Metric label="Mã đơn" value={record.orderCode || '---'} />
            <Metric label="Mã vận đơn" value={record.trackingNumber || '---'} />
            <Metric label="Cân nặng" value={formatKg(record.actualWeight || record.weight)} />
            <Metric label="Thông số" value={formatCm3(record.volumetric)} />
            <Metric label="Kích thước" value={`${formatCm(record.length)} × ${formatCm(record.width)} × ${formatCm(record.height)}`} />
            <Metric label="Ngày tạo" value={formatPackageDate(record.createdAt)} />
          </Row>

          <Flex justify="space-between" align="center" wrap gap={token.marginSM}>
            {record.orderCode ? (
              <Paragraph copyable={{ text: record.orderCode }} style={{ marginBottom: 0 }}>
                <Link onClick={() => page.navigateToOrder(record)} strong>
                  {record.orderCode}
                </Link>
              </Paragraph>
            ) : (
              <span />
            )}
            <Button
              type="link"
              icon={expanded ? <UpOutlined /> : <DownOutlined />}
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? 'Thu gọn' : 'Lịch sử'}
            </Button>
          </Flex>

          <PackageMilestones packageCode={record.code} active={expanded} isShipment={!!record.isShipment} />
        </Space>
      </Card>
    </div>
  );
};

const PackagesList = ({ page }: { page: PackagesPageState }) => {
  const { token } = theme.useToken();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const rows = page.packageData?.data || [];
  const total = page.packageData?.total || 0;
  const sentinelIndex = Math.max(rows.length - 5, 0);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node || !page.hasNextPage || page.isFetchingNextPage || page.isPackageLoading) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && page.hasNextPage && !page.isFetchingNextPage) {
          page.fetchNextPage();
        }
      }, { rootMargin: '200px 0px' });
      observerRef.current.observe(node);
    },
    [page.fetchNextPage, page.hasNextPage, page.isFetchingNextPage, page.isPackageLoading],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex justify="space-between" align="center" wrap gap={token.marginSM}>
        <Space size="small">
          <Text strong>Danh sách kiện hàng</Text>
          <Tag color="blue">{quantityFormat(total)}</Tag>
        </Space>
        <Button icon={<DownloadOutlined />} onClick={page.handleExportOpen} loading={page.isExporting}>
          Xuất Excel
        </Button>
      </Flex>

      {page.isPackageLoading ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <PackageSkeleton key={index} />
          ))}
        </Space>
      ) : rows.length ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <List
            split={false}
            dataSource={rows}
            rowKey={(record: any) => record.code || record.id}
            renderItem={(record: any, index) => (
              <List.Item style={{ padding: 0, borderBlockEnd: 'none', marginBottom: index === rows.length - 1 ? 0 : token.marginMD }}>
                <PackageCard page={page} record={record} sentinelRef={index === sentinelIndex ? sentinelRef : undefined} />
              </List.Item>
            )}
          />
          {page.isFetchingNextPage ? <PackageSkeleton /> : null}
          {!page.hasNextPage ? <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>Đã tải hết dữ liệu</Text> : null}
        </Space>
      ) : (
        <Card>
          <Empty description="Không tìm thấy kiện hàng nào" />
        </Card>
      )}
    </Space>
  );
};

export const PackageExportModal = ({ page }: { page: PackagesPageState }) => (
  <PinModal
    open={page.exportOpen}
    confirmLoading={page.isExporting}
    onConfirm={page.handleExport}
    onCancel={() => page.setExportOpen(false)}
    t={page.t}
  />
);

export const PackagesMobileView = ({ page }: { page: PackagesPageState }) => (
  <Space direction="vertical" size="large" style={{ width: '100%' }}>
    <PackagesFilter page={page} />
    <PackagesList page={page} />
    <PackageExportModal page={page} />
  </Space>
);
