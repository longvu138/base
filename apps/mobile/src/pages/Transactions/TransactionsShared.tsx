import { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Empty,
    Flex,
    Form,
    Input,
    List,
    Modal,
    Row,
    Skeleton,
    Space,
    Tag,
    Typography,
    theme,
} from 'antd';
import {
    DownloadOutlined,
    FileDoneOutlined,
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { moneyFormat, quantityFormat } from '@repo/util';
import { useTransactionsMobilePage } from '@repo/hooks';

const { Paragraph, Text, Title } = Typography;
const emptyText = '---';

type TransactionsPageState = ReturnType<typeof useTransactionsMobilePage>;

const getTransactionTimestamp = (record: any) =>
    record.actualTimestamp ||
    record.nominalTimestamp ||
    record.timestamp ||
    record.createdAt;

const formatDateTime = (value?: string) => {
    if (!value) return emptyText;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return emptyText;
    return `${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes(),
    ).padStart(2, '0')} ${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1,
    ).padStart(2, '0')}/${date.getFullYear()}`;
};

const getTransactionTypeColor = (type?: string) => {
    const colorMap: Record<string, string> = {
        ADJUSTMENT: 'purple',
        CHARGE: 'orange',
        CREDIT: 'green',
        DEBIT: 'red',
        DEPOSIT: 'green',
        GIFT: 'magenta',
        PAYMENT: 'red',
        REFUND: 'cyan',
        TRANSFER: 'blue',
        WITHDRAW: 'blue',
    };
    return colorMap[type?.toUpperCase() || ''] || 'default';
};

const formatMoney = (value?: number) => {
    if (value === null || value === undefined) return moneyFormat(0);
    return moneyFormat(value);
};

const TransactionItemSkeleton = () => {
    const { token } = theme.useToken();

    return (
        <Card style={{ width: '100%' }}>
            <Flex vertical gap={token.marginMD}>
                <Flex justify="space-between" align="flex-start" gap={token.marginSM}>
                    <Space direction="vertical" size={token.marginXS} style={{ flex: 1 }}>
                        <Skeleton.Input active size="small" style={{ width: 104 }} />
                        <Skeleton.Input active style={{ width: '80%', maxWidth: 240 }} />
                    </Space>
                    <Skeleton.Button active size="small" style={{ width: 92 }} />
                </Flex>
                <Row gutter={[16, 12]}>
                    {[0, 1, 2, 3].map((item) => (
                        <Col xs={12} key={item}>
                            <Space direction="vertical" size={token.marginXS} style={{ width: '100%' }}>
                                <Skeleton.Input active size="small" style={{ width: '60%' }} />
                                <Skeleton.Input active size="small" style={{ width: '86%' }} />
                            </Space>
                        </Col>
                    ))}
                </Row>
            </Flex>
        </Card>
    );
};

const TransactionsListSkeleton = ({ count = 2 }: { count?: number }) => {
    const { token } = theme.useToken();

    return (
        <Space
            direction="vertical"
            size="middle"
            style={{ width: '100%', paddingTop: token.marginXS }}
        >
            {Array.from({ length: count }).map((_, index) => (
                <TransactionItemSkeleton key={index} />
            ))}
        </Space>
    );
};

const TransactionsFilter = ({ page }: { page: TransactionsPageState }) => {
    const { token } = theme.useToken();
    const [exportOpen, setExportOpen] = useState(false);
    const [exportSecret, setExportSecret] = useState('');
    const [exportError, setExportError] = useState('');
    const selectedTypes = Form.useWatch('externalTypes', page.form) || [];

    const closeExport = () => {
        setExportOpen(false);
        setExportSecret('');
        setExportError('');
    };

    return (
        <>
            <Card className="mb-4 shadow-sm">
                <Form form={page.form} layout="vertical" onFinish={page.handleSearch}>
                    <Space direction="vertical" size={token.marginMD} style={{ width: '100%' }}>
                        <Form.Item
                            name="externalTypes"
                            label={page.t('customer_info.transaction_type')}
                            style={{ marginBottom: 0 }}
                        >
                            <Flex gap={token.marginXS} wrap>
                                {page.transactionTypes.map((item: any) => {
                                    const checked = selectedTypes.includes(item.code);
                                    return (
                                        <Tag.CheckableTag
                                            key={item.code}
                                            checked={checked}
                                            onChange={() => page.toggleTransactionType(item.code)}
                                            style={{
                                                border: `1px solid ${checked ? token.colorPrimary : token.colorBorder}`,
                                                borderRadius: token.borderRadius,
                                                marginInlineEnd: 0,
                                                padding: `${token.paddingXXS}px ${token.paddingSM}px`,
                                            }}
                                        >
                                            {item.name}
                                        </Tag.CheckableTag>
                                    );
                                })}
                            </Flex>
                        </Form.Item>

                        <Row gutter={[16, 12]} align="bottom">
                            <Col xs={24}>
                                <Form.Item
                                    name="query"
                                    label={page.t('customer_info.input_code')}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Input
                                        allowClear
                                        prefix={<SearchOutlined />}
                                        placeholder="Mã đơn, mã giao dịch"
                                        onPressEnter={page.handleSearch}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item
                                    label={page.t('customer_info.time')}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Row gutter={8}>
                                        <Col span={12}>
                                            <Form.Item name="nominalTimestampFrom" noStyle>
                                                <DatePicker
                                                    format="DD/MM/YYYY"
                                                    placeholder="Từ ngày"
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="nominalTimestampTo" noStyle>
                                                <DatePicker
                                                    format="DD/MM/YYYY"
                                                    placeholder="Đến ngày"
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Flex justify="end" wrap gap={token.marginSM}>
                            <Button icon={<ReloadOutlined />} onClick={page.handleReset}>
                                {page.t('order.filter_refresh')}
                            </Button>
                            <Button
                                icon={<DownloadOutlined />}
                                loading={page.isExporting}
                                onClick={() => {
                                    setExportSecret('');
                                    setExportError('');
                                    setExportOpen(true);
                                }}
                            >
                                Xuất Excel
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                {page.t('customer_info.search')}
                            </Button>
                        </Flex>
                    </Space>
                </Form>
            </Card>

            <Modal
                title={page.t('modal.confirm_pin')}
                open={exportOpen}
                confirmLoading={page.isExporting}
                okText={page.t('cartCheckout.confirm')}
                cancelText={page.t('cartCheckout.cancel')}
                onCancel={closeExport}
                onOk={() => page.handleExport(exportSecret, closeExport, setExportError)}
            >
                <Space direction="vertical" size={token.marginXS} style={{ width: '100%' }}>
                    <Text>{page.t('cartCheckout.please_input_pin')}</Text>
                    <Input.Password
                        autoFocus
                        value={exportSecret}
                        status={exportError ? 'error' : undefined}
                        placeholder="PIN"
                        onChange={(event) => {
                            setExportSecret(event.target.value);
                            setExportError('');
                        }}
                        onPressEnter={() => page.handleExport(exportSecret, closeExport, setExportError)}
                    />
                    {exportError && <Text type="danger">{exportError}</Text>}
                    <Text type="secondary">{page.t('cartCheckout.default_pin')}</Text>
                </Space>
            </Modal>
        </>
    );
};

const TransactionsList = ({ page }: { page: TransactionsPageState }) => {
    const { token } = theme.useToken();
    const total = page.listData?.total || 0;
    const rows = page.listData?.data || [];

    const handleLoadMore = () => {
        if (page.hasNextPage && !page.isFetchingNextPage && !page.isLoading) {
            page.fetchNextPage();
        }
    };

    useEffect(() => {
        const handleWindowScroll = () => {
            const documentHeight = document.documentElement.scrollHeight;
            const currentBottom = window.innerHeight + window.scrollY;

            if (documentHeight - currentBottom <= 64) {
                handleLoadMore();
            }
        };

        window.addEventListener('scroll', handleWindowScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleWindowScroll);
    }, [
        page.fetchNextPage,
        page.hasNextPage,
        page.isFetchingNextPage,
        page.isLoading,
        rows.length,
    ]);

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Flex
                justify="space-between"
                align="center"
                wrap
                gap={token.marginMD}
                style={{ marginBottom: token.marginMD }}
            >
                <Space size="small" align="center">
                    <Title level={4} style={{ margin: 0 }}>
                        {page.t('customer_info.transaction_history_list')}
                    </Title>
                    <Tag color="blue">{quantityFormat(total)}</Tag>
                </Space>
            </Flex>

            {page.isLoading ? (
                <TransactionsListSkeleton count={5} />
            ) : rows.length ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <List
                        split={false}
                        dataSource={rows}
                        rowKey={(record: any) => record.id || record.txid}
                        renderItem={(record: any, index) => {
                            const typeCode = record.externalType || record.type;
                            const type = page.transactionTypes.find(
                                (transactionType: any) =>
                                    transactionType.code?.toLowerCase() ===
                                    String(typeCode || '').toLowerCase(),
                            );
                            const positive = Number(record.amount || 0) >= 0;
                            const memo = record.memo || record.description || emptyText;
                            const txid = record.txid || record.code || emptyText;

                            return (
                                <List.Item
                                    style={{
                                        padding: 0,
                                        borderBlockEnd: 'none',
                                        marginBottom: index === rows.length - 1 ? 0 : token.marginMD,
                                    }}
                                >
                                    <Card style={{ width: '100%' }}>
                                        <Flex vertical gap={token.marginMD}>
                                            <Flex
                                                justify="space-between"
                                                align="flex-start"
                                                wrap
                                                gap={token.marginSM}
                                            >
                                                <Space align="start" style={{ minWidth: 0, flex: 1 }}>
                                                    <FileDoneOutlined style={{ color: token.colorPrimary }} />
                                                    <Space
                                                        direction="vertical"
                                                        size={0}
                                                        style={{ minWidth: 0, flex: 1 }}
                                                    >
                                                        <Text strong>
                                                            {formatDateTime(getTransactionTimestamp(record))}
                                                        </Text>
                                                        <Paragraph
                                                            copyable={txid !== emptyText ? { text: txid } : false}
                                                            ellipsis={{ rows: 1, tooltip: txid }}
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            Mã: {txid}
                                                        </Paragraph>
                                                    </Space>
                                                </Space>
                                                <Tag
                                                    color={getTransactionTypeColor(record.type || typeCode)}
                                                    style={{ marginInlineEnd: 0 }}
                                                >
                                                    {type?.name || typeCode || emptyText}
                                                </Tag>
                                            </Flex>

                                            <Paragraph
                                                ellipsis={{ rows: 2, expandable: true, symbol: page.t('customer_info.detail') }}
                                                style={{ marginBottom: 0 }}
                                            >
                                                {memo}
                                            </Paragraph>

                                            <Row gutter={[16, 12]}>
                                                <Col xs={12}>
                                                    <Space direction="vertical" size={0}>
                                                        <Text type="secondary">{page.t('financial_tab.amount')}</Text>
                                                        <Text strong type={positive ? 'success' : 'danger'}>
                                                            {positive ? '+' : ''}
                                                            {formatMoney(record.amount)}
                                                        </Text>
                                                    </Space>
                                                </Col>
                                                <Col xs={12}>
                                                    <Space direction="vertical" size={0}>
                                                        <Text type="secondary">Số dư</Text>
                                                        <Text strong>{formatMoney(record.balanceAfter)}</Text>
                                                    </Space>
                                                </Col>
                                                <Col xs={24}>
                                                    <Space
                                                        direction="vertical"
                                                        size={0}
                                                        style={{ width: '100%', minWidth: 0 }}
                                                    >
                                                        <Text type="secondary">STK</Text>
                                                        <Text ellipsis={{ tooltip: record.account || page.accountId || emptyText }}>
                                                            {record.account || page.accountId || emptyText}
                                                        </Text>
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </Flex>
                                    </Card>
                                </List.Item>
                            );
                        }}
                    />
                    {page.isFetchingNextPage && <TransactionItemSkeleton />}
                    {!page.hasNextPage && rows.length ? (
                        <Divider plain>Đã tải hết dữ liệu</Divider>
                    ) : null}
                </Space>
            ) : (
                <Card>
                    <Empty description={page.t('customer_info.empty_transaction')} />
                </Card>
            )}
        </Space>
    );
};

export const TransactionsMobileView = ({ page }: { page: TransactionsPageState }) => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <TransactionsFilter page={page} />
        <TransactionsList page={page} />
    </Space>
);
