import { useAddressLogic } from '@repo/hooks';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

const modules = import.meta.glob('./*.tsx');

const AddressPage = () => {
    const variant = useVariant('address');
    const { addressData, isAddressLoading } = useAddressLogic();

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold mb-0">Địa chỉ nhận hàng</h1>
                    <span className="text-[10px] text-gray-400 italic">
                        Variant: <strong className="text-primary">{variant}</strong>
                    </span>
                </div>

                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="AddressStyle1"
                    featureName="Address"
                    componentProps={{
                        addresses: addressData?.data,
                        isLoading: isAddressLoading
                    }}
                />
            </div>
        </div>
    );
};

export default AddressPage;
