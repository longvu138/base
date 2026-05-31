export type NotificationItem = {
  id: string | number;
  read?: boolean;
  messageData?: string;
  publishDate?: string;
  eventCode?: string;
  refData?: {
    order?: {
      code?: string;
      image?: string;
      isShipment?: boolean;
      updatedPackageCode?: string;
    };
    deliveryRequest?: {
      code?: string;
    };
  };
};

export type NotificationEventGroup = {
  code?: string;
  name?: string;
};
