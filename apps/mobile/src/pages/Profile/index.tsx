import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

const modules = import.meta.glob('./*.tsx');

const ProfilePage = () => {
    const variant = useVariant('profile', 'ProfileStyleDefault');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="ProfileStyleDefault"
            featureName="Profile"
        />
    );
};

export default ProfilePage;
