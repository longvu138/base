import { useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import {
    Card,
    Checkbox,
    Col,
    DatePicker,
    Divider,
    Empty,
    Flex,
    Form,
    Input,
    List,
    Row,
    Select,
    Skeleton,
    Space,
    Tag,
    Typography,
    theme,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { FilterPanel } from '@repo/ui';
import { moneyFormat, quantityFormat } from '@repo/util';
import { useWithdrawalSlipsMobilePage } from '@repo/hooks';
import {
    WithdrawalSlipCreateButton,
    WithdrawalSlipCreateModal,
    WithdrawalSlipItemActions,
    WithdrawalSlipLogModal,
} from './WithdrawalSlipActions';

const { RangePicker } = DatePicker;
const { Paragraph, Text, Title } = Typography;

type WithdrawalSlipsPageState = ReturnType<typeof useWithdrawalSlipsMobilePage>;

const emptyText = '---';

const getCode = (value: any) => (typeof value === 'object' ? value?.code : value);
const getName = (value: any) => (typeof value === 'object' ? value?.name : value);

const formatDate = (value?: string) =>
    value ? dayjs(value).format('HH:mm DD/MM/YYYY') : '-';

const getCreatedTime = (record: any) =>
    record.timestamp || record.createdAt || record.createdDate || record.created_at;

const getBankName = (record: any, banksData: any[] = []) => {
    const bankValue = record.beneficiaryBank || record.bankName;
    const bankCode = getCode(bankValue);
    const bank = banksData.find((item) => item.code === bankCode);
    return bank?.name || getName(bankValue) || record.bankName || bankCode || emptyText;
};

const getAccountText = (record: any) =>
    record.beneficiaryAccount ||
    record.bankAccountNumber ||
    record.accountNumber ||
    emptyText;

const getAccountName = (record: any) =>
    record.beneficiaryName ||
    record.bankAccountName ||
    record.accountName ||
    emptyText;

const getStatusMeta = (statusValue: any, statusData: any[] = []) => {
    const statusCode = getCode(statusValue);
    const found = statusData.find((item) => item.code === statusCode);
    return {
        code: statusCode,
        name: found?.name || getName(statusValue) || statusCode || emptyText,
        color: found?.color || 'blue',
    };
};

const WithdrawalSlipItemSkeleton = () => {
    const { token } = theme.useToken();

    return (
        <Card style={{ width: '100%' }}>
            <Flex vertical gap={token.marginMD}>
                <Flex justify="space-between" align="flex-start" gap={token.marginSM}>
                    <Space direction="vertical" size={token.marginXS} style={{ flex: 1 }}>
                        <Skeleton.Input active size="small" style={{ width: 104 }} />
                        <Skeleton.Input active style={{ width: '78%', maxWidth: 240 }} />
                    </Space>
                    <Skeleton.Button active size="small" style={{ width: 88 }} />
                </Flex>
                <Row gutter={[16, 12]}>
                    {[0, 1, 2, 3].map((item) => (
                        <Col xs={12} key={item}>
                            <Space direction="vertical" size={token.marginXS} style={{ width: '100%' }}>
                                <Skeleton.Input active size="small" style={{ width: '65%' }} />
                                <Skeleton.Input active size="small" style={{ width: '90%' }} />
                            </Space>
                        </Col>
                    ))}
                </Row>
            </Flex>
        </Card>
    );
};

const WithdrawalSlipsListSkeleton = ({ count = 2 }: { count?: number }) => {
    const { token } = theme.useToken();

    return (
        <Space
            direction="vertical"
            size="middle"
            style={{ width: '100%', paddingTop: token.marginXS }}
        >
            {Array.from({ length: count }).map((_, index) => (
                <WithdrawalSlipItemSkeleton key={index} />
            ))}
        </Space>
    );
};

const WithdrawalSlipsFilter = ({ page }: { page: WithdrawalSlipsPageState }) => {
    const { token } = theme.useToken();

    return (
        <Card className="mb-4 shadow-sm">
            <FilterPanel
                form={page.form}
                onSearch={page.handleSearch}
                onReset={page.handleReset}
                searchText="Tìm kiếm"
                resetText="Làm mới"
                primaryContent={
                    <Space direction="vertical" size={token.margin} style={{ width: '100%' }}>
                        <Form.Item name="statuses" label="Trạng thái" style={{ marginBottom: 0 }}>
                            <Checkbox.Group>
                                <Space wrap>
                                    {(page.statusData || []).map((item: any) => (
                                        <Checkbox key={item.code} value={item.code}>
                                            {item.name}
                                            {page.statusCounts?.[item.code] === undefined
                                                ? ''
                                                : ` (${quantityFormat(page.statusCounts[item.code])})`}
                                        </Checkbox>
                                    ))}
                                </Space>
                            </Checkbox.Group>
                        </Form.Item>
                        <Row gutter={[16, 12]} align="bottom">
                            <Col xs={24}>
                                <Form.Item
                                    name="query"
                                    label="Mã yêu cầu"
                                    style={{ marginBottom: 0 }}
                                >
                                    <Input
                                        allowClear
                                        prefix={<SearchOutlined />}
                                        placeholder="Nhập mã yêu cầu"
                                        onPressEnter={page.handleSearch}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item
                                    name="beneficiaryAccount"
                                    label="Số tài khoản"
                                    style={{ marginBottom: 0 }}
                                >
                                    <Input
                                        allowClear
                                        placeholder="Nhập số tài khoản"
                                        onPressEnter={page.handleSearch}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item
                                    name="beneficiaryBank"
                                    label="Ngân hàng"
                                    style={{ marginBottom: 0 }}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={page.bankOptions}
                                        placeholder="Chọn ngân hàng"
                                        optionFilterProp="label"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item
                                    name="createdAtRange"
                                    label="Thời gian"
                                    style={{ marginBottom: 0 }}
                                >
                                    <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Space>
                }
            />
        </Card>
    );
};

const WithdrawalSlipsList = ({ page }: { page: WithdrawalSlipsPageState }) => {
    const { token } = theme.useToken();
    const observerRef = useRef<IntersectionObserver | null>(null);
    const total = page.listData?.total || 0;
    const rows = page.listData?.data || [];
    const sentinelIndex = Math.max(rows.length - 5, 0);

    const sentinelRef = useCallback(
        (node: HTMLDivElement | null) => {
            observerRef.current?.disconnect();
            if (!node || !page.hasNextPage || page.isFetchingNextPage || page.isWithdrawalSlipsLoading) {
                return;
            }

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0]?.isIntersecting && page.hasNextPage && !page.isFetchingNextPage) {
                    page.fetchNextPage();
                }
            }, { rootMargin: '200px 0px' });
            observerRef.current.observe(node);
        },
        [
            page.fetchNextPage,
            page.hasNextPage,
            page.isFetchingNextPage,
            page.isWithdrawalSlipsLoading,
        ],
    );

    useEffect(() => () => observerRef.current?.disconnect(), []);

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card styles={{ body: { padding: token.paddingMD } }}>
                <Flex justify="space-between" align="center" wrap gap={token.marginSM}>
                    <Title level={4} style={{ margin: 0 }}>
                        Yêu cầu rút tiền <Text type="secondary">({quantityFormat(total)})</Text>
                    </Title>
                    <WithdrawalSlipCreateButton page={page} />
                </Flex>
            </Card>

            {page.isWithdrawalSlipsLoading ? (
                <WithdrawalSlipsListSkeleton count={5} />
            ) : rows.length ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <List
                        split={false}
                        dataSource={rows}
                        rowKey={(record: any) => record.id || record.code}
                        renderItem={(record: any, index) => {
                            const status = getStatusMeta(record.status, page.statusData || []);
                            const bankName = getBankName(record, page.banksData || []);
                            const account = getAccountText(record);
                            const accountName = getAccountName(record);

                            return (
                                <List.Item
                                    style={{
                                        padding: 0,
                                        borderBlockEnd: 'none',
                                        marginBottom: index === rows.length - 1 ? 0 : token.marginMD,
                                    }}
                                >
                                    <div ref={index === sentinelIndex ? sentinelRef : undefined} style={{ width: '100%' }}>
                                        <Card style={{ width: '100%' }}>
                                            <Flex vertical gap={token.marginMD}>
                                                <Flex
                                                    justify="space-between"
                                                    align="flex-start"
                                                    wrap
                                                    gap={token.marginSM}
                                                >
                                                    <Space
                                                        direction="vertical"
                                                        size={0}
                                                        style={{ minWidth: 0, flex: 1 }}
                                                    >
                                                        <Text type="secondary">Mã yêu cầu</Text>
                                                        <Paragraph
                                                            copyable={record.code ? { text: record.code } : false}
                                                            ellipsis={{ rows: 1, tooltip: record.code }}
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            <Text strong style={{ color: token.colorPrimary }}>
                                                                {record.code || emptyText}
                                                            </Text>
                                                        </Paragraph>
                                                    </Space>
                                                    <Tag color={status.color} style={{ marginInlineEnd: 0 }}>
                                                        {status.name}
                                                    </Tag>
                                                </Flex>

                                                <Row gutter={[16, 12]}>
                                                    <Col xs={12}>
                                                        <Space direction="vertical" size={0}>
                                                            <Text type="secondary">Số tiền</Text>
                                                            <Text strong>{moneyFormat(record.amount || 0)}</Text>
                                                        </Space>
                                                    </Col>
                                                    <Col xs={12}>
                                                        <Space direction="vertical" size={0}>
                                                            <Text type="secondary">Thời gian tạo</Text>
                                                            <Text>{formatDate(getCreatedTime(record))}</Text>
                                                        </Space>
                                                    </Col>
                                                    <Col xs={24}>
                                                        <Space
                                                            direction="vertical"
                                                            size={0}
                                                            style={{ width: '100%', minWidth: 0 }}
                                                        >
                                                            <Text type="secondary">Ngân hàng nhận</Text>
                                                            <Text ellipsis={{ tooltip: bankName }}>
                                                                {[bankName, record.beneficiaryBankBranch]
                                                                    .filter(Boolean)
                                                                    .join(' - ')}
                                                            </Text>
                                                        </Space>
                                                    </Col>
                                                    <Col xs={24}>
                                                        <Space
                                                            direction="vertical"
                                                            size={0}
                                                            style={{ width: '100%', minWidth: 0 }}
                                                        >
                                                            <Text type="secondary">Tài khoản thụ hưởng</Text>
                                                            <Text ellipsis={{ tooltip: `${accountName} - ${account}` }}>
                                                                {accountName} - {account}
                                                            </Text>
                                                        </Space>
                                                    </Col>
                                                </Row>
                                                <WithdrawalSlipItemActions page={page} record={record} />
                                            </Flex>
                                        </Card>
                                    </div>
                                </List.Item>
                            );
                        }}
                    />
                    {page.isFetchingNextPage && <WithdrawalSlipItemSkeleton />}
                    {!page.hasNextPage && rows.length ? (
                        <Divider plain>Đã tải hết dữ liệu</Divider>
                    ) : null}
                </Space>
            ) : (
                <Card>
                    <Empty description="Không tìm thấy yêu cầu rút tiền nào" />
                </Card>
            )}
        </Space>
    );
};

export const WithdrawalSlipsMobileView = ({ page }: { page: WithdrawalSlipsPageState }) => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <WithdrawalSlipsFilter page={page} />
        <WithdrawalSlipsList page={page} />
        <WithdrawalSlipCreateModal page={page} />
        <WithdrawalSlipLogModal page={page} />
    </Space>
);
