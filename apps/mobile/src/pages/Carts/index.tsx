import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Flex,
  Image,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Skeleton,
  Space,
  Switch,
  Tooltip,
  Typography,
  App,
  theme,
} from "antd";
import {
  ArrowsAltOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  HeartOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  SettingOutlined,
  ShrinkOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  useAddWishlistItemMutation,
  useCartFeesQuery,
  useCartItemsInfiniteQuery,
  useCreateDraftOrderMutation,
  useDeleteAllCartMutation,
  useDeleteCartGroupMutation,
  useDeleteCartSkusMutation,
  useOrderServicesQuery,
  useShipmentServiceGroupsQuery,
  useUpdateCartServicesMutation,
  useUpdateCartGroupMutation,
  useUpdateCartSkuMutation,
  useUpdatePreferredServicesMutation,
} from "@repo/hooks";
import { useTranslation } from "@repo/i18n";
import { formatCurrency } from "@repo/util";
import { AddProductsModal } from "./components/AddProductsModal";

const { Text, Title } = Typography;

const getSkuItems = (group: any) => {
  if (Array.isArray(group?.skus)) return group.skus;
  if (Array.isArray(group?.skuItems)) return group.skuItems;
  if (Array.isArray(group?.products)) {
    return group.products.flatMap((product: any) =>
      Array.isArray(product?.skus)
        ? product.skus.map((sku: any) => ({ ...sku, product }))
        : [],
    );
  }
  return [];
};

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

const getUnitPrice = (sku: any) =>
  Number(
    sku?.exchangedSalePrice ??
      sku?.salePrice ??
      sku?.price ??
      sku?.product?.exchangedSalePrice ??
      sku?.product?.salePrice ??
      0,
  );

const getEffectiveUnitPrice = (sku: any) =>
  Number(
    (sku?.bargainPrice !== null && sku?.bargainPrice !== undefined
      ? sku?.exchangedBargainPrice
      : undefined) ?? getUnitPrice(sku),
  );

const getForeignSalePrice = (sku: any) =>
  Number(sku?.salePrice ?? sku?.product?.salePrice ?? 0);

const getForeignBargainPrice = (sku: any) => Number(sku?.bargainPrice ?? 0);

const getForeignPrice = (sku: any) =>
  Number(
    (sku?.bargainPrice !== null && sku?.bargainPrice !== undefined
      ? sku?.bargainPrice
      : undefined) ??
      getForeignSalePrice(sku),
  );

const getCurrency = (sku: any) =>
  sku?.currency?.code ||
  sku?.currencyCode ||
  sku?.currency ||
  sku?.cartGroupCurrency ||
  "CNY";

const sameCodes = (left: string[] = [], right: string[] = []) =>
  left.slice().sort().join(",") === right.slice().sort().join(",");

