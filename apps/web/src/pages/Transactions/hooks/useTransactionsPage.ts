import { Form, message } from 'antd';
import { 
    useFilterWithURL, 
    usePaginationWithURL,
    useTransactionsLogic 
} from '@repo/hooks';
import { TransactionApi } from '@repo/api';

/**
 * Web-specific orchestration for Transactions Page
 */
export const useTransactionsPage = () => {
    const [form] = Form.useForm();

    const { page, pageSize, setPage, setPageSize } = usePaginationWithURL({
        defaultPage: 1,
        defaultPageSize: 20
    });

    const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

    // Trang này cần accountId từ danh sách ví
    // Đây là trường hợp đặc biệt vì nó phụ thuộc vào kết quả của một query khác
    const logic = useTransactionsLogic({ page, pageSize, filters });
    
    // Tự động chọn accountId nếu logic trả về tài khoản mặc định
    const accountId = logic.defaultAccount?.account;

    // Sử dụng logic với accountId (logic sẽ tự xử lý bên trong)
    const finalLogic = useTransactionsLogic({ accountId, page, pageSize, filters });

    const handleSearch = () => {
        applyFilters(form.getFieldsValue());
    };

    const handleReset = () => {
        clearFilters();
    };

    const handleExport = async () => {
        if (!accountId) return;
        try {
            const response = await TransactionApi.exportTransactions(accountId, finalLogic.apiParams);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success('Đang tải file export...');
        } catch (error) {
            console.error('Export failed:', error);
            message.error('Lỗi khi xuất file!');
        }
    };

    return {
        form,
        page,
        pageSize,
        setPage,
        setPageSize,
        ...finalLogic,
        // Alias để các component dùng thống nhất
        listData: finalLogic.transactionData,
        isTransactionsLoading: finalLogic.isTransactionLoading,
        filters,
        applyFilters,
        handleSearch,
        handleReset,
        handleExport,
        accountId
    };
};
