import {
    Form,
    Input,
    Modal,
    Space,
    Tag,
    Typography,
    theme,
} from 'antd';
import { BarcodeOutlined } from '@ant-design/icons';

const { Link, Paragraph } = Typography;

export const PackageCodeCell = ({ code }: { code?: string }) => {
    const { token } = theme.useToken();

    if (!code) return <>---</>;

    return (
        <Space size="small" align="center">
            <span
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: token.borderRadiusLG,
                    background: token.colorPrimaryBg,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: token.colorPrimary,
                }}
            >
                <BarcodeOutlined />
            </span>
            <Paragraph copyable={{ text: code }} style={{ marginBottom: 0 }}>
                <Typography.Text strong>{code}</Typography.Text>
            </Paragraph>
        </Space>
    );
};

export const CopyableText = ({ text }: { text?: string }) => {
    if (!text) return <>---</>;

    return (
        <Paragraph copyable={{ text }} style={{ marginBottom: 0 }}>
            {text}
        </Paragraph>
    );
};

export const OrderCodeLink = ({
    record,
    onNavigate,
}: {
    record: any;
    onNavigate: (record: any) => void;
}) => {
    const code = record?.orderCode;
    if (!code) return <>---</>;

    return (
        <Paragraph copyable={{ text: code }} style={{ marginBottom: 0 }}>
            <Link
                onClick={(event) => {
                    event.stopPropagation();
                    onNavigate(record);
                }}
                strong
            >
                {code}
            </Link>
        </Paragraph>
    );
};

export const PackageStatusTag = ({
    status,
    statusData,
}: {
    status?: string | { code?: string; name?: string; color?: string };
    statusData: any[];
}) => {
    const { token } = theme.useToken();
    const code = typeof status === 'object' ? status?.code : status;
    const fallbackName = typeof status === 'object' ? status?.name : status;
    const found = statusData?.find((item: any) => item.code === code);

    return (
        <Tag
            style={{
                backgroundColor: found?.color || token.colorTextSecondary,
                borderColor: found?.color || token.colorTextSecondary,
                color: token.colorWhite,
            }}
        >
            {found?.name || fallbackName || '---'}
        </Tag>
    );
};

export const PackageExportModal = ({ page }: { page: any }) => {
    const [form] = Form.useForm();

    return (
        <Modal
            title={page.t('orders.export_pin')}
            open={page.exportOpen}
            onCancel={() => page.setExportOpen(false)}
            okText={page.t('common.export')}
            cancelText={page.t('common.cancel')}
            confirmLoading={page.isExporting}
            onOk={async () => {
                const values = await form.validateFields();
                await page.handleExport(values.secret);
                form.resetFields();
            }}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="secret"
                    label={page.t('orders.input_pin')}
                    rules={[{ required: true, message: page.t('message.required') }]}
                >
                    <Input.Password />
                </Form.Item>
            </Form>
        </Modal>
    );
};
