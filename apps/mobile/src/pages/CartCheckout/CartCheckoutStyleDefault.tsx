import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Flex,
  Image,
  Input,
  List,
  Modal,
  Radio,
  Skeleton,
  Space,
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
import {
  BIFFIN_METHOD_SELECTED,
  DEFAULT_METHOD_SELECTED,
  getDraftMerchantTotalValue,
  getSkus,
  percentToMoney,
  useCartCheckoutPage,
} from "@repo/hooks";
import { useTranslation } from "@repo/i18n";
import { moneyCeil, moneyFormat } from "@repo/util";
import DepositModal from "../../components/DepositModal";
import { DeliveryAddressPanel } from "./components/DeliveryAddressPanel";
import { DraftOrderVoucherModal } from "./components/DraftOrderVoucherModal";

const { Text, Title, Paragraph, Link } = Typography;

const getName = (sku: any, translated: boolean) =>
  (translated
    ? sku?.product?.name || sku?.productName || sku?.name || sku?.title
    : sku?.product?.originalName ||
      sku?.originalName ||
      sku?.product?.name ||
      sku?.productName ||
      sku?.name ||
      sku?.title) || "---";

const getImage = (sku: any) =>
  sku?.image ||
  sku?.variantImage ||
  sku?.skuImageUrl ||
  sku?.product?.image ||
  sku?.productImage ||
  sku?.imageUrl ||
  sku?.product?.images?.[0] ||
  sku?.product?.productImages?.[0];

const getProductUrl = (sku: any) =>
  sku?.product?.url || sku?.productUrl || sku?.url;

const getProperties = (sku: any, translated: boolean) =>
  Array.isArray(sku?.variantProperties)
    ? sku.variantProperties
        .map((property: any) =>
          translated
            ? property?.value || property?.originalValue
            : property?.originalValue || property?.value,
        )
        .filter(Boolean)
        .join(" / ")
    : "";

const getForeignCurrency = (sku: any) =>
  sku?.currency?.code ||
  sku?.currencyCode ||
  sku?.currency ||
  sku?.cartGroupCurrency ||
  "CNY";

