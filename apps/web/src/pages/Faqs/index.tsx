import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

const modules = import.meta.glob('./*.tsx');

export const Faqs = () => {
    const variant = useVariant('faqs');
    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="FaqsStyle1"
            featureName="Faqs"
        />
    );
};
