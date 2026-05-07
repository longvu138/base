import React from 'react';
import { useVariant } from '@repo/theme-provider';
import { DynamicVariant } from '@repo/ui';

// Move glob OUTSIDE the component so it's created once (stable reference)
// This prevents DynamicVariant from recreating React.lazy on every re-render
const modules = import.meta.glob('./*.tsx');

const ShipmentsPage: React.FC<any> = (props) => {
    const variant = useVariant('shipments');

    return (
        <DynamicVariant
            variantName={variant}
            modules={modules}
            fallbackName="Shipments"
            featureName="Shipments"
            componentProps={props}
        />
    );
};

export const Shipments = ShipmentsPage;