const CartCheckoutSkeleton = () => {
  const { token } = theme.useToken();

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Skeleton.Input active style={{ width: 180 }} />
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} styles={{ body: { padding: token.paddingMD } }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Flex gap={token.marginSM} align="center">
              <Skeleton.Avatar active shape="square" />
              <Skeleton.Input active style={{ width: "70%" }} />
            </Flex>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Space>
        </Card>
      ))}
    </Space>
  );
};

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
    draftOrder,
    draftOrderTotalValue,
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

  if (isLoading) return <CartCheckoutSkeleton />;
  if (!draftOrder) return <Empty description={t("message.empty")} />;

  const orderButtonLoading =
    createOrder.isPending || isUpdatingDraftOrder || isBiffinLoading;

  const renderSku = (sku: any) => {
    const image = getImage(sku);
    const productUrl = getProductUrl(sku);

    return (
      <List.Item style={{ padding: 0, marginBottom: token.marginSM }}>
        <Card size="small" style={{ width: "100%" }}>
          <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
            <Flex align="flex-start" gap={token.marginSM}>
              {image ? (
                <Image
                  width={48}
                  height={48}
                  preview
                  src={image}
                  referrerPolicy="no-referrer"
                  style={{
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadiusSM,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Avatar shape="square" size={48} icon={<ShoppingCartOutlined />} />
              )}
              <Space direction="vertical" size={2} style={{ flex: 1, minWidth: 0 }}>
                <Text strong ellipsis={{ tooltip: getName(sku, true) }}>
                  {productUrl ? (
                    <a href={productUrl} target="_blank" rel="noreferrer">
                      {getName(sku, true)}
                    </a>
                  ) : (
                    getName(sku, true)
                  )}
                </Text>
                <Text type="secondary" ellipsis={{ tooltip: getProperties(sku, true) || "---" }}>
                  {getProperties(sku, true) || "---"}
                </Text>
              </Space>
            </Flex>
            {sku.remark ? (
              <Text>
                <Text type="secondary">{t("cartCheckout.product_note")}: </Text>
                {sku.remark}
              </Text>
            ) : null}
            {sku.note ? (
              <Text>
                <Text type="secondary">{t("cartCheckout.personal_product_note")}: </Text>
                {sku.note}
              </Text>
            ) : null}
            <Divider style={{ marginBlock: 0 }} />
            <Flex justify="space-between" gap={token.marginSM}>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t("cartCheckout.provisional_cal")}
                </Text>
                <Text strong>{moneyFormat(sku.exchangedTotalAmount || 0)}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {moneyFormat(sku.totalAmount || 0, getForeignCurrency(sku))}
                </Text>
              </Space>
              <Space direction="vertical" size={0} style={{ textAlign: "right" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t("cartCheckout.quantity")}
                </Text>
                <Text>
                  {sku.quantity || 0} {t("cartCheckout.product")}
                </Text>
              </Space>
            </Flex>
          </Space>
        </Card>
      </List.Item>
    );
  };

  const renderDepositOptions = () =>
    hasDepositOptions ? (
      <>
        <div style={{ maxHeight: 360, overflow: "auto", width: "100%" }}>
          <Space direction="vertical" size={0} style={{ width: "100%" }}>
            {showDefaultDepositOption &&
            (depositExpanded ||
              (depositMethodValue.method === DEFAULT_METHOD_SELECTED &&
                tenantPercent === depositMethodValue.percent)) ? (
              <Radio
                checked={
                  depositMethodValue.method === DEFAULT_METHOD_SELECTED &&
                  tenantPercent === depositMethodValue.percent
                }
                onChange={() => handleChangeDepositPercent(tenantPercent)}
              >
                <Space direction="vertical" size={0}>
                  <Text>
                    {t("cart.deposit_with_tenant", {
                      tenant_name: currentProjectInfo?.name || "",
                      percent: tenantPercent,
                    })}
                  </Text>
                  <Text strong style={{ color: token.colorPrimary }}>
                    {moneyFormat(
                      moneyCeil(
                        percentToMoney(tenantPercent, draftOrderTotalValue),
                      ),
                    )}
                  </Text>
                </Space>
              </Radio>
            ) : null}

            {demandDepositPercentages.map((percent: number | string, index: number) => {
              const hidden = !depositExpanded && depositMethodValue.percent !== percent;

              return (
                <div key={index} hidden={hidden}>
                  <Divider
                    style={{
                      display: !depositExpanded || !tenantPercent ? "none" : undefined,
                      marginBlock: token.marginXS,
                    }}
                  />
                  <Radio
                    checked={
                      depositMethodValue.method === DEFAULT_METHOD_SELECTED &&
                      percent === depositMethodValue.percent
                    }
                    onChange={() => handleChangeDepositPercent(percent)}
                  >
                    <Space direction="vertical" size={0}>
                      <Text>
                        {t("cart.deposit_with_tenant", {
                          tenant_name: currentProjectInfo?.name || "",
                          percent,
                        })}
                      </Text>
                      <Text strong style={{ color: token.colorPrimary }}>
                        {moneyFormat(
                          moneyCeil(
                            percentToMoney(percent, draftOrderTotalValue),
                          ),
                        )}
                      </Text>
                    </Space>
                  </Radio>
                </div>
              );
            })}

            {isEnabledBiffin ? (
              !isConnectedBiffin ? (
                <div
                  hidden={
                    !depositExpanded &&
                    depositMethodValue.method !== BIFFIN_METHOD_SELECTED
                  }
                >
                  <Divider style={{ marginBlock: token.marginXS }} />
                  <Radio checked={depositMethodValue.method === BIFFIN_METHOD_SELECTED}>
                    <Space direction="vertical" size={0}>
                      <Text>{t("cart.deposit_with_biffin")}</Text>
                      <Link type="danger" onClick={openConnectBiffin}>
                        {t("cart.connect_now")}
                      </Link>
                    </Space>
                  </Radio>
                </div>
              ) : (
                biffinOptions.map((item: any, index: number) => {
                  const hidden = !depositExpanded && depositMethodValue.percent !== item?.percent;

                  return (
                    <div key={item?.key ?? index} hidden={hidden}>
                      <Divider
                        style={{
                          display: !depositExpanded ? "none" : undefined,
                          marginBlock: token.marginXS,
                        }}
                      />
                      <Radio
                        checked={
                          item?.percent === depositMethodValue.percent &&
                          depositMethodValue.method === BIFFIN_METHOD_SELECTED
                        }
                        onChange={() => handleChangeBiffinOption(item)}
                      >
                        <Space direction="vertical" size={0}>
                          <Text>
                            {item?.label}{" "}
                            {index === biffinOptions.length - 1 ? (
                              <Tooltip title={t("cartCheckout.textPercentRounding")}>
                                <QuestionCircleOutlined
                                  style={{
                                    color: token.colorTextSecondary,
                                    marginLeft: token.marginXXS,
                                  }}
                                />
                              </Tooltip>
                            ) : null}
                          </Text>
                          <Text strong style={{ color: token.colorPrimary }}>
                            {moneyFormat(moneyCeil(item?.money || 0))}
                          </Text>
                        </Space>
                      </Radio>
                    </div>
                  );
                })
              )
            ) : null}
          </Space>
        </div>
        <Divider style={{ marginBlock: token.marginXS }} />
      </>
    ) : null;

  return (
    <div style={{ paddingBottom: token.paddingLG }}>
      <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
        <Title level={4} style={{ margin: 0 }}>
          {t("cartCheckout.order_info")}
        </Title>

        {sortedMerchants.map((merchant: any) => {
          const skus = getSkus(merchant);
          const merchantQuantity = skus.reduce(
            (sum: number, sku: any) => sum + Number(sku.quantity || 0),
            0,
          );

          return (
            <Card key={merchant.id} styles={{ body: { padding: token.paddingMD } }}>
              <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
                <Flex align="flex-start" gap={token.marginSM}>
                  {merchant?.marketplace?.image ? (
                    <Avatar shape="square" src={merchant.marketplace.image} />
                  ) : (
                    <Avatar shape="square" icon={<ShopOutlined />} />
                  )}
                  <Space direction="vertical" size={2} style={{ flex: 1, minWidth: 0 }}>
                    <Text strong ellipsis={{ tooltip: merchant.name || merchant.code || "Shop" }}>
                      {merchant.name || merchant.code || "Shop"}
                    </Text>
                    <Space size={4}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {merchantQuantity}{" "}
                        {t("cartCheckout.product")} / {skus.length}{" "}
                        link
                      </Text>
                      <Tooltip title={t("cartCheckout.link_total")}>
                        <QuestionCircleOutlined
                          style={{
                            color: token.colorTextSecondary,
                            fontSize: 12,
                          }}
                        />
                      </Tooltip>
                    </Space>
                  </Space>
                  <Text strong style={{ color: token.colorPrimary, whiteSpace: "nowrap" }}>
                    {moneyFormat(getDraftMerchantTotalValue(merchant))}
                  </Text>
                </Flex>

                <List split={false} dataSource={skus} rowKey={(sku: any) => String(sku.id)} renderItem={renderSku} />

                <Divider style={{ marginBlock: 0 }} />
                <Flex gap={token.marginSM} wrap>
                  <Text type="secondary">{t("cartCheckout.service")}:</Text>
                  {Array.isArray(merchant.services) && merchant.services.length > 0 ? (
                    merchant.services
                      .slice()
                      .sort(
                        (left: any, right: any) =>
                          Number(left.position || 0) - Number(right.position || 0),
                      )
                      .map((service: any) => (
                        <Text key={service.id || service.code}>{service.name}</Text>
                      ))
                  ) : (
                    <Text>---</Text>
                  )}
                </Flex>

                {(merchant.remark ||
                  merchant.note ||
                  merchant.refCustomerCode ||
                  merchant.refOrderCode) ? (
                  <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
                    {merchant.remark ? (
                      <Text>
                        <Text type="secondary">{t("cartCheckout.note_order")}: </Text>
                        {merchant.remark}
                      </Text>
                    ) : null}
                    {merchant.note ? (
                      <Text>
                        <Text type="secondary">
                          {t("cartCheckout.personal_note_for_order")}:{" "}
                        </Text>
                        {merchant.note}
                      </Text>
                    ) : null}
                    {merchant.refCustomerCode ? (
                      <Text>
                        <Text type="secondary">{t("cartCheckout.customer_code")}: </Text>
                        {merchant.refCustomerCode}
                      </Text>
                    ) : null}
                    {merchant.refOrderCode ? (
                      <Text>
                        <Text type="secondary">
                          {t("cartCheckout.customer_order_code")}:{" "}
                        </Text>
                        {merchant.refOrderCode}
                      </Text>
                    ) : null}
                  </Space>
                ) : null}
              </Space>
            </Card>
          );
        })}

        <Card styles={{ body: { padding: token.paddingMD } }}>
          <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
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
              styles={{ body: { padding: token.paddingMD } }}
            >
              <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
                <Flex justify="space-between" align="center">
                  <Text strong style={{ fontSize: token.fontSizeLG }}>
                    {t("cart.deposit_information")}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={depositExpanded ? <UpOutlined /> : <DownOutlined />}
                    onClick={() => setDepositExpanded((value) => !value)}
                  />
                </Flex>

                <Skeleton active loading={isBiffinLoading} paragraph={{ rows: 2 }}>
                  {renderDepositOptions()}
                </Skeleton>

                <Text strong>{t("cartCheckout.product_info")}</Text>
                <Flex justify="space-between">
                  <Text type="secondary">{t("cartCheckout.seller")}:</Text>
                  <Text>{merchants.length}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text type="secondary">{t("cartCheckout.link_total")}:</Text>
                  <Text>{totalLink}</Text>
                </Flex>
                <Divider style={{ marginBlock: token.marginXS }} />

                <Flex justify="space-between" align="center">
                  <Text strong>{t("cartCheckout.voucher")}</Text>
                  <Button type="link" onClick={() => setVoucherOpen(true)}>
                    {t("coupon.voucher")}
                  </Button>
                </Flex>
                {appliedVouchers.map((voucher) => (
                  <Flex key={voucher.code} justify="space-between" gap={token.marginSM}>
                    <Space>
                      <Button
                        danger
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() =>
                          setAppliedVouchers((items) =>
                            items.filter((item) => item.code !== voucher.code),
                          )
                        }
                      />
                      <Text>{voucher.code}</Text>
                    </Space>
                    <Text type="danger">
                      {moneyFormat(moneyCeil(-Number(voucher.totalDiscountFee || 0)))}
                    </Text>
                  </Flex>
                ))}
                <Divider style={{ marginBlock: token.marginXS }} />

                <Text strong>{t("cartCheckout.order_info")}</Text>
                <Flex justify="space-between" gap={token.marginSM}>
                  <Text type="secondary">{t("cartCheckout.provisional_fee")}:</Text>
                  <Text strong>{moneyFormat(moneyCeil(draftOrder.totalFee || 0))}</Text>
                </Flex>
                {appliedVouchers.length > 0 ? (
                  <Flex justify="space-between" gap={token.marginSM}>
                    <Text type="secondary">{t("cartCheckout.totalCoupon")}:</Text>
                    <Text type="danger" strong>
                      {moneyFormat(moneyCeil(-totalCoupon))}
                    </Text>
                  </Flex>
                ) : null}
                <Flex justify="space-between" gap={token.marginSM}>
                  <Text type="secondary">
                    {t("cartCheckout.provisional_cal")} ({totalQuantity}{" "}
                    {t("cartCheckout.product")}):
                  </Text>
                  <Text strong>
                    {moneyFormat(moneyCeil(draftOrderTotalValue))}
                  </Text>
                </Flex>
                <Flex justify="space-between" gap={token.marginSM}>
                  <Text type="secondary">
                    {t("cartCheckout.deposit")} {draftOrder.emdPercent || 0}%:
                  </Text>
                  <Text
                    strong
                    style={{ color: token.colorPrimary, fontSize: token.fontSizeLG }}
                  >
                    {moneyFormat(moneyCeil(draftOrder.emdAmount || 0))}
                  </Text>
                </Flex>

                {isEnabledBiffin &&
                isConnectedBiffin &&
                depositMethodValue.method === BIFFIN_METHOD_SELECTED ? (
                  <>
                    <Divider style={{ marginBlock: token.marginXS }} />
                    <Flex justify="space-between" gap={token.marginSM}>
                      <Text type="secondary">
                        {t("cart.bifinAdvancecapital", {
                          value: selectedBiffinPercent,
                        })}
                        :
                      </Text>
                      <Text>{moneyFormat(moneyCeil(selectedBiffinMoney))}</Text>
                    </Flex>
                    <Flex justify="space-between" gap={token.marginSM}>
                      <Text type="secondary">
                        {t("cart.customerAdvancecapital", {
                          value: selectedCustomerPercent,
                        })}
                        :
                      </Text>
                      <Text>
                        {moneyFormat(
                          moneyCeil(
                            draftOrderTotalValue -
                              selectedBiffinMoney,
                          ),
                        )}
                      </Text>
                    </Flex>
                  </>
                ) : null}

                {lackOfMoney ? (
                  <>
                    <Flex justify="space-between" gap={token.marginSM}>
                      <Text type="secondary">{t("cartCheckout.balance_account")}:</Text>
                      <Text>
                        {balance >= 0 ? "+" : ""}
                        {moneyFormat(moneyCeil(balance))}
                      </Text>
                    </Flex>
                    <Flex justify="space-between" gap={token.marginSM}>
                      <Text type="secondary">{t("cartCheckout.lack_of_money")}:</Text>
                      <Text type="danger" strong>
                        {moneyFormat(totalLackOfMoney)}
                      </Text>
                    </Flex>
                  </>
                ) : null}

                {crossedThresholdMerchants.length > 0 &&
                  (lackOfMoney ? (
                    <>
                      {canRechargeForDeposit ? (
                        generalConfig.depositWizard ? (
                          <>
                            <Button size="large" block onClick={() => setDepositModalOpen(true)}>
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
                          loading={orderButtonLoading}
                          disabled={isOrderButtonDisabled}
                          onClick={() => submitOrder()}
                        >
                          {t("cartCheckout.deposit_now")}
                        </Button>
                      )}
                      {canRechargeForDeposit ? (
                        <Text>
                          <Link href="/profile/faqs?recharge" target="_blank">
                            {t("cartCheckout.recharge_guide")}
                          </Link>
                          <Tooltip title={t("cartCheckout.guide_recharge_into_account")}>
                            <QuestionCircleOutlined
                              style={{
                                color: token.colorPrimary,
                                marginLeft: token.marginXS,
                              }}
                            />
                          </Tooltip>
                        </Text>
                      ) : null}
                    </>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={orderButtonLoading}
                      disabled={isOrderButtonDisabled}
                      onClick={() => submitOrder()}
                    >
                      {t("cartCheckout.deposit_now")}
                    </Button>
                  ))}

                {isEnabledBiffin && depositMethodValue.method === BIFFIN_METHOD_SELECTED ? (
                  <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
                    {!isConnectedBiffin ? (
                      <Text type="danger">
                        {t("cartCheckout.connectBifinToContinue", {
                          name: currentProjectInfo?.name,
                        })}
                      </Text>
                    ) : null}
                    {isConnectedBiffin && !isDraftOrderLoanable ? (
                      <Text type="danger">
                        {t("cartCheckout.notEnoughCondition", {
                          name: currentProjectInfo?.name,
                        })}
                      </Text>
                    ) : null}
                    {isConnectedBiffin ? (
                      <Paragraph
                        style={{ marginBottom: 0 }}
                        dangerouslySetInnerHTML={{
                          __html: t("cartCheckout.confirmBifin"),
                        }}
                      />
                    ) : (
                      <>
                        <Paragraph style={{ marginBottom: 0 }}>
                          {t("cartCheckout.introduceBifin", {
                            name: currentProjectInfo?.name,
                          })}
                        </Paragraph>
                        <Link href="https://www.bifin.vn/" target="_blank" rel="noreferrer">
                          {t("cartCheckout.biffin_note_more")}
                        </Link>
                      </>
                    )}
                  </Space>
                ) : null}
              </Space>
            </Card>
          </Space>
        </Card>
      </Space>

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
          <Text>{t("cartCheckout.please_input_pin")}</Text>
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
          {pinError ? <Text type="danger">{pinError}</Text> : null}
          <Text type="secondary">{t("cartCheckout.default_pin")}</Text>
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
