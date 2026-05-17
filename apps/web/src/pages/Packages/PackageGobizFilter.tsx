import {
    Card,
    Checkbox,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    theme,
} from 'antd';
import { FilterPanel } from '@repo/ui';

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
}: {
    form: any;
    statusData: any[];
    handleSearch: () => void;
    handleReset: () => void;
    handleExportOpen?: () => void;
    isExporting?: boolean;
    filters?: Record<string, any>;
}) => {
    const { token } = theme.useToken();
    const typeSearch = Form.useWatch('typeSearch', form);

    return (
        <Card className="mb-4 shadow-sm">
            <FilterPanel
                form={form}
                onSearch={handleSearch}
                onReset={handleReset}
                searchText="Tìm kiếm"
                resetText="Làm mới"
                showCollapseAll={true}
                primaryContent={
                    <Space direction="vertical" size={token.marginMD} style={{ width: '100%' }}>
                        <Form.Item name="statuses" label="Trạng thái" style={{ marginBottom: 0 }}>
                            <Checkbox.Group>
                                <Space wrap>
                                    {(statusData || []).map((item: any) => (
                                        <Checkbox key={item.code} value={item.code}>
                                            {item.name}
                                        </Checkbox>
                                    ))}
                                </Space>
                            </Checkbox.Group>
                        </Form.Item>

                        <Divider style={{ margin: 0 }} />

                        <Row gutter={[20, 16]} align="bottom">
                            <Col xs={24} md={4}>
                                <Form.Item name="orderCode" label="Mã đơn" style={{ marginBottom: 0 }}>
                                    <Input allowClear onPressEnter={handleSearch} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={4}>
                                <Form.Item name="packageCode" label="Mã kiện" style={{ marginBottom: 0 }}>
                                    <Input allowClear onPressEnter={handleSearch} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={4}>
                                <Form.Item name="trackingNumber" label="Mã vận đơn" style={{ marginBottom: 0 }}>
                                    <Input allowClear onPressEnter={handleSearch} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="Thời gian" style={{ marginBottom: 0 }}>
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
                    </Space>
                }
                secondaryContent={
                    <div style={{ marginTop: 16 }}>
                        <Form.Item label="Đơn dừng ở trạng thái" style={{ marginBottom: 0 }}>
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
                    </div>
                }
            />
        </Card>
    );
};
