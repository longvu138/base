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
    gd2: {
        componentOverrides: {
            layout: 'ThanhlaLayout',
            login: 'LoginStyle2',
            register: 'RegisterStyle2',
            dashboard: 'DashboardStyle2',
            orders: 'OrdersStyle2',
            orderDetail: 'OrderDetailStyle2',
            shipments: 'ShipmentsStyle2',
            shipmentDetail: 'ShipmentDetailStyle2',
            claims: 'ClaimsStyle2',
            packages: 'PackagesStyle2',
            transactions: 'TransactionsStyle2',
            deliveryRequests: 'DeliveryRequestsStyle2',
            deliveryNotes: 'DeliveryNotesStyle2',
            withdrawalSlips: 'WithdrawalSlipsStyle2',
            vouchers: 'VouchersStyle2',
            wishlist: 'WishlistStyle2',
            waybills: 'WaybillsStyle2',
            profile: 'ProfileStyle2',
            address: 'AddressStyle2',
            faqs: 'FaqsStyle2',
        },
        menu: {
            preset: 'base',
            hiddenKeys: [],
            labelOverrides: {},
        },
        features: {
            shipmentStatusDisplay: 'filter',
        },
    },
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
