import { useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Flex,
  Form,
  Input,
  List,
  Modal,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  theme,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { moneyFormat, quantityFormat } from '@repo/util';
import { LocaleInputNumber } from '../../components/LocaleInputNumber';
import { useCashRequestPage } from '@repo/hooks';

const { Text, Title } = Typography;

type CashRequestPageState = ReturnType<typeof useCashRequestPage>;

const statusLabels: Record<string, { label: string; color: string }> = {
  TODO: { label: 'Mới', color: 'blue' },
  CANCELLED: { label: 'Đã hủy', color: 'default' },
  DONE: { label: 'Hoàn thành', color: 'green' },
};

const disabledPickupTime = () => ({
  disabledHours: () => [
    ...Array.from({ length: 8 }, (_, index) => index),
    ...Array.from({ length: 5 }, (_, index) => index + 19),
  ],
});

const CashRequestSkeleton = () => (
  <Card>
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex justify="space-between">
        <Skeleton.Input active style={{ width: 150 }} />
        <Skeleton.Button active style={{ width: 80 }} />
      </Flex>
      <Skeleton.Input active style={{ width: '100%' }} />
      <Skeleton.Input active style={{ width: '70%' }} />
    </Space>
  </Card>
);

const CashRequestCreateModal = ({ page }: { page: CashRequestPageState }) => {
  const addressList = Array.isArray(page.addresses) ? page.addresses : [];
  const selectedAddressId = Form.useWatch('addressId', page.form);
  const selectedAddress = addressList.find((item: any) => item.id === selectedAddressId);
  const addressOptions = addressList.map((item: any) => ({
    label: page.getAddressDisplay(item),
    value: item.id,
  }));

  return (
    <Modal
      footer={null}
      title="Thêm yêu cầu thu tiền mặt"
      open={page.isOpenCreate}
      destroyOnClose
      onCancel={page.closeCreateModal}
    >
      <Form form={page.form} onFinish={page.createCashRequest} layout="vertical">
        <Form.Item label="Số tiền" name="amount" rules={page.amountRules}>
          <LocaleInputNumber
            className="w-full"
            placeholder="Vui lòng nhập số tiền"
            min={page.minAmount}
            precision={0}
          />
        </Form.Item>
        <div className="mb-4 text-sm text-gray-500">
          Số tiền yêu cầu thu tiền tối thiểu {moneyFormat(page.minAmount)} cho một lần thu
        </div>

        <Form.Item
          label="Địa chỉ"
          name="addressId"
          rules={[{ required: true, message: 'Địa chỉ không được để trống' }]}
        >
          <Select
            showSearch
            loading={page.isAddressesLoading}
            options={addressOptions}
            filterOption={(input, option) =>
              String(option?.label || '').toLowerCase().includes(input.toLowerCase())
            }
            placeholder="Vui lòng chọn địa chỉ"
          />
        </Form.Item>

        {selectedAddress && (
          <div className="mb-4 text-sm text-gray-600">
            Người liên hệ: {selectedAddress?.fullname || selectedAddress?.fullName || '-'} - SDT{' '}
            {selectedAddress?.phone || '-'}
          </div>
        )}

        <div className="mb-4 flex justify-end">
          <Button onClick={() => window.location.assign('/profile?tab=address')}>
            Thêm địa chỉ
          </Button>
        </div>

        <Form.Item
          label="Thời gian lấy"
          name="date"
          rules={[{ required: true, message: 'Thời gian lấy không được để trống' }]}
        >
          <DatePicker
            showTime={{ format: 'HH:mm', minuteStep: 5 }}
            disabledTime={disabledPickupTime}
            format="DD/MM/YYYY HH:mm"
            className="w-full"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            placeholder="Vui lòng chọn thời gian lấy"
          />
        </Form.Item>

        <Form.Item label="Ghi chú" name="notes">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Space className="w-full justify-end">
          <Button onClick={page.closeCreateModal}>Hủy</Button>
          <Button
            loading={page.createCashRequestMutation.isPending}
            htmlType="submit"
            type="primary"
          >
            Thêm
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};

const CashRequestCard = ({
  page,
  record,
  sentinelRef,
}: {
  page: CashRequestPageState;
  record: any;
  sentinelRef?: (node: HTMLDivElement | null) => void;
}) => {
  const statusInfo = statusLabels[record?.status] || { label: record?.status || '-', color: 'default' };

  return (
    <div ref={sentinelRef}>
      <Card>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Flex justify="space-between" align="flex-start" wrap gap={8}>
            <Space direction="vertical" size={0}>
              <Text type="secondary">Số tiền</Text>
              <Text strong>{moneyFormat(record?.customField01 || 0)}</Text>
            </Space>
            <Tag color={statusInfo.color} style={{ marginInlineEnd: 0 }}>
              {statusInfo.label}
            </Tag>
          </Flex>

          <Space direction="vertical" size={0} style={{ width: '100%', minWidth: 0 }}>
            <Text type="secondary">Địa chỉ</Text>
            <Text>{record?.customField03 || '-'}</Text>
          </Space>

          <Flex gap={12} wrap>
            <Space direction="vertical" size={0}>
              <Text type="secondary">Thời gian lấy</Text>
              <Text>{record?.start ? dayjs(record.start).format('DD/MM/YYYY HH:mm:ss') : '-'}</Text>
            </Space>
          </Flex>

          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Text type="secondary">Ghi chú</Text>
            <Text>{record?.notes?.[0] || '-'}</Text>
          </Space>

          {record?.status === 'TODO' ? (
            <Flex justify="flex-end">
              <Button danger type="link" onClick={() => page.confirmCancelCashRequest(record)}>
                Hủy yêu cầu
              </Button>
            </Flex>
          ) : null}
        </Space>
      </Card>
    </div>
  );
};

export const CashRequestStyleDefault = ({ page }: { page: CashRequestPageState }) => {
  const { token } = theme.useToken();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cashRequests = Array.isArray(page.listData?.data) ? page.listData.data : [];
  const total = page.listData?.total || 0;
  const sentinelIndex = Math.max(cashRequests.length - 5, 0);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node || !page.hasNextPage || page.isFetchingNextPage || page.isCashRequestsLoading) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && page.hasNextPage && !page.isFetchingNextPage) {
          page.fetchNextPage();
        }
      }, { rootMargin: '200px 0px' });
      observerRef.current.observe(node);
    },
    [page.fetchNextPage, page.hasNextPage, page.isFetchingNextPage, page.isCashRequestsLoading],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card styles={{ body: { padding: token.paddingMD } }}>
        <Flex justify="space-between" align="center" wrap gap={token.marginSM}>
          <Title level={4} style={{ margin: 0 }}>
            Danh sách yêu cầu <Text type="secondary">({quantityFormat(total)})</Text>
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => page.setIsOpenCreate(true)}>
            Thêm yêu cầu
          </Button>
        </Flex>
      </Card>

      {page.isCashRequestsLoading ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <CashRequestSkeleton key={index} />
          ))}
        </Space>
      ) : cashRequests.length ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <List
            split={false}
            dataSource={cashRequests}
            rowKey={(record: any) => record.id}
            renderItem={(record: any, index) => (
              <List.Item style={{ padding: 0, borderBlockEnd: 'none', marginBottom: index === cashRequests.length - 1 ? 0 : token.marginMD }}>
                <CashRequestCard
                  page={page}
                  record={record}
                  sentinelRef={index === sentinelIndex ? sentinelRef : undefined}
                />
              </List.Item>
            )}
          />
          {page.isFetchingNextPage ? <CashRequestSkeleton /> : null}
          {!page.hasNextPage ? <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>Đã tải hết dữ liệu</Text> : null}
        </Space>
      ) : (
        <Card>
          <Empty description="Không có dữ liệu" />
        </Card>
      )}

      <CashRequestCreateModal page={page} />
    </Space>
  );
};
