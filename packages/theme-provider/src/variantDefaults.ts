export interface VariantMenuDefaults {
    preset: 'base' | 'gobiz';
    hiddenKeys?: string[];
    labelOverrides?: Record<string, string>;
}

export interface VariantFeatureDefaults {
    shipmentStatusDisplay?: 'tabs' | 'filter';
}

export interface VariantDefaults {
    componentOverrides?: Record<string, string>;
    menu?: VariantMenuDefaults;
    features?: VariantFeatureDefaults;
}

const DEFAULTS: VariantDefaults = {
    componentOverrides: {},
    menu: {
        preset: 'base',
        hiddenKeys: [],
        labelOverrides: {},
    },
    features: {
        shipmentStatusDisplay: 'filter',
    },
};

const VARIANT_DEFAULTS: Record<string, VariantDefaults> = {
    gd3: {
        componentOverrides: {
            layout: 'SpecializedLayout',
            orders: 'OrdersCombined',
        },
        menu: {
            preset: 'gobiz',
            hiddenKeys: ['/shipments'],
            labelOverrides: { '/orders': 'Quản lý Tổng hợp' },
        },
        features: {
            shipmentStatusDisplay: 'tabs',
        },
    },
};

export function getVariantDefaults(variantCode?: string): VariantDefaults {
    if (!variantCode) return DEFAULTS;
    return VARIANT_DEFAULTS[variantCode] || DEFAULTS;
}
