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
    thanhla: {
        componentOverrides: {
            layout: 'LayoutStyleThanhla',
            login: 'LoginStyleThanhla',
            register: 'RegisterStyleThanhla',
            dashboard: 'DashboardStyleThanhla',
            orders: 'OrdersStyleThanhla',
            orderDetail: 'OrderDetailStyleThanhla',
            shipments: 'ShipmentsStyleThanhla',
            createShipment: 'CreateShipmentStyleThanhla',
            shipmentDetail: 'ShipmentDetailStyleThanhla',
            claims: 'ClaimsStyleThanhla',
            packages: 'PackagesStyleThanhla',
            deliveryRequests: 'DeliveryRequestsStyleThanhla',
            createClaim: 'CreateClaimStyleThanhla',
            deliveryNotes: 'DeliveryNotesStyleThanhla',
            withdrawalSlips: 'WithdrawalSlipsStyleThanhla',
            waybills: 'WaybillsStyleThanhla',
            profile: 'ProfileStyleThanhla',
            notifications: 'NotificationsStyleThanhla',
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
    gobiz: {
        componentOverrides: {
            layout: 'LayoutStyleGobiz',
            login: 'LoginStyleGobiz',
            register: 'RegisterStyleGobiz',
            dashboard: 'DashboardStyleGobiz',
            orders: 'OrdersStyleGobizCombined',
            orderDetail: 'OrderDetailStyleGobiz',
            shipments: 'ShipmentsStyleGobiz',
            createShipment: 'CreateShipmentStyleGobiz',
            shipmentDetail: 'ShipmentDetailStyleGobiz',
            claims: 'ClaimsStyleGobiz',
            packages: 'PackagesStyleGobiz',
            deliveryRequests: 'DeliveryRequestsStyleGobiz',
            deliveryNotes: 'DeliveryNotesStyleGobiz',
            withdrawalSlips: 'WithdrawalSlipsStyleGobiz',
            waybills: 'WaybillsStyleGobiz',
            profile: 'ProfileStyleGobiz',
            notifications: 'NotificationsStyleGobiz',
            createClaim: 'CreateClaimStyleGobiz',
            address: 'AddressStyleGobiz',
            transactions: 'TransactionsStyleGobiz',
            wishlist: 'WishlistStyleGobiz',
        },
        menu: {
            preset: 'gobiz',
            hiddenKeys: [],
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
