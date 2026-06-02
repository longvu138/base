import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Empty,
  Flex,
  Image,
  Input,
  Modal,
  Radio,
  Row,
  Space,
  Spin,
  Table,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  CloseOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { useTranslation } from "@repo/i18n";
import { formatCurrency, moneyCeil } from "@repo/util";
import DepositModal from "../../components/DepositModal";
import {
  getForeignCurrency,
  getImage,
  getName,
  getProductUrl,
  getProperties,
} from "../Carts/cartViewModel";
import { DeliveryAddressPanel } from "./components/DeliveryAddressPanel";
import { DraftOrderVoucherModal } from "./components/DraftOrderVoucherModal";
import {
  BIFFIN_METHOD_SELECTED,
  DEFAULT_METHOD_SELECTED,
  getSkus,
  percentToMoney,
  useCartCheckoutPage,
} from "./hooks/useCartCheckoutPage";

const MONEY_TEXT_STYLE = { whiteSpace: "nowrap" };

export const CartCheckoutStyleDefault = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const page = useCartCheckoutPage();
  const {
    addresses,
    appliedVouchers,
    balance,
    biffinOptions,
    canRechargeForDeposit,
    createOrder,
    crossedThresholdMerchants,
    currentProjectInfo,
    demandDepositPercentages,
    depositExpanded,
    depositMethodValue,
    depositModalOpen,
    depositOnDemand,
    draftOrder,
    draftOrderId,
    generalConfig,
    handleChangeBiffinOption,
    handleChangeDepositPercent,
    hasDepositOptions,
    isBiffinLoading,
    isConnectedBiffin,
    isDraftOrderLoanable,
    isEnabledBiffin,
    isFetchingAddresses,
    isFetchingReceivingAddresses,
    isLoading,
    isOrderButtonDisabled,
    isUpdatingDraftOrder,
    isUsingReceiveAddress,
    lackOfMoney,
    merchants,
    openConnectBiffin,
    pin,
    pinError,
    pinOpen,
    receivingAddresses,
    removeReceiveAddress,
    savePassword,
    selectAddress,
    selectReceiveAddress,
    selectedAddressData,
    selectedAddressId,
    selectedBiffinMoney,
    selectedBiffinPercent,
    selectedCustomerPercent,
    selectedReceiveAddressData,
    selectedReceiveAddressId,
    setAppliedVouchers,
    setDepositExpanded,
    setDepositModalOpen,
    setPin,
    setPinError,
    setPinOpen,
    setSavePassword,
    setVoucherOpen,
    showDefaultDepositOption,
    sortedMerchants,
    submitOrder,
    tenantPercent,
    totalCoupon,
    totalLackOfMoney,
    totalLink,
    totalQuantity,
    voucherOpen,
  } = page;

  if (isLoading) return <Spin />;
  if (!draftOrder) return <Empty description={t("message.empty")} />;

  const columns = [
    {
      title: t("cartCheckout.product_info"),
      key: "product",
      width: 520,
      render: (_: unknown, sku: any) => {
        const image = getImage(sku);
        const productUrl = getProductUrl(sku);
        return (
          <Flex
            align="start"
            gap={token.marginSM}
            style={{ minWidth: 0, width: "100%" }}
          >
            {image ? (
              <Image
                width={56}
                height={56}
                preview
                src={image}
                referrerPolicy="no-referrer"
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  objectFit: "cover",
                }}
              />
            ) : (
              <Avatar
                shape="square"
                size={56}
                icon={<ShoppingCartOutlined />}
              />
            )}
            <Space
              direction="vertical"
              size={0}
              style={{ flex: "1 1 0", minWidth: 0, width: "100%" }}
            >
              <Typography.Text
                strong
                ellipsis={{ tooltip: getName(sku, true) }}
                style={{ display: "block", width: "100%" }}
              >
                {productUrl ? (
                  <a href={productUrl} target="_blank" rel="noreferrer">
                    {getName(sku, true)}
                  </a>
                ) : (
                  getName(sku, true)
                )}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                ellipsis={{ tooltip: getProperties(sku, true) || "---" }}
                style={{ display: "block", width: "100%" }}
              >
                {getProperties(sku, true) || "---"}
              </Typography.Text>
              {sku.remark && (
                <Typography.Text
                  ellipsis={{ tooltip: sku.remark }}
                  style={{ display: "block", width: "100%" }}
                >
                  <Typography.Text type="secondary">
                    {t("cartCheckout.product_note")}:{" "}
                  </Typography.Text>
                  {sku.remark}
                </Typography.Text>
              )}
              {sku.note && (
                <Typography.Text
                  ellipsis={{ tooltip: sku.note }}
                  style={{ display: "block", width: "100%" }}
                >
                  <Typography.Text type="secondary">
                    {t("cartCheckout.personal_product_note")}:{" "}
                  </Typography.Text>
                  {sku.note}
                </Typography.Text>
              )}
            </Space>
          </Flex>
        );
      },
    },
    {
      title: t("cartCheckout.provisional_cal"),
      key: "amount",
      width: 160,
      align: "right" as const,
      render: (_: unknown, sku: any) => (
        <Space direction="vertical" size={0} align="end">
          <Typography.Text strong style={MONEY_TEXT_STYLE}>
            {formatCurrency(sku.exchangedTotalAmount || 0)}
          </Typography.Text>
          <Typography.Text type="secondary" style={MONEY_TEXT_STYLE}>
            {formatCurrency(sku.totalAmount || 0, getForeignCurrency(sku))}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: t("cartCheckout.quantity"),
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      render: (quantity: number) => (
        <Typography.Text>
          {quantity || 0} {t("cartCheckout.product")}
        </Typography.Text>
      ),
    },
  ];

  return (
    <div style={{ paddingBottom: token.paddingLG }}>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: token.marginLG }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t("cartCheckout.order_info")}
        </Typography.Title>
      </Flex>

      <Row gutter={token.marginLG} align="top">
        <Col xs={24} xl={17}>
          <Space
            direction="vertical"
            size={token.marginMD}
            style={{ width: "100%" }}
          >
            {sortedMerchants.map((merchant: any) => {
              const skus = getSkus(merchant);
              const merchantQuantity = skus.reduce(
                (sum: number, sku: any) => sum + Number(sku.quantity || 0),
                0
              );
              return (
                <Card
                  key={merchant.id}
                  className="overflow-hidden"
                  title={
                    <Flex
                      align="center"
                      gap={token.marginSM}
                      style={{ minWidth: 0 }}
                    >
                      {merchant?.marketplace?.image ? (
                        <Avatar
                          shape="square"
                          src={merchant.marketplace.image}
                        />
                      ) : (
                        <Avatar shape="square" icon={<ShopOutlined />} />
                      )}
                      <Typography.Text
                        strong
                        ellipsis={{
                          tooltip: merchant.name || merchant.code || "Shop",
                        }}
                        style={{ maxWidth: 320 }}
                      >
                        {merchant.name || merchant.code || "Shop"}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {t("cartCheckout.quantity")}: {merchantQuantity}{" "}
                        {t("cartCheckout.product")} / {skus.length}{" "}
                        {t("cartCheckout.link_total")}
                      </Typography.Text>
                      <Tooltip title={t("cartCheckout.link_total")}>
                        <QuestionCircleOutlined
                          style={{ color: token.colorTextSecondary }}
                        />
                      </Tooltip>
                      <Typography.Text
                        type="secondary"
                        style={{ marginLeft: "auto", ...MONEY_TEXT_STYLE }}
                      >
                        {t("cartCheckout.amount_sum")}:{" "}
                        {formatCurrency(merchant.exchangedTotalValue || 0)}
                      </Typography.Text>
                    </Flex>
                  }
                  styles={{ body: { padding: 0 } }}
                >
                  <Table
                    className="[&_.ant-table-tbody>tr:last-child>td]:!border-b-0 [&_.ant-table-cell]:rounded-none"
                    rowKey={(sku) => String(sku.id)}
                    tableLayout="fixed"
                    scroll={{ x: 800 }}
                    dataSource={skus}
                    columns={columns}
                    pagination={false}
                  />
                  <Space
                    direction="vertical"
                    size={token.marginSM}
                    style={{
                      width: "100%",
                      padding: token.paddingMD,
                      borderTop: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <Flex gap={token.marginSM} wrap>
                      <Typography.Text type="secondary">
                        {t("cartCheckout.service")}:
                      </Typography.Text>
                      {Array.isArray(merchant.services) &&
                      merchant.services.length > 0 ? (
                        merchant.services
                          .slice()
                          .sort(
                            (left: any, right: any) =>
                              Number(left.position || 0) -
                              Number(right.position || 0)
                          )
                          .map((service: any) => (
                            <Typography.Text key={service.id || service.code}>
                              {service.name}
                            </Typography.Text>
                          ))
                      ) : (
                        <Typography.Text>---</Typography.Text>
                      )}
                    </Flex>

                    {(merchant.remark ||
                      merchant.note ||
                      merchant.refCustomerCode ||
                      merchant.refOrderCode) && (
                      <Space
                        direction="vertical"
                        size={token.marginXS}
                        style={{ width: "100%" }}
                      >
                        {merchant.remark && (
                          <Typography.Text>
                            <Typography.Text type="secondary">
                              {t("cartCheckout.note_order")}:{" "}
                            </Typography.Text>
                            {merchant.remark}
                          </Typography.Text>
                        )}
                        {merchant.note && (
                          <Typography.Text>
                            <Typography.Text type="secondary">
                              {t("cartCheckout.personal_note_for_order")}:{" "}
                            </Typography.Text>
                            {merchant.note}
                          </Typography.Text>
                        )}
                        {merchant.refCustomerCode && (
                          <Typography.Text>
                            <Typography.Text type="secondary">
                              {t("cartCheckout.customer_code")}:{" "}
                            </Typography.Text>
                            {merchant.refCustomerCode}
                          </Typography.Text>
                        )}
                        {merchant.refOrderCode && (
                          <Typography.Text>
                            <Typography.Text type="secondary">
                              {t("cartCheckout.customer_order_code")}:{" "}
                            </Typography.Text>
                            {merchant.refOrderCode}
                          </Typography.Text>
                        )}
                      </Space>
                    )}
                  </Space>
                </Card>
              );
            })}
          </Space>
        </Col>

        <Col xs={24} xl={7}>
          <Card styles={{ body: { padding: token.paddingMD } }}>
            <Space
              direction="vertical"
              size={token.marginMD}
              style={{ width: "100%" }}
            >
              <DeliveryAddressPanel
                addresses={addresses?.data || []}
                receivingAddresses={receivingAddresses?.data || []}
                selectedAddressData={selectedAddressData}
                selectedAddressId={selectedAddressId}
                selectedReceiveAddressData={selectedReceiveAddressData}
                selectedReceiveAddressId={selectedReceiveAddressId}
                isUsingReceiveAddress={isUsingReceiveAddress}
                isUpdating={isUpdatingDraftOrder}
                isAddressesFetching={isFetchingAddresses}
                isReceivingAddressesFetching={isFetchingReceivingAddresses}
                onSelectAddress={selectAddress}
                onSelectReceiveAddress={selectReceiveAddress}
                onRemoveReceiveAddress={removeReceiveAddress}
              />

              <Card
                style={{
                  borderColor: lackOfMoney
                    ? token.colorWarningBorder
                    : token.colorBorderSecondary,
                }}
              >
                <Space
                  direction="vertical"
                  size={token.marginSM}
                  style={{ width: "100%" }}
                >
                  <Flex justify="space-between" align="center">
                    <Typography.Text
                      strong
                      style={{ fontSize: token.fontSizeLG }}
                    >
                      {t("cart.deposit_information")}
                    </Typography.Text>
                    <Button
                      type="text"
                      size="small"
                      icon={depositExpanded ? <UpOutlined /> : <DownOutlined />}
                      onClick={() => setDepositExpanded((value) => !value)}
                    />
                  </Flex>
                  {hasDepositOptions && (
                    <>
                      <Spin spinning={isBiffinLoading}>
                        <div
                          style={{
                            maxHeight: 360,
                            overflow: "auto",
                            width: "100%",
                          }}
                        >
                          <Space
                            direction="vertical"
                            size={0}
                            style={{ width: "100%" }}
                          >
                            {showDefaultDepositOption &&
                              (depositExpanded ||
                                (depositMethodValue.method ===
                                  DEFAULT_METHOD_SELECTED &&
                                  tenantPercent ===
                                    depositMethodValue.percent)) && (
                                <Radio
                                  checked={
                                    depositMethodValue.method ===
                                      DEFAULT_METHOD_SELECTED &&
                                    tenantPercent === depositMethodValue.percent
                                  }
                                  onChange={() =>
                                    handleChangeDepositPercent(tenantPercent)
                                  }
                                >
                                  <Space direction="vertical" size={0}>
                                    <Typography.Text>
                                      {t("cart.deposit_with_tenant", {
                                        tenant_name:
                                          currentProjectInfo?.name || "",
                                        percent: tenantPercent,
                                      })}
                                    </Typography.Text>
                                    <Typography.Text
                                      strong
                                      style={{ color: token.colorPrimary }}
                                    >
                                      {formatCurrency(
                                        moneyCeil(
                                          percentToMoney(
                                            tenantPercent,
                                            draftOrder.exchangedTotalValue
                                          )
                                        )
                                      )}
                                    </Typography.Text>
                                  </Space>
                                </Radio>
                              )}

                            {demandDepositPercentages.map(
                              (percent: number | string, index: number) => {
                                const hidden =
                                  !depositExpanded &&
                                  depositMethodValue.percent !== percent;

                                return (
                                  <div key={index} hidden={hidden}>
                                    <Divider
                                      style={{
                                        display:
                                          !depositExpanded || !tenantPercent
                                            ? "none"
                                            : undefined,
                                        marginBlock: token.marginXS,
                                      }}
                                    />
                                    <Radio
                                      checked={
                                        depositMethodValue.method ===
                                          DEFAULT_METHOD_SELECTED &&
                                        percent === depositMethodValue.percent
                                      }
                                      onChange={() =>
                                        handleChangeDepositPercent(percent)
                                      }
                                    >
                                      <Space direction="vertical" size={0}>
                                        <Typography.Text>
                                          {t("cart.deposit_with_tenant", {
                                            tenant_name:
                                              currentProjectInfo?.name || "",
                                            percent,
                                          })}
                                        </Typography.Text>
                                        <Typography.Text
                                          strong
                                          style={{ color: token.colorPrimary }}
                                        >
                                          {formatCurrency(
                                            moneyCeil(
                                              percentToMoney(
                                                percent,
                                                draftOrder.exchangedTotalValue
                                              )
                                            )
                                          )}
                                        </Typography.Text>
                                      </Space>
                                    </Radio>
                                  </div>
                                );
                              }
                            )}

                            {isEnabledBiffin &&
                              (!isConnectedBiffin ? (
                                <>
                                  <Divider
                                    style={{
                                      display:
                                        !depositExpanded ||
                                        (!tenantPercent && !depositOnDemand)
                                          ? "none"
                                          : undefined,
                                      marginBlock: token.marginXS,
                                    }}
                                  />
                                  {(depositExpanded ||
                                    depositMethodValue.method ===
                                      BIFFIN_METHOD_SELECTED) && (
                                    <Radio
                                      checked={
                                        depositMethodValue.method ===
                                        BIFFIN_METHOD_SELECTED
                                      }
                                    >
                                      <Space direction="vertical" size={0}>
                                        <Typography.Text>
                                          {t("cart.deposit_with_biffin")}
                                        </Typography.Text>
                                        <Typography.Link
                                          type="danger"
                                          onClick={openConnectBiffin}
                                        >
                                          {t("cart.connect_now")}
                                        </Typography.Link>
                                      </Space>
                                    </Radio>
                                  )}
                                </>
                              ) : (
                                biffinOptions.map(
                                  (item: any, index: number) => {
                                    const hidden =
                                      !depositExpanded &&
                                      depositMethodValue.percent !==
                                        item?.percent;

                                    return (
                                      <div
                                        key={item?.key ?? index}
                                        hidden={hidden}
                                      >
                                        <Divider
                                          style={{
                                            display: !depositExpanded
                                              ? "none"
                                              : undefined,
                                            marginBlock: token.marginXS,
                                          }}
                                        />
                                        <Radio
                                          checked={
                                            item?.percent ===
                                              depositMethodValue.percent &&
                                            depositMethodValue.method ===
                                              BIFFIN_METHOD_SELECTED
                                          }
                                          onChange={() =>
                                            handleChangeBiffinOption(item)
                                          }
                                        >
                                          <Space direction="vertical" size={0}>
                                            <Typography.Text>
                                              {item?.label}{" "}
                                              {index ===
                                                biffinOptions.length - 1 && (
                                                <Tooltip
                                                  title={t(
                                                    "cartCheckout.textPercentRounding"
                                                  )}
                                                >
                                                  <QuestionCircleOutlined
                                                    style={{
                                                      color:
                                                        token.colorTextSecondary,
                                                      marginLeft:
                                                        token.marginXXS,
                                                    }}
                                                  />
                                                </Tooltip>
                                              )}
                                            </Typography.Text>
                                            <Typography.Text
                                              strong
                                              style={{
                                                color: token.colorPrimary,
                                              }}
                                            >
                                              {formatCurrency(
                                                moneyCeil(item?.money || 0)
                                              )}
                                            </Typography.Text>
                                          </Space>
                                        </Radio>
                                      </div>
                                    );
                                  }
                                )
                              ))}
                          </Space>
                        </div>
                      </Spin>
                      <Divider style={{ marginBlock: token.marginXS }} />
                    </>
                  )}

                  <Typography.Text strong>
                    {t("cartCheckout.product_info")}
                  </Typography.Text>
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      {t("cartCheckout.seller")}:
                    </Typography.Text>
                    <Typography.Text>{merchants.length}</Typography.Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      {t("cartCheckout.link_total")}:
                    </Typography.Text>
                    <Typography.Text>{totalLink}</Typography.Text>
                  </Flex>
                  <Divider style={{ marginBlock: token.marginXS }} />

                  <Flex justify="space-between" align="center">
                    <Typography.Text strong>
                      {t("cartCheckout.voucher")}
                    </Typography.Text>
                    <Button type="link" onClick={() => setVoucherOpen(true)}>
                      {t("coupon.voucher")}
                    </Button>
                  </Flex>
                  {appliedVouchers.map((voucher) => (
                    <Flex
                      key={voucher.code}
                      justify="space-between"
                      gap={token.marginSM}
                    >
                      <Space>
                        <Button
                          danger
                          type="text"
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() =>
                            setAppliedVouchers((items) =>
                              items.filter((item) => item.code !== voucher.code)
                            )
                          }
                        />
                        <Typography.Text>{voucher.code}</Typography.Text>
                      </Space>
                      <Typography.Text type="danger">
                        {formatCurrency(
                          moneyCeil(-Number(voucher.totalDiscountFee || 0))
                        )}
                      </Typography.Text>
                    </Flex>
                  ))}
                  <Divider style={{ marginBlock: token.marginXS }} />

                  <Typography.Text strong>
                    {t("cartCheckout.order_info")}
                  </Typography.Text>
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      {t("cartCheckout.provisional_fee")}:
                    </Typography.Text>
                    <Typography.Text strong>
                      {formatCurrency(moneyCeil(draftOrder.totalFee || 0))}
                    </Typography.Text>
                  </Flex>
                  {appliedVouchers.length > 0 && (
                    <Flex justify="space-between">
                      <Typography.Text type="secondary">
                        {t("cartCheckout.totalCoupon")}:
                      </Typography.Text>
                      <Typography.Text type="danger" strong>
                        {formatCurrency(moneyCeil(-totalCoupon))}
                      </Typography.Text>
                    </Flex>
                  )}
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      {t("cartCheckout.provisional_cal")} ({totalQuantity}{" "}
                      {t("cartCheckout.product")}):
                    </Typography.Text>
                    <Typography.Text strong>
                      {formatCurrency(
                        moneyCeil(draftOrder.exchangedTotalValue || 0)
                      )}
                    </Typography.Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      {t("cartCheckout.deposit")} {draftOrder.emdPercent || 0}%:
                    </Typography.Text>
                    <Typography.Text
                      strong
                      style={{
                        color: token.colorPrimary,
                        fontSize: token.fontSizeLG,
                      }}
                    >
                      {formatCurrency(moneyCeil(draftOrder.emdAmount || 0))}
                    </Typography.Text>
                  </Flex>
                  {isEnabledBiffin &&
                    isConnectedBiffin &&
                    depositMethodValue.method === BIFFIN_METHOD_SELECTED && (
                      <>
                        <Divider style={{ marginBlock: token.marginXS }} />
                        <Flex justify="space-between">
                          <Typography.Text type="secondary">
                            {t("cart.bifinAdvancecapital", {
                              value: selectedBiffinPercent,
                            })}
                            :
                          </Typography.Text>
                          <Typography.Text>
                            {formatCurrency(moneyCeil(selectedBiffinMoney))}
                          </Typography.Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Typography.Text type="secondary">
                            {t("cart.customerAdvancecapital", {
                              value: selectedCustomerPercent,
                            })}
                            :
                          </Typography.Text>
                          <Typography.Text>
                            {formatCurrency(
                              moneyCeil(
                                Number(draftOrder.exchangedTotalValue || 0) -
                                  selectedBiffinMoney
                              )
                            )}
                          </Typography.Text>
                        </Flex>
                      </>
                    )}
                  {lackOfMoney && (
                    <>
                      <Flex justify="space-between">
                        <Typography.Text type="secondary">
                          {t("cartCheckout.balance_account")}:
                        </Typography.Text>
                        <Typography.Text>
                          {balance >= 0 ? "+" : ""}
                          {formatCurrency(moneyCeil(balance))}
                        </Typography.Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Typography.Text type="secondary">
                          {t("cartCheckout.lack_of_money")}:
                        </Typography.Text>
                        <Typography.Text type="danger" strong>
                          {formatCurrency(totalLackOfMoney)}
                        </Typography.Text>
                      </Flex>
                    </>
                  )}
                  {crossedThresholdMerchants.length > 0 &&
                    (lackOfMoney ? (
                      <>
                        {canRechargeForDeposit ? (
                          generalConfig.depositWizard ? (
                            <>
                              <Button
                                size="large"
                                block
                                onClick={() => setDepositModalOpen(true)}
                              >
                                {t("cartCheckout.recharge")}
                              </Button>
                              <DepositModal
                                open={depositModalOpen}
                                onClose={() => setDepositModalOpen(false)}
                                maskClosable
                                data={{
                                  step: 1,
                                  hideStep: true,
                                  type: "order",
                                  money: totalLackOfMoney,
                                }}
                              />
                            </>
                          ) : (
                            <Button
                              size="large"
                              block
                              href="/profile/faqs?recharge"
                              target="_blank"
                            >
                              {t("cartCheckout.recharge")}
                            </Button>
                          )
                        ) : (
                          <Button
                            type="primary"
                            size="large"
                            block
                            loading={createOrder.isPending}
                            disabled={isOrderButtonDisabled}
                            onClick={() => submitOrder()}
                          >
                            {t("cartCheckout.deposit_now")}
                          </Button>
                        )}
                        {canRechargeForDeposit && (
                          <>
                            <Typography.Link
                              href="/profile/faqs?recharge"
                              target="_blank"
                            >
                              {t("cartCheckout.recharge_guide")}
                            </Typography.Link>
                            <Tooltip
                              title={t(
                                "cartCheckout.guide_recharge_into_account"
                              )}
                            >
                              <QuestionCircleOutlined
                                style={{
                                  color: token.colorPrimary,
                                  marginLeft: token.marginXS,
                                }}
                              />
                            </Tooltip>
                          </>
                        )}
                      </>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        block
                        loading={createOrder.isPending}
                        disabled={isOrderButtonDisabled}
                        onClick={() => submitOrder()}
                      >
                        {t("cartCheckout.deposit_now")}
                      </Button>
                    ))}
                  {isEnabledBiffin &&
                    depositMethodValue.method === BIFFIN_METHOD_SELECTED && (
                      <Space
                        direction="vertical"
                        size={token.marginXS}
                        style={{ width: "100%" }}
                      >
                        {!isConnectedBiffin && (
                          <Typography.Text type="danger">
                            {t("cartCheckout.connectBifinToContinue", {
                              name: currentProjectInfo?.name,
                            })}
                          </Typography.Text>
                        )}
                        {isConnectedBiffin && !isDraftOrderLoanable && (
                          <Typography.Text type="danger">
                            {t("cartCheckout.notEnoughCondition", {
                              name: currentProjectInfo?.name,
                            })}
                          </Typography.Text>
                        )}
                        {isConnectedBiffin ? (
                          <Typography.Paragraph
                            style={{ marginBottom: 0 }}
                            dangerouslySetInnerHTML={{
                              __html: t("cartCheckout.confirmBifin"),
                            }}
                          />
                        ) : (
                          <>
                            <Typography.Paragraph style={{ marginBottom: 0 }}>
                              {t("cartCheckout.introduceBifin", {
                                name: currentProjectInfo?.name,
                              })}
                            </Typography.Paragraph>
                            <Typography.Link
                              href="https://www.bifin.vn/"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t("cartCheckout.biffin_note_more")}
                            </Typography.Link>
                          </>
                        )}
                      </Space>
                    )}
                </Space>
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>

      <DraftOrderVoucherModal
        open={voucherOpen}
        draftOrderId={draftOrderId}
        appliedVouchers={appliedVouchers}
        onApply={setAppliedVouchers}
        onClose={() => setVoucherOpen(false)}
      />

      <Modal
        title={t("modal.confirm_pin")}
        open={pinOpen}
        okText={t("cartCheckout.confirm")}
        cancelText={t("cartCheckout.cancel")}
        confirmLoading={createOrder.isPending}
        onCancel={() => {
          setPinOpen(false);
          setPin("");
          setPinError("");
        }}
        onOk={() => submitOrder(pin)}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Typography.Text>
            {t("cartCheckout.please_input_pin")}
          </Typography.Text>
          <Input.Password
            autoFocus
            value={pin}
            placeholder={t("cartCheckout.input_pin")}
            onChange={(event) => {
              setPin(event.target.value);
              setPinError("");
            }}
            onPressEnter={() => submitOrder(pin)}
          />
          {pinError && (
            <Typography.Text type="danger">{pinError}</Typography.Text>
          )}
          <Typography.Text type="secondary">
            {t("cartCheckout.default_pin")}
          </Typography.Text>
          <Checkbox
            checked={savePassword}
            onChange={(event) => setSavePassword(event.target.checked)}
          >
            {t("modal.save_password_60m")}
          </Checkbox>
        </Space>
      </Modal>
    </div>
  );
};

export default CartCheckoutStyleDefault;
