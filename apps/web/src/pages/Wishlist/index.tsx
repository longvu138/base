import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '../../components/Common/DynamicVariant';

const modules = import.meta.glob('./*.tsx');

export const Wishlist = () => {
    const variant = useVariant('wishlist');
    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="WishlistStyle1"
            featureName="Wishlist"
        />
    );
};
