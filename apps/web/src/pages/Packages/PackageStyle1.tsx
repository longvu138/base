import { Form, Input, DatePicker, Table, Tag, Card } from 'antd';
import { FilterPanel, TableComponent, StatusFilter, Pagination } from '@repo/ui';
import dayjs from 'dayjs';
import { ParcelMilestoneSteps } from '../../components/Package/ParcelMilestoneSteps';
import { usePackagesPage } from './hooks/usePackagesPage';

const { RangePicker } = DatePicker;

export const PackageStyle1 = () => {
    const {
        form, page, pageSize, setPage, setPageSize,
        packageData, isPackageLoading, statusData, statusOptions,
        handleSearch, handleReset
    } = usePackagesPage();

    const columns = [
        {
            title: 'Mã kiện',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <span className="font-bold text-primary">{text || '—'}</span>,
        },
        {
            title: 'Mã đơn',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (text: string) => text || '—',
        },
        {
            title: 'Mã vận đơn',
            dataIndex: 'trackingNumber',
            key: 'trackingNumber',
            render: (text: string) => text || '—',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (val: any) => {
                const statusCode = typeof val === 'object' ? val?.code : val;
                const found = statusData?.find((s: any) => s.code === statusCode);
                const name = found?.name || (typeof val === 'object' ? val?.name : val);
                return <Tag color={found?.color || 'blue'}>{name || val}</Tag>;
            },
        },
        {
            title: 'Cân nặng (kg)',
            dataIndex: 'weight',
            key: 'weight',
            render: (val: number) => val?.toFixed(2) || '0.00',
        },
        {
            title: 'Kích thước',
            key: 'dimensions',
            render: (_: any, record: any) =>
                `${record.length || 0}x${record.width || 0}x${record.height || 0}`,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => (
                <span className="text-gray-500 text-sm">{text ? dayjs(text).format('HH:mm DD/MM/YYYY') : '-'}</span>
            ),
        },
    ];


    return (
        <div className="min-h-screen bg-layout p-4 space-y-4">
            <Card className="mb-4 shadow-sm border-none">
                <FilterPanel
                    form={form}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    primaryContent={
                        <>
                            <Form.Item name="statuses" noStyle>
                                <StatusFilter options={statusOptions} label="Trạng thái:" />
                            </Form.Item>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 mt-6 border-t border-border">
                                <Form.Item name="packageCode" label="Mã kiện">
                                    <Input placeholder="Nhập mã kiện" className="h-10" />
                                </Form.Item>
                                <Form.Item name="orderCode" label="Mã đơn">
                                    <Input placeholder="Nhập mã đơn" className="h-10" />
                                </Form.Item>
                                <Form.Item name="trackingNumber" label="Mã vận đơn">
                                    <Input placeholder="Nhập mã vận đơn" className="h-10" />
                                </Form.Item>
                                <Form.Item name="createdFromTo" label="Thời gian">
                                    <RangePicker className="w-full h-10" />
                                </Form.Item>
                            </div>
                        </>
                    }
                />
            </Card>

            <TableComponent
                title="Danh sách kiện hàng"
                totalCount={packageData?.total}
                loading={isPackageLoading}
            >
                <Table
                    columns={columns}
                    dataSource={packageData?.data || []}
                    pagination={false}
                    rowKey="code"
                    size="middle"
                    expandable={{
                        expandedRowRender: (record) => (
                            <ParcelMilestoneSteps parcelCode={record.code} />
                        ),
                        expandRowByClick: true,
                    }}
                    rowClassName="cursor-pointer"
                />
            </TableComponent>

            <Pagination
                current={page}
                pageSize={pageSize}
                total={packageData?.total || 0}
                onChange={(p, s) => {
                    setPage(p);
                    if (s !== pageSize) setPageSize(s);
                }}
            />
        </div>
    );
};
