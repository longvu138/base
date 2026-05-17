import React from 'react';
import {
    Card,
    Button as AntButton,
    Skeleton as AntSkeleton,
    Empty,
    Table,
    List,
    Typography,
} from 'antd';
import { Pagination } from '@repo/ui';
import {
    ArrowRightOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import { ParcelMilestoneSteps } from '../../components/Package/ParcelMilestoneSteps';
import './PackageStyle3.css';
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

const { Text, Title } = Typography;

/**
 * PackageStyle3 — Giao diện cho Gobiz (gd3)
 * Premium table view với status tabs, hiện đại và sạch sẽ.
 */
export const PackageStyle3: React.FC<{ isTabView?: boolean }> = ({ isTabView }) => {
    const pageState = usePackagesPage();
    const {
        form, page, pageSize, setPage, setPageSize,
        filters, listData, isPackagesLoading, statusData,
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
            title: 'Mã vận đơn',
            dataIndex: 'trackingNumber',
            key: 'trackingNumber',
            render: (text: string) => <CopyableText text={text} />,
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
            title: 'Trọng lượng / KT',
            key: 'specs',
            render: (_: any, r: any) => (
                <div>
                    <div className="font-semibold text-sm text-gray-700 dark:text-gray-200">{r.weight || '0'} kg</div>
                    <div className="text-[10px] text-gray-400">{r.length || 0}×{r.width || 0}×{r.height || 0} cm</div>
                </div>
            ),
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
        {
            title: '',
            key: 'action',
            width: 60,
            render: () => <AntButton type="primary" size="small" shape="circle" icon={<ArrowRightOutlined />} className="shadow-sm" />,
        },
    ];

    return (
        <div className={`package-style-3-wrapper ${isTabView ? '' : 'p-6'} space-y-6 max-w-[1600px] mx-auto`}>
            {!isTabView && (
                <Card>
                    <Title level={3} style={{ margin: 0 }}>Kiện hàng</Title>
                    <Text type="secondary">Theo dõi và tra cứu trạng thái các kiện hàng.</Text>
                </Card>
            )}

            <PackageGobizFilter
                form={form}
                statusData={statusData || []}
                filters={filters}
                handleSearch={handleSearch}
                handleReset={handleReset}
                handleExportOpen={handleExportOpen}
                isExporting={isExporting}
            />

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Danh sách kiện hàng</span>
                        {listData?.total !== undefined && (
                            <span className="text-sm px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                                Tổng: {listData.total}
                            </span>
                        )}
                    </div>
                    {handleExportOpen && (
                        <AntButton
                            onClick={handleExportOpen}
                            loading={isExporting}
                            icon={<DownloadOutlined />}
                            className="flex items-center gap-2"
                        >
                            Xuất Excel
                        </AntButton>
                    )}
                </div>

                {isPackagesLoading ? (
                    <List
                        dataSource={Array.from({ length: 6 }).map((_, i) => ({ id: `sk-${i}` }))}
                        renderItem={() => (
                            <div className="p-5 border-b border-gray-50 dark:border-gray-700/50">
                                <AntSkeleton active paragraph={{ rows: 1 }} title={false} />
                            </div>
                        )}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={listData?.data || []}
                        rowKey="code"
                        pagination={false}
                        expandable={{
                            expandedRowRender: (r) => (
                                <ParcelMilestoneSteps
                                    packageCode={r.code}
                                    isShipment={!!r.isShipment}
                                    currentStatus={typeof r.status === 'object' ? r.status?.code : r.status}
                                />
                            ),
                            expandRowByClick: true,
                        }}
                        locale={{ emptyText: <div className="py-20"><Empty description="Không tìm thấy kiện hàng nào" /></div> }}
                    />
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center pt-4">
                <Pagination current={page} pageSize={pageSize} total={listData?.total || 0}
                    onChange={(p, s) => { setPage(p); if (s !== pageSize) setPageSize(s); }} />
            </div>
            <PackageExportModal page={pageState} />
        </div>
    );
};
