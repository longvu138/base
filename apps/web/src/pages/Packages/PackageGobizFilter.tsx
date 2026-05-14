import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Flex,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Tag,
    Typography,
    theme,
} from 'antd';
import { DownloadOutlined, RedoOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

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
    if (typeSearch === 'equal') {
        return (
            <Form.Item name="handlingTimeFrom" noStyle>
                <InputNumber style={{ width: '100%' }} placeholder="Số ngày" />
            </Form.Item>
        );
    }
    if (typeSearch === 'from') {
        return (
            <Form.Item name="handlingTimeFrom" noStyle>
                <InputNumber style={{ width: '100%' }} placeholder="Từ" />
            </Form.Item>
        );
    }
    return (
        <Form.Item name="handlingTimeTo" noStyle>
            <InputNumber style={{ width: '100%' }} placeholder="Đến" />
        </Form.Item>
    );
};

export const PackageGobizFilter = ({
    form,
    statusData,
    handleSearch,
    handleReset,
    handleExportOpen,
    isExporting,
    filters,
}: {
    form: any;
    statusData: any[];
    handleSearch: () => void;
    handleReset: () => void;
    handleExportOpen?: () => void;
    isExporting?: boolean;
    filters: Record<string, any>;
}) => {
    const { token } = theme.useToken();
    const typeSearch = Form.useWatch('typeSearch', form);
    const currentStatuses = Form.useWatch('statuses', form) ?? filters.statuses;
    const selectedStatuses = Array.isArray(currentStatuses)
        ? currentStatuses
        : currentStatuses
            ? [currentStatuses]
            : [];

    const toggleStatus = (code: string) => {
        const next = selectedStatuses.includes(code)
            ? selectedStatuses.filter((item) => item !== code)
            : [...selectedStatuses, code];
        form.setFieldValue('statuses', next);
    };

    return (
        <Card
            title={<Title level={5} style={{ margin: 0 }}>Tìm kiếm</Title>}
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
            styles={{ body: { paddingTop: token.paddingMD } }}
        >
            <Form form={form} layout="vertical">
                <Flex gap={token.marginMD} align="flex-start" wrap>
                    <Text strong style={{ minWidth: 96 }}>
                        Trạng thái:
                    </Text>
                    <Form.Item name="statuses" noStyle>
                        <Space size={[token.marginLG, token.marginXS]} wrap>
                            {(statusData || []).map((item: any) => (
                                <Tag.CheckableTag
                                    key={item.code}
                                    checked={selectedStatuses.includes(item.code)}
                                    onChange={() => toggleStatus(item.code)}
                                    style={{ paddingInline: token.paddingSM }}
                                >
                                    {item.name}
                                </Tag.CheckableTag>
                            ))}
                        </Space>
                    </Form.Item>
                </Flex>

                <Divider style={{ margin: `${token.marginMD}px 0` }} />

                <Row gutter={[20, 16]} align="bottom">
                    <Col xs={24} md={4}>
                        <Form.Item name="orderCode" label="Mã đơn">
                            <Input allowClear onPressEnter={handleSearch} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                        <Form.Item name="packageCode" label="Mã kiện">
                            <Input allowClear onPressEnter={handleSearch} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                        <Form.Item name="trackingNumber" label="Mã vận đơn">
                            <Input allowClear onPressEnter={handleSearch} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Thời gian">
                            <Row gutter={20}>
                                <Col span={12}>
                                    <Form.Item name="createdFrom" noStyle>
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="DD/MM/YYYY"
                                            placeholder="Ngày bắt đầu"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="createdTo" noStyle>
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="DD/MM/YYYY"
                                            placeholder="Ngày kết thúc"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider style={{ margin: `${token.marginXS}px 0 ${token.marginMD}px` }} />

                <Form.Item label="Đơn dừng ở trạng thái">
                    <Row gutter={[10, 10]}>
                        <Col xs={24} md={6}>
                            <Form.Item name="cutOffStatus" noStyle>
                                <Select
                                    allowClear
                                    showSearch
                                    placeholder="Trạng thái đơn"
                                    optionFilterProp="label"
                                    options={(statusData || []).map((item: any) => ({
                                        label: item.name,
                                        value: item.code,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item name="typeSearch" noStyle>
                                <Select
                                    allowClear
                                    placeholder="Khoảng"
                                    onChange={() => {
                                        form.setFieldValue('handlingTimeFrom', undefined);
                                        form.setFieldValue('handlingTimeTo', undefined);
                                    }}
                                    options={[
                                        { label: 'Khoảng', value: 'range' },
                                        { label: 'Bằng', value: 'equal' },
                                        { label: 'Từ', value: 'from' },
                                        { label: 'Đến', value: 'to' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <HandlingTimeInput typeSearch={typeSearch} />
                        </Col>
                    </Row>
                </Form.Item>

                <Flex justify="flex-end" align="center" gap={token.marginLG}>
                    <Button
                        type="link"
                        icon={<RedoOutlined />}
                        onClick={handleReset}
                        style={{ paddingInline: 0, color: token.colorTextSecondary }}
                    >
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        style={{ minWidth: 220 }}
                        onClick={handleSearch}
                    >
                        Tìm kiếm
                    </Button>
                </Flex>
            </Form>
        </Card>
    );
};