const CartSellerSettingsModal = ({
  group,
  open,
  onClose,
  logic,
}: {
  group: any | null;
  open: boolean;
  onClose: () => void;
  logic: any;
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [feesOpen, setFeesOpen] = useState(false);
  const [servicesCollapsed, setServicesCollapsed] = useState(true);
  const groupId = String(group?.id || "");
  const { data: fees = [], isFetching: isFeesFetching } = useCartFeesQuery(
    groupId,
    open && feesOpen,
  );

  if (!group) return null;

  const draft = logic.cartGroupDrafts[groupId] || {};
  const selectedCodes =
    logic.serviceDrafts[groupId] ??
    (Array.isArray(group.services)
      ? group.services.map((service: any) => service.code).filter(Boolean)
      : []);
  const originalCodes = Array.isArray(group.services)
    ? group.services.map((service: any) => service.code).filter(Boolean)
    : [];
  const selectedServices = logic.orderServices.filter((service: any) =>
    selectedCodes.includes(service.code),
  );
  const ungroupedServices = logic.orderServices.filter(
    (service: any) => !service.serviceGroup,
  );
  const servicesChanged = !sameCodes(selectedCodes, originalCodes);

  const renderServiceLabel = (service: any) => (
    <Space size={4}>
      <span>{service.name}</span>
      {service.serviceInfo ? (
        <Tooltip title={service.serviceInfo}>
          <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
        </Tooltip>
      ) : null}
    </Space>
  );

  const renderOrderTextField = (
    field: "note" | "refCustomerCode" | "refOrderCode",
    label: string,
  ) => {
    const value = draft[field] ?? group[field] ?? "";

    return (
      <div style={{ width: "100%" }}>
        <Text type="secondary">{label}: </Text>
        <Typography.Paragraph
          editable={{
            tooltip: t("common.edit"),
            onChange: (nextValue) =>
              logic.changeCartGroupDraft(groupId, field, nextValue),
            onEnd: () => logic.saveCartGroupField(group, field),
          }}
          ellipsis={!value ? false : { tooltip: value }}
          style={{
            display: "inline",
            marginBottom: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {value || "---"}
        </Typography.Paragraph>
      </div>
    );
  };

  return (
    <Modal
      title={group.name || group.code || t("cart.shop")}
      open={open}
      onCancel={onClose}
      footer={null}
      width="calc(100vw - 24px)"
      style={{ top: 24 }}
      styles={{ body: { maxHeight: "calc(100vh - 120px)", overflow: "auto" } }}
    >
      <Space direction="vertical" size={token.marginMD} style={{ width: "100%" }}>
        <Card
          size="small"
          title={t("cartCheckout.order_info")}
          styles={{ body: { paddingBlock: token.paddingSM } }}
        >
          <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
            {renderOrderTextField("note", t("cartCheckout.personal_note_for_order"))}
            {renderOrderTextField("refCustomerCode", t("cartCheckout.customer_code"))}
            {renderOrderTextField("refOrderCode", t("cartCheckout.customer_order_code"))}
          </Space>
        </Card>

        <Card
          size="small"
          title={t("orderServiceGroup.accompanied_service")}
          styles={{ body: { paddingBlock: token.paddingSM } }}
        >
          {servicesCollapsed ? (
            <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
              {selectedServices.length > 0 ? (
                <Space direction="vertical" size={token.marginXS}>
                  {selectedServices.map((service: any) => (
                    <Text key={service.code}>
                      <Text type="secondary">
                        {service?.serviceGroup?.name
                          ? `${service.serviceGroup.name}: `
                          : `${t("orderServiceGroup.other_service")}: `}
                      </Text>
                      {service.name}
                    </Text>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">
                  {t("orderServiceGroup.no_service_selected")}
                </Text>
              )}
              <Button
                type="link"
                size="small"
                icon={<ArrowsAltOutlined />}
                style={{ padding: 0 }}
                onClick={() => setServicesCollapsed(false)}
              >
                {t("orderServiceGroup.choose_service")}
              </Button>
            </Space>
          ) : (
            <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
              {ungroupedServices.length > 0 ? (
                <Space direction="vertical" size={token.marginXS}>
                  <Text strong>{t("orderServiceGroup.other_service")}</Text>
                  <Space wrap>
                    {ungroupedServices.map((service: any) => (
                      <Checkbox
                        key={service.code}
                        checked={selectedCodes.includes(service.code)}
                        onChange={(event) =>
                          logic.toggleCartService(group, service, event.target.checked)
                        }
                      >
                        {renderServiceLabel(service)}
                      </Checkbox>
                    ))}
                  </Space>
                </Space>
              ) : null}

              {logic.orderServiceGroups
                .slice()
                .sort(
                  (a: any, b: any) =>
                    Number(a.position || 0) - Number(b.position || 0),
                )
                .map((serviceGroup: any) => {
                  const services = logic.orderServices
                    .filter(
                      (service: any) =>
                        service?.serviceGroup?.code === serviceGroup.code,
                    )
                    .sort(
                      (a: any, b: any) =>
                        Number(a.position || 0) - Number(b.position || 0),
                    );
                  if (services.length === 0) return null;

                  return (
                    <Space
                      key={serviceGroup.code}
                      direction="vertical"
                      size={token.marginXS}
                      style={{ width: "100%" }}
                    >
                      <Text strong>{serviceGroup.name}</Text>
                      {serviceGroup.single ? (
                        <Radio.Group
                          value={
                            services.find((service: any) =>
                              selectedCodes.includes(service.code),
                            )?.code
                          }
                          onChange={(event) => {
                            const service = services.find(
                              (item: any) => item.code === event.target.value,
                            );
                            if (service) logic.toggleCartService(group, service, true);
                          }}
                        >
                          <Space wrap>
                            {services.map((service: any) => (
                              <Radio key={service.code} value={service.code}>
                                {renderServiceLabel(service)}
                              </Radio>
                            ))}
                          </Space>
                        </Radio.Group>
                      ) : (
                        <Space wrap>
                          {services.map((service: any) => (
                            <Checkbox
                              key={service.code}
                              checked={selectedCodes.includes(service.code)}
                              onChange={(event) =>
                                logic.toggleCartService(
                                  group,
                                  service,
                                  event.target.checked,
                                )
                              }
                            >
                              {renderServiceLabel(service)}
                            </Checkbox>
                          ))}
                        </Space>
                      )}
                    </Space>
                  );
                })}

              <Button
                type="primary"
                icon={<SaveOutlined />}
                disabled={!servicesChanged}
                loading={
                  logic.isSavingServices &&
                  String(logic.savingServicesGroupId) === String(group.id)
                }
                onClick={() => logic.saveCartServices(group)}
              >
                {t("orderServiceGroup.save_service")}
              </Button>
              <Button
                icon={<SaveOutlined />}
                loading={logic.isSavingPreferredServices}
                onClick={() => logic.savePreferredServices(group)}
              >
                {t("orderServiceGroup.save_default_service")}
              </Button>
              <Button
                type="link"
                size="small"
                icon={<ShrinkOutlined />}
                style={{ padding: 0 }}
                onClick={() => setServicesCollapsed(true)}
              >
                {t("orderServiceGroup.collapse")}
              </Button>
            </Space>
          )}
        </Card>

        <Card
          size="small"
          title={<Text strong style={{ color: token.colorPrimary }}>{t("cart.cost")}</Text>}
          style={{ borderColor: token.colorPrimaryBorder, background: token.colorPrimaryBg }}
          styles={{
            header: {
              borderBottomColor: token.colorPrimaryBorder,
              background: token.colorPrimaryBgHover,
            },
            body: { paddingBlock: token.paddingSM },
          }}
        >
          <Space direction="vertical" size={token.marginSM} style={{ width: "100%" }}>
            <Flex justify="space-between" gap={token.marginSM}>
              <Text type="secondary">{t("order.total_price")}</Text>
              <Text strong style={{ whiteSpace: "nowrap" }}>
                {formatCurrency(group.exchangedTotalValue || 0)}
              </Text>
            </Flex>
            <Flex justify="space-between" align="center" gap={token.marginSM}>
              <Button
                type="link"
                size="small"
                style={{ padding: 0 }}
                icon={feesOpen ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setFeesOpen((current) => !current)}
              >
                {t("cart.provisional_fee")}
              </Button>
              <Text strong style={{ whiteSpace: "nowrap" }}>
                {formatCurrency(group.totalFee || 0)}
              </Text>
            </Flex>
            {feesOpen ? (
              <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
                {isFeesFetching ? (
                  <Text type="secondary">{t("cart.loading_fee")}</Text>
                ) : fees.length > 0 ? (
                  fees.map((fee: any) => (
                    <Flex
                      key={fee.id || fee.code || fee.type?.code}
                      justify="space-between"
                      gap={token.marginSM}
                    >
                      <Text type="secondary">
                        - {fee.type?.name || fee.name || "---"}
                        {fee.type?.minFee || fee.type?.maxFee ? (
                          <Tooltip
                            title={
                              <Space direction="vertical" size={0}>
                                <span>
                                  {t("cart.min_fee")}:{" "}
                                  {formatCurrency(fee.type?.minFee || 0)}
                                </span>
                                <span>
                                  {t("cart.max_fee")}:{" "}
                                  {formatCurrency(fee.type?.maxFee || 0)}
                                </span>
                              </Space>
                            }
                          >
                            <InfoCircleOutlined style={{ marginLeft: 4 }} />
                          </Tooltip>
                        ) : null}
                      </Text>
                      <Text style={{ whiteSpace: "nowrap" }}>
                        {fee.provisionalAmount !== null &&
                        fee.provisionalAmount !== undefined
                          ? formatCurrency(fee.provisionalAmount)
                          : "---"}
                      </Text>
                    </Flex>
                  ))
                ) : (
                  <Text type="secondary">{t("cart.no_fee")}</Text>
                )}
              </Space>
            ) : null}
            <Divider style={{ marginBlock: token.marginXS }} />
            <Flex justify="space-between" gap={token.marginSM}>
              <Text strong>{t("cart.total")}</Text>
              <Text
                strong
                style={{ whiteSpace: "nowrap", color: token.colorPrimary }}
              >
                {formatCurrency(group.grandTotal || 0)}
              </Text>
            </Flex>
          </Space>
        </Card>
      </Space>
    </Modal>
  );
};

const CartSellerCardSkeleton = ({ index = 0 }: { index?: number }) => {
  const { token } = theme.useToken();
  return (
    <Card
      key={index}
      style={{ width: "100%" }}
      styles={{ body: { padding: token.paddingMD } }}
      title={
        <Flex align="center" gap={8}>
          <Skeleton.Button active size="small" style={{ width: 18 }} />
          <Skeleton.Avatar active shape="square" size={32} />
          <Skeleton.Input active size="small" style={{ width: 140 }} />
        </Flex>
      }
      extra={
        <Space size={0}>
          <Skeleton.Button active size="small" style={{ width: 32 }} />
          <Skeleton.Button active size="small" style={{ width: 32 }} />
        </Space>
      }
    >
      <Card size="small" style={{ width: "100%" }}>
        <Flex align="flex-start" gap={8}>
          <Skeleton.Button active size="small" style={{ width: 18 }} />
          <Skeleton.Avatar active shape="square" size={40} />
          <Space direction="vertical" size={6} style={{ flex: 1, minWidth: 0 }}>
            <Skeleton.Input active size="small" style={{ width: "80%" }} />
            <Skeleton.Input active size="small" style={{ width: "55%" }} />
          </Space>
          <Space size={0}>
            <Skeleton.Button active size="small" style={{ width: 32 }} />
            <Skeleton.Button active size="small" style={{ width: 32 }} />
          </Space>
        </Flex>
        <Flex
          justify="space-between"
          align="stretch"
          gap={8}
          style={{
            marginTop: token.marginSM,
            paddingTop: token.paddingSM,
            borderTop: `1px solid ${token.colorSplit}`,
          }}
        >
          <Space direction="vertical" size={4} style={{ flex: 1, minWidth: 0 }}>
            <Skeleton.Input active size="small" style={{ width: 64, height: 20 }} />
            <Skeleton.Input active size="small" style={{ width: 72 }} />
            <Skeleton.Input active size="small" style={{ width: 88 }} />
          </Space>
          <Space direction="vertical" size={4} style={{ width: 96 }}>
            <Skeleton.Input active size="small" style={{ width: 64, height: 20 }} />
            <Skeleton.Button active size="small" block />
          </Space>
          <Space
            direction="vertical"
            size={4}
            style={{ flex: 1, minWidth: 0, alignItems: "flex-end" }}
          >
            <Skeleton.Input active size="small" style={{ width: 72, height: 20 }} />
            <Skeleton.Input active size="small" style={{ width: 88 }} />
            <Skeleton.Input active size="small" style={{ width: 76 }} />
          </Space>
        </Flex>
      </Card>
    </Card>
  );
};

const CartLoadingSkeleton = () => {
  const { token } = theme.useToken();

  return (
    <div style={{ paddingBottom: 220 }}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Card>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Flex justify="space-between" align="flex-start" gap={12}>
              <Space size={10}>
                <Skeleton.Avatar active shape="square" size={32} />
                <Space direction="vertical" size={4}>
                  <Skeleton.Input active size="small" style={{ width: 120 }} />
                  <Skeleton.Input active size="small" style={{ width: 96 }} />
                </Space>
              </Space>
              <Skeleton.Button active size="small" style={{ width: 72 }} />
            </Flex>
            <Flex
              justify="space-between"
              align="center"
              gap={12}
              style={{
                paddingTop: token.paddingSM,
                borderTop: `1px solid ${token.colorSplit}`,
              }}
            >
              <Space size={8}>
                <Skeleton.Input active size="small" style={{ width: 88 }} />
                <Skeleton.Button active size="small" style={{ width: 64 }} />
              </Space>
              <Skeleton.Button active size="small" style={{ width: 108 }} />
            </Flex>
          </Space>
        </Card>

        {Array.from({ length: 5 }).map((_, index) => (
          <CartSellerCardSkeleton key={index} index={index} />
        ))}
      </Space>

      <Card
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
          zIndex: 20,
          borderRadius: 0,
          boxShadow: "0 -6px 18px rgba(0, 0, 0, 0.12)",
        }}
        styles={{ body: { padding: 16 } }}
      >
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Flex justify="space-between" align="center">
            <Skeleton.Input active size="small" style={{ width: 96 }} />
            <Skeleton.Input active size="small" style={{ width: 72 }} />
          </Flex>
          <Flex justify="space-between" align="center" gap={12}>
            <Skeleton.Input active size="small" style={{ width: 180 }} />
            <Skeleton.Button active size="default" style={{ width: 92 }} />
          </Flex>
        </Space>
      </Card>
    </div>
  );
};

const CartsPage = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { notification } = App.useApp();
  const navigate = useNavigate();
  const pageSize = 5;
  const [selectedSkuIds, setSelectedSkuIds] = useState<string[]>([]);
  const [translated, setTranslated] = useState(true);
  const [serviceDrafts, setServiceDrafts] = useState<Record<string, string[]>>({});
  const [cartGroupDrafts, setCartGroupDrafts] = useState<Record<string, any>>({});
  const [activeSeller, setActiveSeller] = useState<any | null>(null);
  const [addProductsOpen, setAddProductsOpen] = useState(false);
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([]);
  const [productsPerSeller, setProductsPerSellerState] = useState(() =>
    Number(localStorage.getItem("productPerMerchant") || 5),
  );
  const [savingSkuId, setSavingSkuId] = useState<string | null>(null);
  const [editingPriceSku, setEditingPriceSku] = useState<any | null>(null);
  const [bargainPriceValue, setBargainPriceValue] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const query = useCartItemsInfiniteQuery({ size: pageSize });
  const { data: orderServices = [] } = useOrderServicesQuery();
  const { data: orderServiceGroups = [] } = useShipmentServiceGroupsQuery();
  const updateSkuMutation = useUpdateCartSkuMutation();
  const updateCartGroupMutation = useUpdateCartGroupMutation();
  const updateServicesMutation = useUpdateCartServicesMutation();
  const updatePreferredServicesMutation = useUpdatePreferredServicesMutation();
  const deleteSkusMutation = useDeleteCartSkusMutation();
  const deleteGroupMutation = useDeleteCartGroupMutation();
  const deleteAllMutation = useDeleteAllCartMutation();
  const createDraftOrderMutation = useCreateDraftOrderMutation();
  const addWishlistItemMutation = useAddWishlistItemMutation();

  const groups = useMemo(
    () =>
      (query.data?.pages.flatMap((item) => item.data) || []).map((group: any) => ({
        ...group,
        cartSkus: getSkuItems(group).map((sku: any) => ({
          ...sku,
          cartGroupId: group.id,
          cartGroupCurrency: group?.marketplace?.currency,
        })),
      })),
    [query.data],
  );
  const allSkus = groups.flatMap((group: any) => group.cartSkus);
  const selectedSkus = allSkus.filter((sku: any) =>
    selectedSkuIds.includes(String(sku.id)),
  );
  const allSelected = allSkus.length > 0 && selectedSkuIds.length === allSkus.length;
  const selectedAmount = selectedSkus.reduce(
    (sum: number, sku: any) =>
      sum + getEffectiveUnitPrice(sku) * Number(sku.quantity || 0),
    0,
  );
  const selectedForeignAmount = selectedSkus.reduce(
    (sum: number, sku: any) => sum + getForeignPrice(sku) * Number(sku.quantity || 0),
    0,
  );
  const selectedCurrency = getCurrency(selectedSkus[0] || {});
  const selectedGroupCount = new Set(
    selectedSkus.map((sku: any) => String(sku.cartGroupId)),
  ).size;
  const visibleOrderServices = useMemo(
    () => orderServices.filter((service: any) => service.onlyStaff !== true),
    [orderServices],
  );

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node || !query.hasNextPage || query.isFetchingNextPage || query.isLoading) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0]?.isIntersecting &&
            query.hasNextPage &&
            !query.isFetchingNextPage
          ) {
            query.fetchNextPage();
          }
        },
        { rootMargin: "240px 0px" },
      );
      observerRef.current.observe(node);
    },
    [query.fetchNextPage, query.hasNextPage, query.isFetchingNextPage, query.isLoading],
  );

  const toggleSku = (skuId: string, checked: boolean) => {
    setSelectedSkuIds((current) =>
      checked
        ? Array.from(new Set([...current, skuId]))
        : current.filter((id) => id !== skuId),
    );
  };

  const toggleGroup = (group: any, checked: boolean) => {
    const skuIds = group.cartSkus.map((sku: any) => String(sku.id));
    setSelectedSkuIds((current) =>
      checked
        ? Array.from(new Set([...current, ...skuIds]))
        : current.filter((id) => !skuIds.includes(id)),
    );
  };

  const selectAll = (checked: boolean) => {
    setSelectedSkuIds(checked ? allSkus.map((sku: any) => String(sku.id)) : []);
  };

  const setProductsPerSeller = (value: number) => {
    setProductsPerSellerState(value);
    localStorage.setItem("productPerMerchant", String(value));
    setExpandedGroupIds([]);
  };

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroupIds((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId],
    );
  };

  const updateQuantity = async (sku: any, quantity: number | null) => {
    if (!quantity || quantity < 1) return;
    await updateSkuMutation.mutateAsync({
      id: String(sku.id),
      payload: { quantity },
    });
  };

  const openEditPrice = (sku: any) => {
    setEditingPriceSku(sku);
    setBargainPriceValue(
      sku?.bargainPrice !== null && sku?.bargainPrice !== undefined
        ? Number(sku.bargainPrice)
        : null,
    );
  };

  const updateBargainPrice = async () => {
    if (!editingPriceSku || bargainPriceValue === null) return;
    await updateSkuMutation.mutateAsync({
      id: String(editingPriceSku.id),
      payload: { bargainPrice: bargainPriceValue },
    });
    setEditingPriceSku(null);
    setBargainPriceValue(null);
  };

  const saveSkuToWishlist = async (skuId: string) => {
    if (savingSkuId) return;
    setSavingSkuId(skuId);
    try {
      await addWishlistItemMutation.mutateAsync({
        source: "cart",
        data: skuId,
      });
      notification.success({ message: t("message.successfully_saved_product") });
    } catch {
      notification.error({ message: t("message.fail_saved_product") });
    } finally {
      setSavingSkuId(null);
    }
  };

  const deleteSku = async (skuId: string) => {
    await deleteSkusMutation.mutateAsync([skuId]);
    setSelectedSkuIds((current) => current.filter((id) => id !== skuId));
  };

  const deleteSelected = async () => {
    if (!selectedSkuIds.length) return;
    await deleteSkusMutation.mutateAsync(selectedSkuIds);
    setSelectedSkuIds([]);
  };

  const deleteGroup = async (group: any) => {
    await deleteGroupMutation.mutateAsync(String(group.id));
    const skuIds = group.cartSkus.map((sku: any) => String(sku.id));
    setSelectedSkuIds((current) => current.filter((id) => !skuIds.includes(id)));
  };

  const deleteAll = async () => {
    await deleteAllMutation.mutateAsync();
    setSelectedSkuIds([]);
  };

  const getDraftServices = (group: any) => {
    const groupId = String(group.id);
    if (serviceDrafts[groupId]) return serviceDrafts[groupId];
    return Array.isArray(group.services)
      ? group.services.map((service: any) => service.code).filter(Boolean)
      : [];
  };

  const saveServices = async (group: any) => {
    const groupId = String(group.id);
    await updateServicesMutation.mutateAsync({
      id: groupId,
      serviceCodes: getDraftServices(group),
    });
    notification.success({ message: t("message.save_success") });
  };

  const toggleCartService = (group: any, service: any, checked: boolean) => {
    const groupId = String(group.id);
    setServiceDrafts((current) => {
      const selectedCodes =
        current[groupId] ??
        (Array.isArray(group.services)
          ? group.services.map((item: any) => item.code).filter(Boolean)
          : []);
      let nextCodes = [...selectedCodes];

      if (service?.serviceGroup?.single && checked) {
        const sameGroupCodes = visibleOrderServices
          .filter(
            (item: any) =>
              item?.serviceGroup?.code === service.serviceGroup.code,
          )
          .map((item: any) => item.code);
        nextCodes = nextCodes.filter((code) => !sameGroupCodes.includes(code));
      }

      if (checked) {
        nextCodes = Array.from(new Set([...nextCodes, service.code]));
      } else {
        nextCodes = nextCodes.filter((code) => code !== service.code);
      }

      return { ...current, [groupId]: nextCodes };
    });
  };

  const savePreferredServices = async (group: any) => {
    await updatePreferredServicesMutation.mutateAsync(getDraftServices(group));
    notification.success({ message: t("message.save_success") });
  };

  const changeCartGroupDraft = (
    groupId: string,
    field: string,
    value: string,
  ) => {
    if (value !== "" && value.trim() === "") return;
    setCartGroupDrafts((current) => ({
      ...current,
      [groupId]: {
        ...(current[groupId] || {}),
        [field]: value,
      },
    }));
  };

  const saveCartGroupField = async (
    group: any,
    field: "note" | "remark" | "refCustomerCode" | "refOrderCode",
  ) => {
    const groupId = String(group.id);
    const value = cartGroupDrafts[groupId]?.[field] || "";
    if ((group[field] || "") === value) return;

    await updateCartGroupMutation.mutateAsync({
      id: groupId,
      payload: { [field]: value },
    });
    notification.success({ message: t("message.update_success") });
  };

  const sellerSettingsLogic = {
    orderServices: visibleOrderServices,
    orderServiceGroups,
    serviceDrafts,
    cartGroupDrafts,
    toggleCartService,
    saveCartServices: saveServices,
    savePreferredServices,
    changeCartGroupDraft,
    saveCartGroupField,
    isSavingServices: updateServicesMutation.isPending,
    savingServicesGroupId: updateServicesMutation.variables?.id,
    isSavingPreferredServices: updatePreferredServicesMutation.isPending,
  };

  const placeOrder = async () => {
    if (!selectedSkuIds.length) return;
    const selectedGroupIds = new Set(
      selectedSkus.map((sku: any) => String(sku.cartGroupId)),
    );
    const selectedGroups = groups.filter((group: any) =>
      selectedGroupIds.has(String(group.id)),
    );
    const groupWithoutServices = selectedGroups.find(
      (group: any) => !getDraftServices(group).length,
    );
    if (groupWithoutServices) {
      notification.error({ message: t("cart.choose_service_first") });
      return;
    }
    const unsavedGroup = selectedGroups.find((group: any) => {
      const originalCodes = Array.isArray(group.services)
        ? group.services.map((service: any) => service.code).filter(Boolean)
        : [];
      return !sameCodes(originalCodes, getDraftServices(group));
    });
    if (unsavedGroup) {
      notification.warning({ message: t("cart.unsaved_service_warning") });
      return;
    }
    const result = await createDraftOrderMutation.mutateAsync({ skus: selectedSkuIds });
    navigate(`/carts/checkout/${result.data.id}`);
  };

  if (query.isLoading) {
    return <CartLoadingSkeleton />;
  }

  return (
    <div style={{ paddingBottom: 220 }}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Card>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Flex justify="space-between" align="flex-start" gap={12}>
              <Space size={10} style={{ minWidth: 0 }}>
                <Avatar
                  shape="square"
                  icon={<ShoppingCartOutlined />}
                  style={{ background: token.colorPrimaryBg, color: token.colorPrimary }}
                />
                <div style={{ minWidth: 0 }}>
                  <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>
                    {t("mainLayout.cart")}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                    {t("cart.product_per_seller")}: {productsPerSeller}
                  </Text>
                </div>
              </Space>
              <Switch
                checked={translated}
                onChange={setTranslated}
                checkedChildren={t("cart.translated_name")}
                unCheckedChildren={t("cart.original_name")}
              />
            </Flex>
            <Flex
              justify="space-between"
              align="center"
              gap={8}
              style={{
                paddingTop: token.paddingSM,
                borderTop: `1px solid ${token.colorSplit}`,
              }}
            >
              <Space size={8} style={{ minWidth: 0, flex: 1 }}>
                <Text type="secondary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                  {t("cart.product_per_seller")}
                </Text>
                <Select
                  value={productsPerSeller}
                  onChange={setProductsPerSeller}
                  options={[5, 10, 20, 30, 40, 50].map((value) => ({
                    value,
                    label: value,
                  }))}
                  style={{ width: 84 }}
                />
              </Space>
              <Popconfirm
                title={t("cart.delete_all_seller_confirm")}
                okText={t("button.delete")}
                cancelText={t("button.cancel")}
                onConfirm={deleteAll}
              >
                <Button danger loading={deleteAllMutation.isPending}>
                  {t("taobaoGlobalCart.deleteAll")}
                </Button>
              </Popconfirm>
            </Flex>
            <Button
              block
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddProductsOpen(true)}
            >
              {t("button.add_products")}
            </Button>
          </Space>
        </Card>

        {!groups.length ? (
          <Card>
            <Empty
              image={<ShoppingCartOutlined style={{ fontSize: 48 }} />}
              description={t("cart.empty")}
            />
          </Card>
        ) : (
          <List
            split={false}
            dataSource={groups}
            rowKey={(group: any) => String(group.id)}
            renderItem={(group: any, index) => {
            const selectedCount = group.cartSkus.filter((sku: any) =>
              selectedSkuIds.includes(String(sku.id)),
            ).length;
            const allGroupSelected =
              group.cartSkus.length > 0 && selectedCount === group.cartSkus.length;
            const groupId = String(group.id);
            const isExpanded = expandedGroupIds.includes(groupId);
            const visibleSkus = isExpanded
              ? group.cartSkus
              : group.cartSkus.slice(0, productsPerSeller);

            return (
              <List.Item
                ref={index === groups.length - 1 ? sentinelRef : undefined}
                style={{ padding: 0, borderBlockEnd: "none", marginBottom: token.marginMD }}
              >
                <Card
                  style={{ width: "100%" }}
                  styles={{ body: { padding: token.paddingMD } }}
                  title={
                    <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                      <Checkbox
                        checked={allGroupSelected}
                        indeterminate={selectedCount > 0 && !allGroupSelected}
                        onChange={(event) => toggleGroup(group, event.target.checked)}
                      />
                      {group?.marketplace?.image ? (
                        <Avatar shape="square" src={group.marketplace.image} />
                      ) : (
                        <Avatar shape="square" icon={<ShopOutlined />} />
                      )}
                      <Text strong ellipsis style={{ minWidth: 0 }}>
                        {group.name || group.code || t("cart.shop")}
                      </Text>
                    </Flex>
                  }
                  extra={
                    <Space size={0}>
                      <Button
                        type="text"
                        icon={<SettingOutlined />}
                        onClick={() => setActiveSeller(group)}
                      />
                      <Popconfirm
                        title={t("cart.delete_seller_confirm")}
                        okText={t("button.delete")}
                        cancelText={t("button.cancel")}
                        onConfirm={() => deleteGroup(group)}
                      >
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        loading={deleteGroupMutation.variables === String(group.id)}
                      />
                      </Popconfirm>
                    </Space>
                  }
                >
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <List
                      split={false}
                      dataSource={visibleSkus}
                      renderItem={(sku: any) => {
                        const skuId = String(sku.id);
                        const image = getImage(sku);
                        const quantity = Number(sku.quantity || 0);
                        return (
                          <List.Item style={{ padding: 0, marginBottom: token.marginSM }}>
                            <Card size="small" style={{ width: "100%" }}>
                              <Flex align="flex-start" gap={8}>
                                <Checkbox
                                  checked={selectedSkuIds.includes(skuId)}
                                  onChange={(event) => toggleSku(skuId, event.target.checked)}
                                />
                                {image ? (
                                  <Image
                                    src={image}
                                    width={40}
                                    height={40}
                                    preview={false}
                                    referrerPolicy="no-referrer"
                                    style={{ objectFit: "cover", borderRadius: token.borderRadiusSM }}
                                  />
                                ) : (
                                  <Avatar shape="square" size={40} icon={<ShoppingCartOutlined />} />
                                )}
                                <Space direction="vertical" size={4} style={{ minWidth: 0, flex: 1 }}>
                                  <Text strong ellipsis={{ tooltip: getName(sku, translated) }}>
                                    {getName(sku, translated)}
                                  </Text>
                                  <Text type="secondary" ellipsis={{ tooltip: getProperties(sku, translated) || "---" }}>
                                    {getProperties(sku, translated) || "---"}
                                  </Text>
                                </Space>
                                <Space size={0}>
                                  <Tooltip title={t("cart.save_product")}>
                                    <Button
                                      type="text"
                                      icon={<HeartOutlined />}
                                      loading={savingSkuId === skuId}
                                      onClick={() => saveSkuToWishlist(skuId)}
                                    />
                                  </Tooltip>
                                  <Popconfirm
                                    title={t("cartGroup.delete_product_confirm")}
                                    okText={t("button.delete")}
                                    cancelText={t("button.cancel")}
                                    onConfirm={() => deleteSku(skuId)}
                                  >
                                    <Tooltip title={t("cart.delete_product")}>
                                      <Button
                                        danger
                                        type="text"
                                        icon={<DeleteOutlined />}
                                        loading={deleteSkusMutation.variables?.[0] === skuId}
                                      />
                                    </Tooltip>
                                  </Popconfirm>
                                </Space>
                              </Flex>
                              <Flex
                                justify="space-between"
                                align="stretch"
                                gap={8}
                                style={{
                                  marginTop: token.marginSM,
                                  paddingTop: token.paddingSM,
                                  borderTop: `1px solid ${token.colorSplit}`,
                                }}
                              >
                                <Space direction="vertical" size={2} style={{ flex: 1, minWidth: 0 }}>
                                  <Flex align="center" gap={2} style={{ height: 24 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {t("order.sale_price")}
                                    </Text>
                                    <Tooltip title={t("cart.edit_bargain_price")}>
                                      <Button
                                        type="link"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => openEditPrice(sku)}
                                        style={{ height: 20, paddingInline: 2, lineHeight: 1 }}
                                      />
                                    </Tooltip>
                                  </Flex>
                                  <Text strong ellipsis>
                                    {sku.bargainPrice !== null && sku.bargainPrice !== undefined ? (
                                      <>
                                        <Text delete type="secondary">
                                          {formatCurrency(getForeignSalePrice(sku), getCurrency(sku))}
                                        </Text>{" "}
                                        / {formatCurrency(getForeignBargainPrice(sku), getCurrency(sku))}
                                      </>
                                    ) : (
                                      formatCurrency(getForeignSalePrice(sku), getCurrency(sku))
                                    )}
                                  </Text>
                                  <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                                    {sku.bargainPrice !== null && sku.bargainPrice !== undefined ? (
                                      <>
                                        <Text delete type="secondary" style={{ fontSize: 12 }}>
                                          {formatCurrency(getUnitPrice(sku))}
                                        </Text>{" "}
                                        / {formatCurrency(getEffectiveUnitPrice(sku))}
                                      </>
                                    ) : (
                                      formatCurrency(getUnitPrice(sku))
                                    )}
                                  </Text>
                                </Space>
                                <Space direction="vertical" size={2} style={{ width: 96 }}>
                                  <Text type="secondary" style={{ fontSize: 12, height: 24, lineHeight: "24px" }}>
                                    {t("order.quantity")}
                                  </Text>
                                  <InputNumber
                                    min={1}
                                    value={quantity}
                                    disabled={updateSkuMutation.isPending}
                                    onChange={(value) => updateQuantity(sku, value)}
                                    style={{ width: "100%" }}
                                  />
                                </Space>
                                <Space
                                  direction="vertical"
                                  size={2}
                                  style={{ flex: 1, minWidth: 0, textAlign: "right" }}
                                >
                                  <Text type="secondary" style={{ fontSize: 12, height: 24, lineHeight: "24px" }}>
                                    {t("order.total_price")}
                                  </Text>
                                  <Text strong ellipsis style={{ color: token.colorPrimary }}>
                                    {formatCurrency(getForeignPrice(sku) * quantity, getCurrency(sku))}
                                  </Text>
                                  <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                                    {formatCurrency(getEffectiveUnitPrice(sku) * quantity)}
                                  </Text>
                                </Space>
                              </Flex>
                            </Card>
                          </List.Item>
                        );
                      }}
                    />
                    {group.cartSkus.length > productsPerSeller ? (
                      <Button
                        type="link"
                        block
                        icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                        onClick={() => toggleGroupExpanded(groupId)}
                      >
                        {isExpanded ? t("button.collapse") : t("button.loadmore")}
                      </Button>
                    ) : null}

                  </Space>
                </Card>
              </List.Item>
            );
            }}
          />
        )}

        {query.isFetchingNextPage ? (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <CartSellerCardSkeleton key={`load-more-${index}`} index={index} />
            ))}
          </>
        ) : null}
        {query.hasNextPage && !query.isFetchingNextPage ? (
          <Button block onClick={() => query.fetchNextPage()}>
            {t("button.loadmore")}
          </Button>
        ) : null}
        {!query.hasNextPage && groups.length ? (
          <Text type="secondary" style={{ display: "block", textAlign: "center" }}>
            {t("common.no_more_data")}
          </Text>
        ) : null}
      </Space>

      <Card
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
          zIndex: 20,
          borderRadius: 0,
          boxShadow: "0 -6px 18px rgba(0, 0, 0, 0.12)",
        }}
        styles={{ body: { padding: 16 } }}
      >
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Flex justify="space-between" align="center">
            <Checkbox checked={allSelected} onChange={(event) => selectAll(event.target.checked)}>
              {t("taobaoGlobalCart.selectAll")}
            </Checkbox>
            <Popconfirm
              title={t("cartGroup.delete_product_confirm")}
              okText={t("button.delete")}
              cancelText={t("button.cancel")}
              onConfirm={deleteSelected}
            >
              <Button danger type="link" disabled={!selectedSkuIds.length} loading={deleteSkusMutation.isPending}>
                {t("taobaoGlobalCart.deleteAll")}
              </Button>
            </Popconfirm>
          </Flex>
          {query.isFetching && !query.isFetchingNextPage ? (
            <Alert type="info" message={t("common.loading")} showIcon />
          ) : null}
          <Flex justify="space-between" align="center" gap={12}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("cart.total")}:
              </Text>{" "}
              <Text strong ellipsis style={{ color: token.colorPrimary }}>
                {formatCurrency(selectedForeignAmount, selectedCurrency)}
              </Text>{" "}
              <Text type="secondary" style={{ fontSize: 12 }}>
                ({formatCurrency(selectedAmount)})
              </Text>
              <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                {selectedGroupCount} {t("cart.shop")} / {selectedSkus.length}{" "}
                {t("order.product")}
              </Text>
            </div>
            <Button
              type="primary"
              size="middle"
              disabled={!selectedSkuIds.length}
              loading={createDraftOrderMutation.isPending}
              onClick={placeOrder}
              style={{ flexShrink: 0, minWidth: 92 }}
            >
              {t("cart.order")}
            </Button>
          </Flex>
        </Space>
      </Card>

      <CartSellerSettingsModal
        group={activeSeller}
        open={!!activeSeller}
        onClose={() => setActiveSeller(null)}
        logic={sellerSettingsLogic}
      />

      <AddProductsModal
        open={addProductsOpen}
        onClose={() => setAddProductsOpen(false)}
      />

      <Modal
        title={t("cart.edit_bargain_price")}
        open={!!editingPriceSku}
        onCancel={() => {
          setEditingPriceSku(null);
          setBargainPriceValue(null);
        }}
        okText={t("button.save")}
        cancelText={t("button.cancel")}
        confirmLoading={updateSkuMutation.isPending}
        onOk={updateBargainPrice}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {editingPriceSku ? (
            <Space direction="vertical" size={2}>
              <Text type="secondary">{t("cart.original_price")}</Text>
              <Text strong>
                {formatCurrency(
                  getForeignSalePrice(editingPriceSku),
                  getCurrency(editingPriceSku),
                )}
              </Text>
              <Text type="secondary">{formatCurrency(getUnitPrice(editingPriceSku))}</Text>
            </Space>
          ) : null}
          <InputNumber
            min={0}
            value={bargainPriceValue}
            placeholder={t("cart.bargain_price")}
            onChange={(value) => setBargainPriceValue(value)}
            style={{ width: "100%" }}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default CartsPage;
