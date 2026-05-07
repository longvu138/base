import { usePaginationWithURL, useFilterWithURL, useFaqsLogic } from '@repo/hooks';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

const modules = import.meta.glob('./*.tsx');

const FaqsPage = () => {
    const variant = useVariant('faqs');
    const { page, pageSize } = usePaginationWithURL();
    const { filters } = useFilterWithURL({ form: undefined as any });
    const { faqsData, isFaqsLoading } = useFaqsLogic({ page, pageSize, filters });

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Câu hỏi thường gặp</h1>
                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="FaqsStyle1"
                    featureName="Faqs"
                    componentProps={{ 
                        faqs: faqsData?.data, 
                        isLoading: isFaqsLoading 
                    }}
                />
            </div>
        </div>
    );
};

export default FaqsPage;
