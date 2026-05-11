import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Form, Input, DatePicker, Select, Table, Checkbox, Button, Tooltip, Popover, Typography } from 'antd';
import { FilterPanel, TableComponent, Status, StatusFilter, Pagination } from '@repo/ui';
import { Plus, Download } from 'lucide-react';
import { useOrdersPage } from './hooks/useOrdersPage';
import Paragraph from 'antd/es/typography/Paragraph';
import { formatCurrency } from '@repo/util';

const { RangePicker } = DatePicker;

/**
 * OrdersStyle1 — Giao diện cho Baogam (gd1)
 * Layout bộ lọc kiểu FilterPanel và danh sách bảng truyền thống.
 */
export const OrdersStyle1 = () => {
    const navigate = useNavigate();
    const {
        t, form, page, pageSize, setPage, setPageSize,
        orderData, isOrderLoading, statusData,
        servicesData, marketplacesData, statusOptions,
        handleSearch, handleReset, updateOrderNote
    } = useOrdersPage();

    const columns = [
        {
            title: t('orders.columns.code'),
            dataIndex: 'code',
            key: 'code',
            width: 600,
            render: (_: any, record: any) => (
                <>
                    <div className='flex items-center gap-2 mb-2'>
                        <Paragraph className="text-primary cursor-pointer mb-0" copyable={{ text: record?.code }}>
                            <span className="font-medium text-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders/${record?.code}`)}>
                                #{record?.code}
                            </span>
                        </Paragraph>

                        |
                        <span className='text-sm'>{record?.merchantName}</span>
                    </div>

                    <div className='flex items-start gap-3'>
                        <Popover placement='right' content={<img src={record?.image} alt="" className='h-56 w-56 object-cover' />}>
                            <img src={record?.image} alt="" className='h-28 w-28 rounded-md border object-cover' />
                        </Popover>
                        <div className='flex flex-col gap-1.5 flex-1'>
                            <div className='flex items-start gap-1'>
                                <span className="">Ghi chú:</span>
                                <Typography.Paragraph
                                    className="mb-0 text-sm flex-1 max-w-[400px]"
                                    ellipsis={{ rows: 1, tooltip: record?.note || "---" }}
                                    editable={{
                                        onChange: (val) => {
                                            if (val !== record?.note) {
                                                updateOrderNote.mutateAsync({ code: record?.code, note: val });
                                            }
                                        },
                                        triggerType: ['icon', 'text']
                                    }}
                                >
                                    {record?.note || "---"}
                                </Typography.Paragraph>
                            </div>
                            <span className='text-sm truncate'>Kho nhận:{" "}{record?.receivingWarehouse?.displayName || '---'}</span>
                            <Tooltip title={`Đặt/Mua/Nhận`}>
                                Số lượng: {record?.orderedQuantity || '---'}/{record?.purchasedQuantity || '---'}/{record?.receivedQuantity || '---'}
                            </Tooltip>
                        </div>
                    </div>
                    <div className='flex items-center gap-1 mt-1'>
                        <span className='text-sm truncate'>Dịch vụ:</span>
                        <Checkbox.Group className="flex flex-wrap">
                            {record?.services?.map((item: any, idx: number) => (
                                <span key={item.code} className='text-sm'>
                                    {item.name}{idx !== record.services.length - 1 && " | "}
                                </span>
                            ))}
                        </Checkbox.Group>
                    </div>
                </>
            )
        },
        {
            title: "",
            key: "price-info",
            render: (_: any, record: any) => (
                <div className="text-sm space-y-1.5">
                    <div>
                        <span className="text-gray-600">Tiền hàng: </span>
                        <span className="font-semibold">{formatCurrency(record?.exchangedTotalValue)}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Tổng chi phí: </span>
                        <span className="font-semibold">{formatCurrency(record?.grandTotal)}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">{record?.totalUnpaid < 0 ? "Tiền thừa: " : 'Cần thanh toán: '} </span>
                        <span className={`font-semibold ${record?.totalUnpaid < 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(record?.totalUnpaid))}
                        </span>
                    </div>
                </div>
            )
        },
        {
            title: '',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (_: any, record: any) => <div className="text-sm space-y-1.5">
                <div>
                    <span className="text-gray-600">Cân nặng tính phí:</span>
                    <span className="font-semibold ml-1">{record?.chargeableWeight ? record?.chargeableWeight + 'kg' : '---'} </span>
                </div>
                <div>
                    <span className="text-gray-600">Số lượng kiện:</span>
                    <span className="font-semibold ml-1">{record?.totalPackage ? record?.totalPackage + ' kiện' : '---'}</span>
                </div>
                <div>
                    <span className="text-gray-600">Giảm giá từ NCC: </span>
                    <span className="font-semibold">{record?.merchantDiscountAmount ? formatCurrency(record?.merchantDiscountAmount) : '---'}</span>
                </div>
            </div>
        }
        , {
            title: '',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: any) => {
                return <div className="flex flex-col items-end">
                    <Status status={status} statuses={statusData} />
                    <div className="flex flex-col items-end mt-1">
                        <div>Ngày tạo đơn</div>
                        <div>
                            {record.createdAt ? dayjs(record.createdAt).format('HH:mm DD/MM/YYYY') : '-'}
                        </div>
                    </div>
                </div>
            }
        },
    ];

    return (
        <div className="space-y-10">
            <div className='bg-filter dark:bg-filter-dark p-4 rounded-lg transition-colors duration-200'>
                <FilterPanel
                    form={form}
                    searchText={t('orders.buttons.search')}
                    resetText={t('orders.buttons.reset')}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    showCollapseAll={true}
                    loading={isOrderLoading}
                    primaryContent={
                        <div className="flex flex-col gap-4">
                            <Form.Item name="statuses" noStyle>
                                <StatusFilter
                                    options={statusOptions}
                                    label={t('orders.filters.status') + ':'}
                                />
                            </Form.Item>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Form.Item name="query" label={t('orders.search_placeholder')}>
                                    <Input placeholder={t('orders.search_placeholder')} />
                                </Form.Item>
                                <Form.Item name="note" label={t('orders.filters.note')}>
                                    <Input placeholder="" />
                                </Form.Item>
                                <Form.Item name="dateRange" label={t('orders.filters.created_at') + ':'}>
                                    <RangePicker className="w-full" placeholder={[t('orders.filters.start_date'), t('orders.filters.end_date')]} />
                                </Form.Item>
                            </div>
                            <div className="flex items-end pb-2">
                                <Form.Item name="needPaid" valuePropName="checked" noStyle>
                                    <Checkbox>{t('orders.filters.financial_payment')}</Checkbox>
                                </Form.Item>
                            </div>
                        </div>
                    }
                    secondaryContent={
                        <div className='w-full space-y-4 pt-2 border-t border-gray-100'>
                            <div className='flex items-start gap-1 w-full'>
                                <div className='whitespace-nowrap pt-1 font-medium text-gray-700 min-w-[120px]'>{t('orders.filters.source')}:</div>
                                <Form.Item name="marketplaces" className="mb-0 flex-1">
                                    <Checkbox.Group className="flex flex-wrap gap-x-6 gap-y-3">
                                        {marketplacesData?.map((item: any) => (
                                            <Checkbox key={item.code} value={item.code}>{item.name}</Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>

                            <div className='flex items-start gap-1 w-full'>
                                <div className='whitespace-nowrap pt-1 font-medium text-gray-700 min-w-[120px]'>{t('orders.filters.services')}:</div>
                                <Form.Item name="services" className="mb-0 flex-1">
                                    <Checkbox.Group className="flex flex-wrap gap-x-6 gap-y-3">
                                        {servicesData?.map((item: any) => (
                                            <Checkbox key={item.code} value={item.code}>{item.name}</Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
                                <Form.Item name="stuckStatus" label={t('orders.filters.stuck_status') + ':'}>
                                    <Select placeholder={t('orders.filters.status')} options={statusData?.map((s: any) => ({ label: s.name, value: s.code }))} allowClear />
                                </Form.Item>
                                <Form.Item name="stuckRange" label=" ">
                                    <Select placeholder="Khoảng" options={[{ label: 'Khoảng', value: 'range' }]} />
                                </Form.Item>
                                <Form.Item name="stuckFrom" label=" ">
                                    <Input placeholder="Từ" />
                                </Form.Item>
                                <Form.Item name="stuckTo" label=" ">
                                    <Input placeholder="Đến" />
                                </Form.Item>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Form.Item name="timeType" label={<span className="dark:text-gray-100">{t('orders.filters.time_range') + ':'}</span>}>
                                    <Select placeholder={t('orders.filters.time_range')} options={[{ label: 'Ngày tạo', value: 'created' }, { label: 'Ngày cập nhật', value: 'updated' }]} />
                                </Form.Item>
                                <Form.Item name="timeStart" label=" ">
                                    <DatePicker className="w-full" placeholder={t('orders.filters.start_date')} />
                                </Form.Item>
                                <Form.Item name="timeEnd" label=" ">
                                    <DatePicker className="w-full" placeholder={t('orders.filters.end_date')} />
                                </Form.Item>
                            </div>
                        </div>
                    }
                />
            </div>

            <TableComponent
                title={t('orders.title')}
                totalCount={orderData?.total || 0}
                hideTotalCount={true}
                loading={isOrderLoading}
                showEmpty={!isOrderLoading && (!orderData?.data || orderData?.data.length === 0)}
                extra={
                    <div className="flex gap-2">
                        <Button
                            type='default'
                            icon={<Download size={16} />}
                            onClick={() => console.log('Exporting...')}
                        >
                            {t('common.export')}
                        </Button>
                        <Button
                            type="primary"
                            icon={<Plus size={16} />}
                            onClick={() => console.log('Creating...')}
                        >
                            {t('common.create', { defaultValue: 'Tạo mới' })}
                        </Button>
                    </div>
                }
            >
                <Table
                    columns={columns}
                    dataSource={orderData?.data || []}
                    rowKey="id"
                    pagination={false}
                    onRow={() => ({
                        className: 'cursor-pointer hover:bg-blue-50',
                    })}
                />
            </TableComponent>

            <Pagination
                current={page}
                pageSize={pageSize}
                total={orderData?.total || 0}
                onChange={(p, s) => {
                    setPage(p);
                    if (s !== pageSize) setPageSize(s);
                }}
            />
        </div>
    );
};

