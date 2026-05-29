import dayjs from 'dayjs';
import {
    Card,
    Checkbox,
    Col,
    DatePicker,
    Empty,
    Flex,
    Form,
    Input,
    Pagination,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    theme,
} from 'antd';
import { FilterPanel } from '@repo/ui';
import { moneyFormat, quantityFormat } from '@repo/util';
import { useWithdrawalSlipsPage } from './hooks/useWithdrawalSlipsPage';
import {
    WithdrawalSlipCreateButton,
    WithdrawalSlipCreateModal,
    WithdrawalSlipLogModal,
    WithdrawalSlipRowActions,
} from './WithdrawalSlipActions';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const emptyText = '---';
const getCode = (value: any) => (typeof value === 'object' ? value?.code : value);
const getName = (value: any) => (typeof value === 'object' ? value?.name : value);

const getBeneficiaryBankName = (record: any, banksData: any[] = []) => {
    const bankValue = record.beneficiaryBank || record.bankName;
    const bankCode = getCode(bankValue);
    const bank = banksData?.find((b: any) => b.code === bankCode);
    return bank?.name || getName(bankValue) || record.bankName || bankCode || emptyText;
};

const getBeneficiaryAccount = (record: any) =>
    record.beneficiaryAccount || record.bankAccountNumber || record.accountNumber || emptyText;

const getBeneficiaryName = (record: any) =>
    record.beneficiaryName || record.bankAccountName || record.accountName || emptyText;

const getCreatedTime = (record: any) =>
    record.timestamp || record.createdAt || record.createdDate || record.created_at;

export const WithdrawalSlipStyleDefault = () => {
    const { token } = theme.useToken();
    const pageState = useWithdrawalSlipsPage();
    const {
        form, page, pageSize, setPage, setPageSize,
        listData, isWithdrawalSlipsLoading, statusData, banksData,
        bankOptions, handleSearch, handleReset
    } = pageState;

    const columns = [
        {
            title: 'Mã yêu cầu',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => (
                <Text strong style={{ color: token.colorPrimary, textTransform: 'uppercase' }}>
                    #{text || emptyText}
                </Text>
            ),
        },
        {
            title: 'Thời gian tạo',
            key: 'timestamp',
            render: (_: any, record: any) => {
                const createdTime = getCreatedTime(record);
                return createdTime ? (
                    <Text style={{ textTransform: 'uppercase' }}>
                        {dayjs(createdTime).format('HH:mm DD/MM/YYYY')}
                    </Text>
                ) : emptyText;
            },
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (val: number) => (
                <Text strong style={{ color: token.colorSuccess }}>
                    {moneyFormat(val || 0)}
                </Text>
            ),
        },
        {
            title: 'Thông tin tài khoản nhận',
            key: 'beneficiary',
            render: (_: any, record: any) => {
                const bankName = getBeneficiaryBankName(record, banksData || []);
                const account = getBeneficiaryAccount(record);
                const accountName = getBeneficiaryName(record);
                const branch = record.beneficiaryBankBranch;

                return (
                    <Space direction="vertical" size={0}>
                        <Text type="secondary">
                            Tên ngân hàng {[bankName, branch].filter(Boolean).join(' - ') || emptyText}
                        </Text>
                        <Text strong>Tên TK: {accountName}</Text>
                        <Text copyable={account !== emptyText ? { text: account } : false}> STK: {account}</Text>
                    </Space>
                );
            },
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
            title: '',
            key: 'actions',
            align: 'right' as const,
            render: (_: any, record: any) => <WithdrawalSlipRowActions page={pageState} record={record} />,
        },
    ];

    return (
        <Space direction="vertical" size={token.margin} style={{ width: '100%' }}>
            <Card className="mb-4 shadow-sm">
                <FilterPanel
                    form={form}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    searchText="Tìm kiếm"
                    resetText="Làm mới"
                    primaryContent={
                        <Space direction="vertical" size={token.margin} style={{ width: '100%' }}>
                            <Form.Item name="statuses" label="Trạng thái" style={{ marginBottom: 0 }}>
                                <Checkbox.Group>
                                    <Space wrap>
                                        {(statusData || []).map((item: any) => (
                                            <Checkbox key={item.code} value={item.code}>
                                                {item.name}
                                                {pageState.statusCounts?.[item.code] === undefined
                                                    ? ''
                                                    : ` (${quantityFormat(pageState.statusCounts[item.code])})`}
                                            </Checkbox>
                                        ))}
                                    </Space>
                                </Checkbox.Group>
                            </Form.Item>

                            <Row gutter={[token.margin, token.marginSM]}>
                                <Col xs={24} md={6}>
                                    <Form.Item name="query" label="Mã yêu cầu:" style={{ marginBottom: 0 }}>
                                        <Input placeholder="Mã yêu cầu" onPressEnter={handleSearch} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name="beneficiaryAccount" label="Số tài khoản:" style={{ marginBottom: 0 }}>
                                        <Input placeholder="Số tài khoản" onPressEnter={handleSearch} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name="beneficiaryBank" label="Ngân hàng:" style={{ marginBottom: 0 }}>
                                        <Select
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            options={bankOptions}
                                            placeholder="Chọn ngân hàng"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={6}>
                                    <Form.Item name="createdAtRange" label="Thời gian:" style={{ marginBottom: 0 }}>
                                        <RangePicker className="w-full" format="DD/MM/YYYY" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Space>
                    }
                />
            </Card>

            <Card
                title={
                    <Title level={5} style={{ margin: 0 }}>
                        Yêu cầu rút tiền{' '}
                        <Text type="secondary">
                            ({quantityFormat(Number(listData?.total || 0))})
                        </Text>
                    </Title>
                }
                extra={<WithdrawalSlipCreateButton page={pageState} />}
            >
                <Table
                    rowKey={(record: any) => record.id || record.code}
                    columns={columns}
                    dataSource={listData?.data || []}
                    loading={isWithdrawalSlipsLoading}
                    pagination={false}
                    locale={{ emptyText: <Empty description="Không tìm thấy yêu cầu rút tiền nào" /> }}
                />

                <Flex justify="flex-end" style={{ marginTop: token.margin }}>
                    <Pagination
                        hideOnSinglePage
                        current={page}
                        pageSize={pageSize}
                        total={listData?.total || 0}
                        onChange={(nextPage, nextPageSize) => {
                            setPage(nextPage);
                            if (nextPageSize !== pageSize) setPageSize(nextPageSize);
                        }}
                    />
                </Flex>
            </Card>

            <WithdrawalSlipCreateModal page={pageState} />
            <WithdrawalSlipLogModal page={pageState} />
        </Space>
    );
};
