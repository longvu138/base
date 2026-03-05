---
description: Spec tạo trang mới — điền YAML ở cuối file rồi nhắn "tạo trang mới theo new-page.md"
---

# Naming convention nhanh
# pageKey (camelCase) → PascalKey → {PascalKey}Style1 / Style3 / Api / Hooks
# route: kebab-case, menu_icon: Ant Design icon name

# ──────────────────────────────────────────────
# PAGES HIỆN TẠI
# ──────────────────────────────────────────────

pages:

  - pageKey: orders
    route: /orders
    menu_label: Đơn hàng
    menu_style1: true
    menu_style3: true
    api_class: OrderApi
    endpoints:
      list:    customer/orders
      status:  categories/public_order_statuses?size=1000&sort=position:asc
      stat:    customer/orders/statistics
      service: categories/order_services?size=1000
      market:  categories/marketplaces?size=1000
    sort_default: createdAt:desc
    filters: [query, statuses[], code, note, dateRange→createdAtFrom/To, receivingWarehouse, shopName, financialPayment, marketplaces[], services[], stuckStatus, stuckRange, stuckFrom, stuckTo, timeType, timeStart, timeEnd]

  - pageKey: shipments
    route: /shipments
    menu_label: Vận chuyển
    menu_style1: true
    menu_style3: true
    api_class: ShipmentApi
    endpoints:
      list:    customer/shipments
      status:  categories/public_shipment_statuses?size=1000&sort=position:asc
      stat:    customer/shipments/statistics
      service: categories/shipment_services?size=1000&sort=position:asc
    sort_default: createdAt:desc
    filters: [query, statuses[], code, dateRange→createdAtFrom/To, waybillCode, originalInvoiceCode, shopName, orderCode, customerCode, services[], stuckStatus, period, from, to]

  - pageKey: transactions
    route: /transactions
    menu_label: Giao dịch
    menu_style1: true
    menu_style3: true   # gd3: gom /transactions + /withdrawal-slips thành 1 mục
    note_style3: >
      TransactionsStyle3 là wrapper gom 2 tab:
        tab 1 - Lịch sử giao dịch → <TransactionHistoryPanel>
        tab 2 - Yêu cầu rút tiền  → <WithdrawalSlipStyle3 isTabView>
    api_class: TransactionApi
    endpoints:
      accounts: customer/wallet/accounts
      list:     customer/wallet/accounts/{accountId}/transactions
      types:    categories/financial_types?size=1000
      export:   customer/wallet/accounts/{accountId}/transactions/export
    note: Cần chọn accountId trước khi gọi list

  - pageKey: withdrawalSlips
    route: /withdrawal-slips
    menu_label: Rút tiền
    menu_style1: true
    menu_style3: false   # gd3: nhúng vào tab 2 của /transactions
    embed_in: transactions (tab 2 — WithdrawalSlipStyle3 isTabView=true)
    api_class: WithdrawalSlipApi
    endpoints:
      list:   customer/withdrawal_slip
      stat:   customer/withdrawal_slip/statistics
      status: categories/withdrawal_slip_public_status
      banks:  categories/banks
    filters: [statuses[], code, dateRange→createdAtFrom/To, bankId]

  - pageKey: claims
    route: /claims
    menu_label: Khiếu nại
    menu_style1: true
    menu_style3: true
    api_class: ClaimApi
    endpoints:
      list:      customer/canines/claims
      status:    category/canines/ticket_statuses?size=1000
      solutions: category/canines/solutions?ticketTypes[]=order&ticketTypes[]=shipment
    sort_default: createdAt:desc
    filters: [publicStates[], ticketTypes[], solutionCodes[], code, relatedOrder, relatedProduct]

  - pageKey: withdrawalSlips
    route: /withdrawal-slips
    menu_label: Rút tiền
    menu_style1: true
    menu_style3: true
    api_class: WithdrawalSlipApi
    endpoints:
      list:   customer/withdrawal_slip
      stat:   customer/withdrawal_slip/statistics
      status: categories/withdrawal_slip_public_status
      banks:  categories/banks
    filters: [statuses[], code, dateRange→createdAtFrom/To, bankId]

  - pageKey: packages
    route: /packages
    menu_label_style1: Kiện hàng
    menu_label_style3: Quản lý giao hàng
    menu_style1: true
    menu_style3: true
    api_class: PackageApi
    endpoints:
      list:   customer/packages
      status: categories/public_package_statuses?size=1000&sort=position:asc
    note_style3: PackagesStyle3 gom 3 tab (Kiện hàng / Yêu cầu giao / Phiếu xuất)

  - pageKey: deliveryRequests
    route: /delivery-requests
    menu_label: Yêu cầu giao hàng
    menu_style1: true
    menu_style3: false
    embed_in: packages (tab 2 trong PackagesStyle3)
    api_class: DeliveryRequestApi
    endpoints:
      list:   customer/delivery_requests
      status: categories/delivery_request_statuses?size=1000&sort=position:asc
    sort_default: createdAt:desc
    filters: [statuses[], code, dateRange]

  - pageKey: deliveryNotes
    route: /delivery-notes
    menu_label: Phiếu xuất
    menu_style1: true
    menu_style3: false
    embed_in: packages (tab 3 trong PackagesStyle3)
    api_class: DeliveryNoteApi
    endpoints:
      list: customer/delivery_notes?sort=exported_at:desc
    sort_default: exported_at:desc
    filters: [code, dateRange→exportedAtFrom/exportedAtTo]

  - pageKey: waybills
    route: /waybills
    menu_label: Mã vận đơn
    menu_style1: true
    menu_style3: true
    api_class: WaybillApi
    endpoints:
      list:   customer/customer_waybills?sort=createdAt:desc
      status: categories/customer_waybill_status?size=1000&sort=position:asc
    sort_default: createdAt:desc
    filters: [query, statuses[], dateRange→receivedTimeFrom/receivedTimeTo]


# ──────────────────────────────────────────────
# THÊM TRANG MỚI — điền bên dưới
# ──────────────────────────────────────────────

new_pages:

  # - pageKey:
  #   route:
  #   menu_label:
  #   menu_icon:         # Ant Design icon
  #   menu_style1:       # true/false
  #   menu_style3:       # true/false
  #   embed_in:          # tên trang cha + tab label (nếu nhúng vào tab)
  #   api_class:
  #   endpoints:
  #     list:            # GET path?sort=...
  #     status:          # GET path (nếu có)
  #   sort_default:
  #   filters:           # [field, arr[]→join, dateRange→from/to]
  #   columns:
  #     - field: code    label: "Mã..."   bold: true
  #     - field: status  label: Trạng thái  type: tag
  #     - field: amount  label: Số tiền     type: currency
  #     - field: createdAt label: Ngày tạo  type: date
  #   notes:

- pageKey: vouchers
    route: /vouchers
    menu_label: mã giảm giá
    menu_style1: true
    menu_style3: true
    api_class: voucherApi
    endpoints:
      list: https://poseidon.20p.gobizdev.com/api/customer/customer_coupon?page=0&size=20