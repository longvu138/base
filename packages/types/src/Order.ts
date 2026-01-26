export interface ICustomerAuthorities {
    importParcel: boolean;
    printParcelStamp: boolean;
    draftServicesEnable: boolean;
    openAPI: boolean;
    editCart: boolean;
    shopkeeper: boolean;
}

export interface ICustomer {
    avatar: string;
    balance: number;
    code: string;
    contactAddress: string;
    customerAuthorities: ICustomerAuthorities;
    customerEmdLevel: null | string;
    customerGroup: null | string;
    customerLevel: null | string;
    customerStatus: string;
    dob: string;
    email: string;
    fullname: string;
    gender: string;
    id: number;
    nickname: string;
    peerPaymentConfigGroupId: null | string;
    phone: string;
    rewardPoint: null | number;
    token: null | string;
    username: string;
    zaloId: null | string;
}

export interface IOrder {
    createdAt: string;
    createdBy: string;
    modifiedAt: string;
    id: number;
    code: string;
    customer: ICustomer;
    status: string;
    remark: string;
    note: string;
    image: string;
    receivingWarehouse: any;
    deliveryWarehouse: any;
    totalValue: number;
    totalFee: number;
    totalPaid: number;
    totalClaim: number;
    totalUnpaid: number;
    cogsAmount: number;
    grandTotal: number;
    waybillCodes: string[] | null;
}

export interface IStatus {
    id: number;
    code: string;
    name: string;
    color: string;
    position: number;
}
