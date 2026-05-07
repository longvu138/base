import React from 'react';
import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

const ProfilePage: React.FC<any> = (props) => {
    const variant = useVariant('profile');

    // Quét tất cả file .tsx trong thư mục này để load động
    const modules = import.meta.glob('./*.tsx');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="ProfileStyle1"
            featureName="Profile"
            componentProps={props}
        />
    );
};

export default ProfilePage;
