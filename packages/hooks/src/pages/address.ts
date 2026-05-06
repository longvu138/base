import { useMemo } from 'react';
import { useAddressesQuery, useDeleteAddressMutation } from '../useAddressHooks';

export interface UseAddressLogicProps {
    keyword?: string;
}

/**
 * Logic dùng chung cho trang Địa chỉ
 */
export const useAddressLogic = ({ keyword }: UseAddressLogicProps = {}) => {
    const apiParams = useMemo(() => ({
        page: 0,
        size: 1000,
        receivingAddress: false,
        sort: 'defaultAddress:desc,createdAt:desc',
    }), []);

    const { data: addressData, isLoading: isAddressLoading } = useAddressesQuery(apiParams);
    const deleteAddressMutation = useDeleteAddressMutation();

    // Logic lọc phía client-side
    const filteredAddresses = useMemo(() => {
        const all = addressData?.data ?? [];
        if (!keyword?.trim()) return all;
        const kw = keyword.trim().toLowerCase();
        return all.filter((item: any) => {
            const name = (item.name || item.fullName || '').toLowerCase();
            const phone = (item.phone || '').toLowerCase();
            const address = [item.address, item.wardName, item.districtName, item.provinceName]
                .filter(Boolean).join(' ').toLowerCase();
            return name.includes(kw) || phone.includes(kw) || address.includes(kw);
        });
    }, [addressData?.data, keyword]);

    return {
        addressData,
        isAddressLoading,
        filteredAddresses,
        deleteAddressMutation,
        apiParams
    };
};
