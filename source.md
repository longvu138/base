# Tổng hợp các trang và API sử dụng

Dưới đây là danh sách các trang hiện có trong ứng dụng Web và các API tương ứng được sử dụng để xử lý dữ liệu.

## 1. Dashboard (`/dashboard`)
Trang tổng quan hiển thị các thông số thống kê và lối tắt.
- **API sử dụng:**
    - `OrderApi.getOrderStatistic()`: Lấy thống kê số lượng đơn hàng theo trạng thái.
    - `ShipmentApi.getShipmentStatistic()`: Lấy thống kê số lượng kiện hàng/vận đơn theo trạng thái.
    - `CustomerApi.getBalance()`: Lấy số dư tài khoản của khách hàng.

## 2. Orders (`/orders`)
Trang danh sách đơn hàng.
- **API sử dụng:**
    - `OrderApi.getOrders(params)`: Lấy danh sách đơn hàng (hỗ trợ phân trang, lọc, tìm kiếm).
    - `OrderApi.getOrderStatuses()`: Lấy danh mục các trạng thái đơn hàng để hiển thị bộ lọc.
    - `OrderApi.getWarehouse(delivered)`: Lấy danh sách kho nhận/kho đích.
    - `OrderApi.getMarketplaces()`: Lấy danh sách sàn thương mại điện tử (Taobao, Tmall, 1688...).

## 3. Order Detail (`/orders/:code`)
Trang chi tiết của một đơn hàng cụ thể.
- **API sử dụng:**
    - `OrderApi.getOrderDetail(code)`: Lấy thông tin chi tiết của đơn hàng (sản phẩm, tiền thanh toán, địa chỉ...).
    - `ChatApi.getComments(entityType, entityCode)`: Lấy lịch sử trao đổi/ghi chú của đơn hàng.
    - `ChatApi.createComment(...)`: Gửi trao đổi mới.

## 4. Shipments (`/shipments`)
Trang danh sách các đơn vận chuyển lẻ hoặc ký gửi.
- **API sử dụng:**
    - `ShipmentApi.getShipments(params)`: Lấy danh sách yêu cầu giao hàng/vận chuyển.
    - `ShipmentApi.getShipmentStatuses()`: Lấy danh mục các trạng thái vận chuyển.

## 5. Shipment Detail (`/shipments/:code`)
Trang chi tiết một vận đơn/lô hàng vận chuyển.
- **API sử dụng:**
    - `ShipmentApi.getShipmentDetail(code)`: Lấy chi tiết thông tin vận chuyển, mã vận đơn, khối lượng, phí ship.
    - `ChatApi`: Xử lý trao đổi tương tự đơn hàng.

## 6. Transactions (`/transactions`)
Trang quản lý các giao dịch tài chính, lịch sử biến động số dư.
- **API sử dụng:**
    - `TransactionApi.getWalletAccounts()`: Lấy danh sách các tài khoản ví.
    - `TransactionApi.getTransactions(accountId, params)`: Lấy lịch sử giao dịch của một ví cụ thể.
    - `TransactionApi.getTransactionTypes()`: Lấy danh mục các loại giao dịch (Nạp tiền, thanh toán đơn, hoàn tiền...).

## 7. Delivery Requests (`/delivery-requests`)
Trang quản lý yêu cầu giao hàng nội địa Việt Nam.
- **API sử dụng:**
    - `DeliveryRequestApi.getDeliveryRequests(params)`: Lấy danh sách yêu cầu giao hàng.

## 8. Delivery Notes (`/delivery-notes`)
Trang phiếu xuất kho / phiếu giao hàng.
- **API sử dụng:**
    - `DeliveryNoteApi.getDeliveryNotes(params)`: Lấy danh sách các phiếu xuất kho đã tạo.

## 9. Waybills (`/waybills`)
Trang quản lý mã vận đơn (tracking number).
- **API sử dụng:**
    - `WaybillApi.getWaybills(params)`: Lấy danh sách mã vận đơn của khách hàng.
    - `WaybillApi.getWaybillStatuses()`: Lấy danh mục trạng thái mã vận đơn.

## 10. Packages (`/packages`)
Trang quản lý các kiện hàng thực tế trong kho.
- **API sử dụng:**
    - `PackageApi.getPackages(params)`: Lấy danh sách kiện hàng.
    - `PackageApi.getPackageStatuses()`: Lấy các trạng thái kiện hàng (Đã về kho TQ, Đã về kho VN...).

## 11. Vouchers (`/vouchers`)
Trang danh sách mã giảm giá của khách hàng.
- **API sử dụng:**
    - `VoucherApi.getVouchers(params)`: Lấy danh sách các mã ưu đãi khách hàng đang sở hữu.

## 12. Address (`/address`)
Trang quản lý địa chỉ nhận hàng.
- **API sử dụng:**
    - `AddressApi.getAddresses(params)`: Lấy danh sách địa chỉ đã lưu.
    - `AddressApi.getLocations(params)`: Lấy danh mục địa lý (Tỉnh/Huyện/Xã) từ đối tác/hệ thống.
    - `AddressApi.createAddress / updateAddress / deleteAddress`: Các thao tác CRUD địa chỉ.

## 13. Wishlist (`/wishlist`)
Trang sản phẩm yêu thích (đã lưu).
- **API sử dụng:**
    - `WishlistApi.getWishlist(params)`: Lấy danh sách sản phẩm khách đã đánh dấu yêu thích.
    - `WishlistApi.deleteWishlistItem(id)`: Xóa sản phẩm khỏi danh sách.

## 14. FAQs (`/faqs`)
Trang hướng dẫn và các câu hỏi thường gặp.
- **API sử dụng:**
    - `FaqApi.getFaqs(params)`: Lấy danh sách các bài viết hướng dẫn theo vị trí sắp xếp.

## 15. Profile (`/profile`)
Trang thông tin cá nhân khách hàng.
- **API sử dụng:**
    - `CustomerApi.getProfile()`: Lấy thông tin cơ bản (họ tên, email, avatar).
    - `CustomerApi.updateProfile(payload)`: Cập nhật thông tin cá nhân.

## 16. Login (`/login`)
Trang đăng nhập hệ thống.
- **API sử dụng:**
    - `LoginApi.login(data)`: Thực hiện xác thực và lấy Access Token.
