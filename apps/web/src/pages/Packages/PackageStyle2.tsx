import { Table, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { TableComponent, Pagination } from '@repo/ui';
import { ParcelMilestoneSteps } from '../../components/Package/ParcelMilestoneSteps';
import { usePackagesPage } from './hooks/usePackagesPage';
import { PackageGobizFilter } from './PackageGobizFilter';
import {
    CopyableText,
    OrderCodeLink,
    PackageCodeCell,
    PackageExportModal,
    PackageStatusTag,
} from './PackageShared';
import { formatPackageDate } from './PackageUtils';

export const PackageStyle2 = () => {
    const pageState = usePackagesPage();
    const {
        form, page, pageSize, setPage, setPageSize,
        packageData, isPackageLoading, statusData, filters,
        handleSearch, handleReset, handleExportOpen, isExporting, navigateToOrder
    } = pageState;

    const columns = [
        {
            title: 'Mã kiện',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <PackageCodeCell code={text} />,
        },
        {
            title: 'Mã đơn',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (_: string, record: any) => (
                <OrderCodeLink record={record} onNavigate={navigateToOrder} />
            ),
        },
        {
            title: 'Mã vận đơn',
            dataIndex: 'trackingNumber',
            key: 'trackingNumber',
            render: (text: string) => <CopyableText text={text} />,
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
            render: formatPackageDate,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'right' as const,
            render: (status: any) => <PackageStatusTag status={status} statusData={statusData || []} />,
        },
    ];


    return (
        <div className="min-h-screen bg-layout p-4 space-y-4">
            <PackageGobizFilter
                form={form}
                statusData={statusData || []}
                filters={filters}
                handleSearch={handleSearch}
                handleReset={handleReset}
                handleExportOpen={handleExportOpen}
                isExporting={isExporting}
            />

            <TableComponent
                title="Danh sách kiện hàng"
                totalCount={packageData?.total}
                loading={isPackageLoading}
                extra={
                    handleExportOpen ? (
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleExportOpen}
                            loading={isExporting}
                        >
                            Xuất Excel
                        </Button>
                    ) : null
                }
            >
                <Table
                    columns={columns}
                    dataSource={packageData?.data || []}
                    pagination={false}
                    rowKey="code"
                    size="middle"
                    expandable={{
                        expandedRowRender: (record) => (
                            <ParcelMilestoneSteps
                                packageCode={record.code}
                                isShipment={!!record.isShipment}
                                currentStatus={typeof record.status === 'object' ? record.status?.code : record.status}
                            />
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
            <PackageExportModal page={pageState} />
        </div>
    );
};
