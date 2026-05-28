import dayjs from 'dayjs';
import {
    Button,
    Descriptions,
    Empty,
    Form,
    Input,
    Modal,
    Popconfirm,
    Select,
    Space,
    Timeline,
    Typography,
} from 'antd';
import { FileTextOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import { moneyFormat } from '@repo/util';
import { LocaleInputNumber } from '../../components/Common/LocaleInputNumber';

const { Text } = Typography;

const getStatusCode = (value: any) => (typeof value === 'object' ? value?.code : value);

const getLogText = (item: any) => {
    switch (item.activity || item.property) {
        case 'WITHDRAWAL_SLIP_CREATE':
            return `Tạo yêu cầu rút tiền ${item.code ? `#${item.code}` : ''}`;
        case 'WITHDRAWAL_SLIP_CANCELLED':
            return `Hủy yêu cầu rút tiền ${item.code ? `#${item.code}` : ''}`;
        case 'WITHDRAWAL_SLIP_STATUS_UPDATE':
            return `Thay đổi trạng thái từ ${item.oldStatusName || '---'} sang ${item.newStatusName || '---'}`;
        default:
            return item.activity || 'Cập nhật yêu cầu rút tiền';
    }
};

export const WithdrawalSlipCreateButton = ({ page, block = false }: { page: any; block?: boolean }) => (
    <Button type="primary" icon={<PlusOutlined />} onClick={page.openCreateModal} block={block}>
        Tạo yêu cầu rút tiền
    </Button>
);

export const WithdrawalSlipRowActions = ({ page, record }: { page: any; record: any }) => {
    const canCancel = getStatusCode(record.status) === 'PENDING';

    return (
        <Space size="small">
            {canCancel ? (
                <Popconfirm
                    title="Bạn có chắc muốn hủy yêu cầu rút tiền này?"
                    okText="Hủy yêu cầu"
                    cancelText="Đóng"
                    okButtonProps={{ danger: true, loading: page.isCancellingWithdrawalSlip }}
                    onConfirm={() => page.cancelWithdrawalSlip(record.code)}
                >
                    <Button danger type="link" size="small" icon={<StopOutlined />}>
                        Hủy
                    </Button>
                </Popconfirm>
            ) : null}
             <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => page.openLogModal(record.code)}>
                Log
            </Button>
        </Space>
    );
};

export const WithdrawalSlipCreateModal = ({ page }: { page: any }) => {
    const selectedBank = Form.useWatch('beneficiaryBank', page.createForm);
    const bankOptions = [
        ...(page.bankOptions || []),
        { label: 'Ngân hàng khác', value: 'other' },
    ];

    return (
        <Modal
            title="Tạo yêu cầu rút tiền"
            open={page.isCreateModalOpen}
            onCancel={page.closeCreateModal}
            onOk={page.submitCreateSlip}
            okText="Tạo yêu cầu"
            cancelText="Đóng"
            confirmLoading={page.isCreatingWithdrawalSlip}
            destroyOnClose
        >
            <Form form={page.createForm} layout="vertical" preserve={false}>
                <Descriptions column={1} size="small" className="mb-3">
                    <Descriptions.Item label="Số dư">
                        <Text strong>{moneyFormat(page.balanceData?.balance || 0)}</Text>
                    </Descriptions.Item>
                </Descriptions>
                <Form.Item name="amount" label="Số tiền" rules={[{ required: true, message: 'Nhập số tiền' }]}>
                    <LocaleInputNumber
                        min={1}
                        precision={0}
                        maximumFractionDigits={0}
                        className="w-full"
                        placeholder="Nhập số tiền"
                        controls={false}
                    />
                </Form.Item>
                <Form.Item name="beneficiaryName" label="Tên tài khoản" rules={[{ required: true, message: 'Nhập tên tài khoản' }]}>
                    <Input placeholder="Nhập tên tài khoản thụ hưởng" />
                </Form.Item>
                <Form.Item name="beneficiaryAccount" label="Số tài khoản" rules={[{ required: true, message: 'Nhập số tài khoản' }]}>
                    <Input placeholder="Nhập số tài khoản" />
                </Form.Item>
                <Form.Item name="beneficiaryBank" label="Ngân hàng" rules={[{ required: true, message: 'Chọn ngân hàng' }]}>
                    <Select showSearch optionFilterProp="label" options={bankOptions} placeholder="Chọn ngân hàng" />
                </Form.Item>
                {selectedBank === 'other' ? (
                    <Form.Item name="beneficiaryBankName" label="Tên ngân hàng" rules={[{ required: true, message: 'Nhập tên ngân hàng' }]}>
                        <Input placeholder="Nhập tên ngân hàng" />
                    </Form.Item>
                ) : null}
                <Form.Item name="beneficiaryBankBranch" label="Chi nhánh">
                    <Input placeholder="Nhập chi nhánh" />
                </Form.Item>
                <Form.Item name="memo" label="Nội dung">
                    <Input.TextArea rows={3} placeholder="Nhập nội dung" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export const WithdrawalSlipLogModal = ({ page }: { page: any }) => (
    <Modal
        title={`Log yêu cầu ${page.logCode ? `#${page.logCode}` : ''}`}
        open={page.isLogModalOpen}
        onCancel={page.closeLogModal}
        footer={null}
        destroyOnClose
    >
        {page.logs?.length ? (
            <Timeline
                items={page.logs.map((item: any) => ({
                    children: (
                        <Space direction="vertical" size={2}>
                            <Text strong>{getLogText(item)}</Text>
                            <Text type="secondary">
                                {item.actorName} - {item.timestamp ? dayjs(item.timestamp).format('HH:mm DD/MM/YYYY') : '---'}
                            </Text>
                        </Space>
                    ),
                }))}
            />
        ) : (
            <Empty description={page.isLogsLoading ? 'Đang tải log...' : 'Chưa có log'} />
        )}
    </Modal>
);
