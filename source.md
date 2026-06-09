# Tá»•ng há»£p cÃ¡c trang vÃ  API sá»­ dá»¥ng

DÆ°á»›i Ä‘Ã¢y lÃ  danh sÃ¡ch cÃ¡c trang hiá»‡n cÃ³ trong á»©ng dá»¥ng Web vÃ  cÃ¡c API tÆ°Æ¡ng á»©ng Ä‘Æ°á»£c sá»­ dá»¥ng Ä‘á»ƒ xá»­ lÃ½ dá»¯ liá»‡u.

## 1. Dashboard (`/dashboard`)
Trang tá»•ng quan hiá»ƒn thá»‹ cÃ¡c thÃ´ng sá»‘ thá»‘ng kÃª vÃ  lá»‘i táº¯t.
- **API sá»­ dá»¥ng:**
    - `OrderApi.getOrderStatistic()`: Láº¥y thá»‘ng kÃª sá»‘ lÆ°á»£ng Ä‘Æ¡n hÃ ng theo tráº¡ng thÃ¡i.
    - `ShipmentApi.getShipmentStatistic()`: Láº¥y thá»‘ng kÃª sá»‘ lÆ°á»£ng kiá»‡n hÃ ng/váº­n Ä‘Æ¡n theo tráº¡ng thÃ¡i.
    - `CustomerApi.getBalance()`: Láº¥y sá»‘ dÆ° tÃ i khoáº£n cá»§a khÃ¡ch hÃ ng.

## 2. Orders (`/orders`)
Trang danh sÃ¡ch Ä‘Æ¡n hÃ ng.
- **API sá»­ dá»¥ng:**
    - `OrderApi.getOrders(params)`: Láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng (há»— trá»£ phÃ¢n trang, lá»c, tÃ¬m kiáº¿m).
    - `OrderApi.getOrderStatuses()`: Láº¥y danh má»¥c cÃ¡c tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng Ä‘á»ƒ hiá»ƒn thá»‹ bá»™ lá»c.
    - `OrderApi.getWarehouse(delivered)`: Láº¥y danh sÃ¡ch kho nháº­n/kho Ä‘Ã­ch.
    - `OrderApi.getMarketplaces()`: Láº¥y danh sÃ¡ch sÃ n thÆ°Æ¡ng máº¡i Ä‘iá»‡n tá»­ (Taobao, Tmall, 1688...).

## 3. Order Detail (`/orders/:code`)
Trang chi tiáº¿t cá»§a má»™t Ä‘Æ¡n hÃ ng cá»¥ thá»ƒ.
- **API sá»­ dá»¥ng:**
    - `OrderApi.getOrderDetail(code)`: Láº¥y thÃ´ng tin chi tiáº¿t cá»§a Ä‘Æ¡n hÃ ng (sáº£n pháº©m, tiá»n thanh toÃ¡n, Ä‘á»‹a chá»‰...).
    - `ChatApi.getComments(entityType, entityCode)`: Láº¥y lá»‹ch sá»­ trao Ä‘á»•i/ghi chÃº cá»§a Ä‘Æ¡n hÃ ng.
    - `ChatApi.createComment(...)`: Gá»­i trao Ä‘á»•i má»›i.

## 4. Shipments (`/shipments`)
Trang danh sÃ¡ch cÃ¡c Ä‘Æ¡n váº­n chuyá»ƒn láº» hoáº·c kÃ½ gá»­i.
- **API sá»­ dá»¥ng:**
    - `ShipmentApi.getShipments(params)`: Láº¥y danh sÃ¡ch yÃªu cáº§u giao hÃ ng/váº­n chuyá»ƒn.
    - `ShipmentApi.getShipmentStatuses()`: Láº¥y danh má»¥c cÃ¡c tráº¡ng thÃ¡i váº­n chuyá»ƒn.

## 5. Shipment Detail (`/shipments/:code`)
Trang chi tiáº¿t má»™t váº­n Ä‘Æ¡n/lÃ´ hÃ ng váº­n chuyá»ƒn.
- **API sá»­ dá»¥ng:**
    - `ShipmentApi.getShipmentDetail(code)`: Láº¥y chi tiáº¿t thÃ´ng tin váº­n chuyá»ƒn, mÃ£ váº­n Ä‘Æ¡n, khá»‘i lÆ°á»£ng, phÃ­ ship.
    - `ChatApi`: Xá»­ lÃ½ trao Ä‘á»•i tÆ°Æ¡ng tá»± Ä‘Æ¡n hÃ ng.

## 6. Transactions (`/transactions`)
Trang quáº£n lÃ½ cÃ¡c giao dá»‹ch tÃ i chÃ­nh, lá»‹ch sá»­ biáº¿n Ä‘á»™ng sá»‘ dÆ°.
- **API sá»­ dá»¥ng:**
    - `TransactionApi.getWalletAccounts()`: Láº¥y danh sÃ¡ch cÃ¡c tÃ i khoáº£n vÃ­.
    - `TransactionApi.getTransactions(accountId, params)`: Láº¥y lá»‹ch sá»­ giao dá»‹ch cá»§a má»™t vÃ­ cá»¥ thá»ƒ.
    - `TransactionApi.getTransactionTypes()`: Láº¥y danh má»¥c cÃ¡c loáº¡i giao dá»‹ch (Náº¡p tiá»n, thanh toÃ¡n Ä‘Æ¡n, hoÃ n tiá»n...).

## 7. Delivery Requests (`/delivery-requests`)
Trang quáº£n lÃ½ yÃªu cáº§u giao hÃ ng ná»™i Ä‘á»‹a Viá»‡t Nam.
- **API sá»­ dá»¥ng:**
    - `DeliveryRequestApi.getDeliveryRequests(params)`: Láº¥y danh sÃ¡ch yÃªu cáº§u giao hÃ ng.

## 9. Waybills (`/waybills`)
Trang quáº£n lÃ½ mÃ£ váº­n Ä‘Æ¡n (tracking number).
- **API sá»­ dá»¥ng:**
    - `WaybillApi.getWaybills(params)`: Láº¥y danh sÃ¡ch mÃ£ váº­n Ä‘Æ¡n cá»§a khÃ¡ch hÃ ng.
    - `WaybillApi.getWaybillStatuses()`: Láº¥y danh má»¥c tráº¡ng thÃ¡i mÃ£ váº­n Ä‘Æ¡n.

## 10. Packages (`/packages`)
Trang quáº£n lÃ½ cÃ¡c kiá»‡n hÃ ng thá»±c táº¿ trong kho.
- **API sá»­ dá»¥ng:**
    - `PackageApi.getPackages(params)`: Láº¥y danh sÃ¡ch kiá»‡n hÃ ng.
    - `PackageApi.getPackageStatuses()`: Láº¥y cÃ¡c tráº¡ng thÃ¡i kiá»‡n hÃ ng (ÄÃ£ vá» kho TQ, ÄÃ£ vá» kho VN...).

## 11. Vouchers (`/vouchers`)
Trang danh sÃ¡ch mÃ£ giáº£m giÃ¡ cá»§a khÃ¡ch hÃ ng.
- **API sá»­ dá»¥ng:**
    - `VoucherApi.getVouchers(params)`: Láº¥y danh sÃ¡ch cÃ¡c mÃ£ Æ°u Ä‘Ã£i khÃ¡ch hÃ ng Ä‘ang sá»Ÿ há»¯u.

## 12. Address (`/address`)
Trang quáº£n lÃ½ Ä‘á»‹a chá»‰ nháº­n hÃ ng.
- **API sá»­ dá»¥ng:**
    - `AddressApi.getAddresses(params)`: Láº¥y danh sÃ¡ch Ä‘á»‹a chá»‰ Ä‘Ã£ lÆ°u.
    - `AddressApi.getLocations(params)`: Láº¥y danh má»¥c Ä‘á»‹a lÃ½ (Tá»‰nh/Huyá»‡n/XÃ£) tá»« Ä‘á»‘i tÃ¡c/há»‡ thá»‘ng.
    - `AddressApi.createAddress / updateAddress / deleteAddress`: CÃ¡c thao tÃ¡c CRUD Ä‘á»‹a chá»‰.

## 13. Wishlist (`/wishlist`)
Trang sáº£n pháº©m yÃªu thÃ­ch (Ä‘Ã£ lÆ°u).
- **API sá»­ dá»¥ng:**
    - `WishlistApi.getWishlist(params)`: Láº¥y danh sÃ¡ch sáº£n pháº©m khÃ¡ch Ä‘Ã£ Ä‘Ã¡nh dáº¥u yÃªu thÃ­ch.
    - `WishlistApi.deleteWishlistItem(id)`: XÃ³a sáº£n pháº©m khá»i danh sÃ¡ch.

## 14. FAQs (`/faqs`)
Trang hÆ°á»›ng dáº«n vÃ  cÃ¡c cÃ¢u há»i thÆ°á»ng gáº·p.
- **API sá»­ dá»¥ng:**
    - `FaqApi.getFaqs(params)`: Láº¥y danh sÃ¡ch cÃ¡c bÃ i viáº¿t hÆ°á»›ng dáº«n theo vá»‹ trÃ­ sáº¯p xáº¿p.

## 15. Profile (`/profile`)
Trang thÃ´ng tin cÃ¡ nhÃ¢n khÃ¡ch hÃ ng.
- **API sá»­ dá»¥ng:**
    - `CustomerApi.getProfile()`: Láº¥y thÃ´ng tin cÆ¡ báº£n (há» tÃªn, email, avatar).
    - `CustomerApi.updateProfile(payload)`: Cáº­p nháº­t thÃ´ng tin cÃ¡ nhÃ¢n.

## 16. Login (`/login`)
Trang Ä‘Äƒng nháº­p há»‡ thá»‘ng.
- **API sá»­ dá»¥ng:**
    - `LoginApi.login(data)`: Thá»±c hiá»‡n xÃ¡c thá»±c vÃ  láº¥y Access Token.
