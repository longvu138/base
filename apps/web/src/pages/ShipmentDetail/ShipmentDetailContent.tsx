import { Fragment, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { moneyFormat } from "@repo/util";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Popover,
  Popconfirm,
  Row,
  Select,
  Skeleton,
  Space,
  Spin,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "@repo/i18n";
import {
  ClockCircleOutlined,
  CloseOutlined,
  DollarOutlined,
  DownOutlined,
  InfoCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  RocketOutlined,
  SaveOutlined,
  ShopOutlined,
  ShrinkOutlined,
} from "@ant-design/icons";
import {
  useParcelMilestonesQuery,
  useShipmentShippingFeesQuery,
} from "@repo/hooks";
import {
  useShipmentDetailContent,
  type AnyRecord,
} from "./hooks/useShipmentDetailContent";

interface ShipmentDetailContentProps {
  shipment: AnyRecord;
  statusData?: AnyRecord[];
}

const empty = "---";
const productPageSize = 25;
const { TextArea } = Input;
const { Text } = Typography;

const asArray = (value: any): AnyRecord[] =>
  Array.isArray(value) ? value : [];

const display = (value: any): string => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "number" && Number.isNaN(value))
  ) {
    return empty;
  }
  return `${value}`;
};

const quantity = (value: any): string => {
  if (value === null || value === undefined || value === "") return empty;
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return display(value);
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(
    numericValue,
  );
};

const money = (value: any, currency?: string, noNegative?: boolean): string =>
  moneyFormat(value, currency, noNegative);

// Match the legacy shipment detail screen, where Math.round coerces null,
// empty strings, and numeric strings before formatting.
const roundShipmentMoney = (value: unknown) => Math.round(value as number);

const roundedMoney = (
  value: any,
  currency?: string,
  noNegative?: boolean,
): string => moneyFormat(roundShipmentMoney(value), currency, noNegative);

const feeMoney = (value: any, noNegative?: boolean): string =>
  roundedMoney(value, undefined, noNegative);

const dateTime = (value: any): string =>
  value ? dayjs(value).format("HH:mm DD/MM/YYYY") : empty;

const shortDateTime = (value: any): string =>
  value ? dayjs(value).format("HH:mm DD/MM") : empty;

const sortNewest = (items: AnyRecord[], key = "createdAt") =>
  [...items].sort((a, b) => dayjs(b[key]).valueOf() - dayjs(a[key]).valueOf());

const sortByPosition = (items: AnyRecord[]) =>
  [...items].sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0));

const stripProductCode = (code: any) => {
  const value = display(code);
  return value.includes("_") ? value.substring(value.indexOf("_") + 1) : value;
};

const getVariantText = (item: AnyRecord) =>
  asArray(item.variantProperties)
    .filter((x) => x.originalName !== null && x.originalValue !== null)
    .map((x) => `${x.originalName}: ${x.originalValue}`)
    .join(", ");

const formatAddress = (address: AnyRecord | undefined, receipt = false) => {
  if (!address) return empty;
  const detail = receipt ? address.detail : address.address;
  const location = address.location?.display;
  return [
    address.fullname,
    address.phone,
    [detail, location].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" / ");
};

const logValue = (value: any): string => {
  if (Array.isArray(value)) return value.map(logValue).join(", ");
  if (typeof value === "object" && value !== null) {
    return display(
      value.name ?? value.displayName ?? value.display ?? value.code,
    );
  }
  return display(value);
};

const activityText = (
  item: AnyRecord,
  t: (key: string, data?: any) => string,
) => {
  const data = Array.isArray(item.data) ? item.data[0] : (item.data ?? {});
  const property = item.property ?? data.property ?? item.activity ?? item.type;
  const logData = {
    ...item,
    ...data,
    property,
    oldValue: logValue(data.oldValue ?? item.oldValue),
    newValue: logValue(data.newValue ?? item.newValue),
    value: logValue(data.value ?? item.value),
    addValue: logValue(data.addValue ?? item.addValue),
    removeValue: logValue(data.removeValue ?? item.removeValue),
    name: logValue(data.name ?? item.name),
    code: logValue(data.code ?? item.code),
    amount: logValue(data.amount ?? item.amount),
    reason: logValue(data.reason ?? item.reason),
    content: logValue(data.content ?? item.content ?? item.memo),
    service: logValue(data.service ?? item.service),
    productName: logValue(data.productName ?? item.productName),
  };

  if (property) {
    const key = `shipment_log.${property}`;
    const translated = t(key, logData);
    if (translated !== key) return translated;
  }

  if (item.memo) return item.memo;
  if (data.oldValue !== undefined || data.newValue !== undefined) {
    return `${display(data.property)}: ${logData.oldValue} -> ${logData.newValue}`;
  }
  return display(item.activity ?? item.type);
};

const MilestoneDescription = ({ milestones }: { milestones: AnyRecord[] }) => {
  const { t } = useTranslation();

  if (milestones.length === 0) {
    return (
      <Text type="secondary">{t("shipments.undefined_handling_time")}</Text>
    );
  }

  return (
    <Space direction="vertical" size={0} align="center">
      {milestones.map((item, index) => {
        const handlingTime = item.handlingTime;
        const dayLabel =
          Number(handlingTime) === 0 ? t("label.day") : t("label.days");

        return (
          <div
            key={`${item.status}-${item.timestamp}-${index}`}
            style={{ textAlign: "center" }}
          >
            <Text strong={index === 0}>{shortDateTime(item.timestamp)}</Text>
            <br />
            <Text strong={index === 0} type="secondary">
              {handlingTime === null || handlingTime === undefined
                ? `( ${t("shipments.undefined_handling_time")} )`
                : `( ${handlingTime} ${dayLabel} )`}
            </Text>
          </div>
        );
      })}
    </Space>
  );
};

const ParcelTimeline = ({
  parcel,
  statuses,
  active,
}: {
  parcel: AnyRecord;
  statuses: AnyRecord[];
  active: boolean;
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { data: milestones = [], isLoading } = useParcelMilestonesQuery(
    parcel.code,
    active,
  );

  const orderedStatuses = useMemo(
    () => sortByPosition(asArray(statuses)),
    [statuses],
  );
  const currentStatus = useMemo(
    () => orderedStatuses.find((item) => item.code === parcel.status) || {},
    [orderedStatuses, parcel.status],
  );
  const currentIndex = useMemo(
    () => orderedStatuses.findIndex((item) => item.code === parcel.status),
    [orderedStatuses, parcel.status],
  );
  const normalStatuses = useMemo(
    () => orderedStatuses.filter((item) => !item.negativeEnd),
    [orderedStatuses],
  );

  const timelineStatuses = useMemo(() => {
    if (!currentStatus.negativeEnd) return normalStatuses;

    const previousMilestones = asArray(milestones)
      .filter((item) => item.status !== currentStatus.code)
      .sort(
        (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf(),
      );
    const lastMilestone = previousMilestones[0];
    const lastIndex = lastMilestone
      ? orderedStatuses.findIndex((item) => item.code === lastMilestone.status)
      : 0;

    return [
      ...orderedStatuses
        .slice(0, Math.max(lastIndex + 1, 1))
        .filter((item) => !item.negativeEnd),
      currentStatus,
    ];
  }, [currentStatus, milestones, normalStatuses, orderedStatuses]);

  if (isLoading) {
    return (
      <div style={{ padding: token.padding }}>
        <Skeleton active paragraph={{ rows: 1 }} />
      </div>
    );
  }

  if (orderedStatuses.length === 0) {
    return <Empty description={t("package_tab.empty_milestone")} />;
  }

  const activeIndex = currentStatus.negativeEnd
    ? timelineStatuses.length - 1
    : Math.max(currentIndex, 0);

  return (
    <div style={{ padding: `${token.paddingMD}px ${token.padding}px` }}>
      <Steps
        size="small"
        progressDot
        direction="vertical"
        current={activeIndex}
        status={currentStatus.negativeEnd ? "error" : "process"}
        items={timelineStatuses.map((status) => {
          const statusMilestones = asArray(milestones)
            .filter((item) => item.status === status.code)
            .sort(
              (a, b) =>
                dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf(),
            );

          return {
            key: status.id || status.code,
            title: status.name,
            description: <MilestoneDescription milestones={statusMilestones} />,
          };
        })}
      />
    </div>
  );
};

const ParcelTimelinePopover = ({
  parcel,
  statuses,
}: {
  parcel: AnyRecord;
  statuses: AnyRecord[];
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [open, setOpen] = useState(false);

  return (
    <Popover
      trigger="hover"
      placement="right"
      open={open}
      onOpenChange={setOpen}
      mouseEnterDelay={0.1}
      content={
        <div style={{ width: "max-content", maxWidth: "80vw" }}>
          <ParcelTimeline parcel={parcel} statuses={statuses} active={open} />
        </div>
      }
    >
      <Typography.Link style={{ color: token.colorPrimary, cursor: "pointer" }}>
        {t("button.detail")}
      </Typography.Link>
    </Popover>
  );
};

export const ShipmentDetailContent = ({
  shipment,
  statusData,
}: ShipmentDetailContentProps) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const detail = useShipmentDetailContent({ shipment, statusData });
  const {
    isExpand,
    setIsExpand,
    editingField,
    draftValue,
    setDraftValue,
    originalReceiptModalOpen,
    setOriginalReceiptModalOpen,
    originalReceiptCode,
    setOriginalReceiptCode,
    productModalOpen,
    currentProduct,
    productDraft,
    productErrors,
    isCreatingWaybill,
    setIsCreatingWaybill,
    waybillCodeDraft,
    setWaybillCodeDraft,
    isProductExpanded,
    setIsProductExpanded,
    expandedWaybillKeys,
    setExpandedWaybillKeys,
    claimModalOpen,
    setClaimModalOpen,
    collectModalOpen,
    setCollectModalOpen,
    feeTableConfig,
    setFeeTableConfig,
    couponModalOpen,
    couponCode,
    changeCouponCode,
    couponValidMessage,
    couponValidTo,
    couponValid,
    checkVoucher,
    applyShipmentCoupon,
    cancelShipment,
    activeTab,
    handleTabChange,
    currency,
    statusInfo,
    shipmentWaybillThreshold,
    productRows,
    visibleProductRows,
    parcelRows,
    shipmentLogRows,
    hsCode,
    receiptText,
    services,
    freePackages,
    showPackageAlert,
    taxFreeThreshHold,
    activeThirdPartyLoan,
    totalNeedPay,
    waybillRows,
    parcelStatuses,
    fees,
    shipmentFees,
    financial,
    financialClaim,
    financialCollect,
    claims,
    coupons,
    milestones,
    originalReceipts,
    hsList,
    credits,
    loans,
    isProductsLoading,
    isWaybillsLoading,
    isParcelsLoading,
    isFeesLoading,
    isFinancialLoading,
    isFinancialClaimLoading,
    isFinancialCollectLoading,
    isClaimsLoading,
    isMilestonesLoading,
    isActivitiesLoading,
    isCreditsLoading,
    isLoansLoading,
    addOriginalReceipt,
    createProduct,
    updateProduct,
    createWaybill,
    startEdit,
    cancelEdit,
    saveShipmentField,
    cancelShipmentOrder,
    addReceipt,
    removeReceipt,
    openProductModal,
    closeProductModal,
    updateProductDraft,
    submitProduct,
    removeProduct,
    submitWaybill,
    removeWaybill,
    openCouponModal,
    closeCouponModal,
    checkCouponCode,
    submitCouponCode,
  } = detail;

  const styles: Record<string, CSSProperties> = {
    inlineActions: {
      display: "inline-flex",
      alignItems: "center",
      gap: token.marginXS,
    },
    inlineEdit: {
      display: "inline-flex",
      alignItems: "flex-start",
      gap: token.marginXS,
      width: "100%",
      maxWidth: 520,
    },
    iconPrimary: {
      color: token.colorPrimary,
      cursor: "pointer",
    },
    iconMuted: {
      color: token.colorTextQuaternary,
      cursor: "pointer",
    },
    muted: {
      color: token.colorTextSecondary,
      fontSize: token.fontSizeSM,
    },
    strong: {
      color: token.colorText,
      fontWeight: token.fontWeightStrong,
    },
    preWrap: {
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    },
    linkButton: {
      padding: 0,
    },
    fullWidth: {
      width: "100%",
    },
    right: {
      textAlign: "right",
    },
  };

  const renderNumberEditor = (
    field: string,
    value: any,
    displayValue: string,
    canEdit: boolean,
    placeholder: string,
  ) => {
    if (editingField === field) {
      return (
        <span style={{ ...styles.inlineActions, maxWidth: 260 }}>
          <InputNumber
            min={0}
            precision={0}
            value={draftValue}
            placeholder={placeholder}
            style={styles.fullWidth}
            formatter={(inputValue) =>
              `${inputValue ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(inputValue) =>
              (inputValue || "").replace(/\$\s?|(,*)/g, "") as any
            }
            onChange={(nextValue) => setDraftValue(nextValue ?? null)}
            onPressEnter={() =>
              saveShipmentField(field, draftValue === "" ? null : draftValue)
            }
          />
          <SaveOutlined
            style={styles.iconPrimary}
            onMouseDown={() =>
              saveShipmentField(field, draftValue === "" ? null : draftValue)
            }
          />
          <CloseOutlined style={styles.iconMuted} onClick={cancelEdit} />
        </span>
      );
    }

    return (
      <span style={styles.inlineActions}>
        <span>{displayValue}</span>
        {canEdit && (
          <EditOutlined
            style={styles.iconPrimary}
            onClick={() => startEdit(field, value)}
          />
        )}
      </span>
    );
  };

  const renderTextEditor = (
    field: string,
    value: any,
    placeholder: string,
    multiline = false,
  ) => {
    if (editingField === field) {
      const input = multiline ? (
        <TextArea
          value={draftValue ?? ""}
          maxLength={1000}
          autoSize={{ minRows: 1, maxRows: 3 }}
          placeholder={placeholder}
          onChange={(event) => setDraftValue(event.target.value)}
          onPressEnter={(event) => {
            if (!event.shiftKey) {
              event.preventDefault();
              saveShipmentField(field, draftValue ?? "");
            }
          }}
        />
      ) : (
        <Input
          value={draftValue ?? ""}
          maxLength={1000}
          placeholder={placeholder}
          onChange={(event) => setDraftValue(event.target.value)}
          onPressEnter={() => saveShipmentField(field, draftValue ?? "")}
        />
      );

      return (
        <span style={styles.inlineEdit}>
          <span style={{ flex: 1, minWidth: 0 }}>{input}</span>
          <SaveOutlined
            style={{ ...styles.iconPrimary, marginTop: token.marginXS }}
            onMouseDown={() => saveShipmentField(field, draftValue ?? "")}
          />
          <CloseOutlined
            style={{ ...styles.iconMuted, marginTop: token.marginXS }}
            onClick={cancelEdit}
          />
        </span>
      );
    }

    return (
      <span style={{ ...styles.inlineActions, minWidth: 0 }}>
        <span style={styles.preWrap}>{display(value)}</span>
        <EditOutlined
          style={styles.iconPrimary}
          onClick={() => startEdit(field, value ?? "")}
        />
      </span>
    );
  };

  const renderPersonalNote = () => {
    if (editingField === "note") {
      return (
        <Space direction="vertical" size={4} style={styles.fullWidth}>
          <TextArea
            value={draftValue ?? ""}
            maxLength={1000}
            autoSize={{ minRows: 1, maxRows: 3 }}
            placeholder={t("shipments.personal_note_for_order")}
            onChange={(event) => setDraftValue(event.target.value)}
            onPressEnter={(event) => {
              if (
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey
              ) {
                event.preventDefault();
                saveShipmentField("note", draftValue ?? "");
              }
            }}
          />
          <Flex justify="space-between" align="center" gap={token.marginXS}>
            <Text type="secondary">{t("shipments.note_keydown")}</Text>
            <Space size={token.marginXS}>
              <Button
                size="small"
                type="primary"
                icon={<SaveOutlined />}
                onMouseDown={() => saveShipmentField("note", draftValue ?? "")}
              >
                {t("common.save")}
              </Button>
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={cancelEdit}
              >
                {t("common.cancel")}
              </Button>
            </Space>
          </Flex>
        </Space>
      );
    }

    if (shipment.note) {
      return (
        <span style={{ ...styles.inlineActions, minWidth: 0 }}>
          <span style={styles.preWrap}>{shipment.note}</span>
          <EditOutlined
            style={styles.iconPrimary}
            onClick={() => startEdit("note", shipment.note ?? "")}
          />
        </span>
      );
    }

    return (
      <Typography.Link onClick={() => startEdit("note", "")}>
        <Space size={token.marginXS}>
          <span>{t("shipments.personal_note_for_order")}</span>
          <Tooltip title={t("shipments.personal_note_content")}>
            <QuestionCircleOutlined
              style={{ color: token.colorTextTertiary }}
            />
          </Tooltip>
        </Space>
      </Typography.Link>
    );
  };

  const renderHsCodeEditor = () => {
    if (editingField === "hsCode") {
      return (
        <span style={{ ...styles.inlineActions, maxWidth: 320 }}>
          <Select
            showSearch
            value={draftValue ?? undefined}
            style={{ minWidth: 240 }}
            placeholder={t("shipments.hsCode")}
            optionFilterProp="label"
            options={asArray(hsList).map((item) => ({
              value: item.code,
              label: item.name || item.code,
            }))}
            onChange={(nextValue) => saveShipmentField("hsCode", nextValue)}
          />
          <CloseOutlined style={styles.iconMuted} onClick={cancelEdit} />
        </span>
      );
    }

    return (
      <span style={styles.inlineActions}>
        <span>{display(hsCode?.name)}</span>
        {!statusInfo?.negativeEnd && (
          <EditOutlined
            style={styles.iconPrimary}
            onClick={() => startEdit("hsCode", shipment.hsCode)}
          />
        )}
      </span>
    );
  };

  const waybillColumns: ColumnsType<AnyRecord> = [
    {
      title: `Mã vận đơn (${waybillRows.filter((item) => item.code).length}/${shipmentWaybillThreshold})`,
      dataIndex: "code",
      render: (text, _row, index) => {
        if (index === 0 && waybillRows.some((item) => item.code === null)) {
          return {
            children: isCreatingWaybill ? (
              <span style={styles.inlineActions}>
                <Input
                  value={waybillCodeDraft}
                  style={{ width: 180 }}
                  placeholder="Mã vận đơn"
                  onChange={(event) =>
                    setWaybillCodeDraft(
                      /^([a-zA-Z0-9_.:-])*$/.test(event.target.value)
                        ? event.target.value
                        : waybillCodeDraft,
                    )
                  }
                  onPressEnter={submitWaybill}
                />
                <Button
                  type="primary"
                  size="small"
                  ghost
                  disabled={!waybillCodeDraft}
                  loading={createWaybill.isPending}
                  onClick={submitWaybill}
                >
                  Lưu
                </Button>
                <Button
                  danger
                  size="small"
                  ghost
                  onClick={() => {
                    setIsCreatingWaybill(false);
                    setWaybillCodeDraft("");
                  }}
                >
                  Hủy
                </Button>
              </span>
            ) : (
              <Button
                type="link"
                icon={<PlayCircleOutlined />}
                style={styles.linkButton}
                onClick={() => setIsCreatingWaybill(true)}
              >
                Tạo mã vận đơn
              </Button>
            ),
            props: { colSpan: 4 },
          };
        }
        return display(text);
      },
    },
    {
      title: "Tổng kiện",
      dataIndex: "total",
      align: "right",
      render: (_, row, index) => {
        if (index === 0 && waybillRows.some((item) => item.code === null)) {
          return { props: { colSpan: 0 } };
        }
        const rowParcels = row.emptyWaybill
          ? parcelRows.filter((item) => !item.waybillCode)
          : parcelRows.filter((item) => item.waybillCode === row.code);
        return quantity(rowParcels.length);
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (text, _row, index) =>
        index === 0 && waybillRows.some((item) => item.code === null)
          ? { props: { colSpan: 0 } }
          : dateTime(text),
    },
    {
      title: "",
      dataIndex: "actions",
      align: "right",
      render: (_text, row, index) => {
        if (index === 0 && waybillRows.some((item) => item.code === null)) {
          return { props: { colSpan: 0 } };
        }
        const rowParcels = getParcelsForWaybill(row, parcelRows);
        return statusInfo?.updatable &&
          row.customer &&
          rowParcels.length === 0 ? (
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            okText="Có"
            cancelText="Không"
            onConfirm={() => removeWaybill(row.code)}
          >
            <Button type="link" style={styles.linkButton}>
              Xóa
            </Button>
          </Popconfirm>
        ) : null;
      },
    },
  ];

  const parcelColumns: ColumnsType<AnyRecord> = [
    {
      title: "Mã kiện",
      dataIndex: "code",
      render: (text, row) => (
        <div>
          <Typography.Text style={{ textTransform: "uppercase" }}>
            {display(text)}
          </Typography.Text>
          {row.note && (
            <Typography.Text style={{ color: token.colorPrimary }}>
              Ghi chú
            </Typography.Text>
          )}
        </div>
      ),
    },
    {
      title: "Thể tích",
      dataIndex: "volumetric",
      render: (text) => (text ? `${quantity(text)} cm3` : "Không xác định"),
    },
    {
      title: "Cân nặng",
      dataIndex: "actualWeight",
      render: (text) =>
        Number.isFinite(Number(text))
          ? `${quantity(text)} kg`
          : "Không xác định",
    },
    {
      title: "Thông tin",
      dataIndex: "information",
      render: (_, row) => (
        <div style={{ whiteSpace: "nowrap" }}>
          <div>
            Chiều dài:{" "}
            {Number.isFinite(Number(row.length)) ? `${row.length} cm` : empty}
          </div>
          <div>
            Chiều rộng:{" "}
            {Number.isFinite(Number(row.width)) ? `${row.width} cm` : empty}
          </div>
          <div>
            Chiều cao:{" "}
            {Number.isFinite(Number(row.height)) ? `${row.height} cm` : empty}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (text) => {
        const found = asArray(parcelStatuses).find(
          (item) => item.code === text,
        );
        return (
          <Tag color={found?.color || "default"}>
            {display(found?.name ?? text)}
          </Tag>
        );
      },
    },
    {
      title: "Thời gian cập nhật",
      dataIndex: "modifiedAt",
      render: (text) => shortDateTime(text),
    },
    {
      title: "",
      dataIndex: "action",
      align: "right",
      render: (_text, row) => (
        <ParcelTimelinePopover
          parcel={row}
          statuses={asArray(parcelStatuses)}
        />
      ),
    },
  ];

  const financeColumns: ColumnsType<AnyRecord> = [
    {
      title: t("financial_tab.time"),
      dataIndex: "timestamp",
      className: "_financial-time",
      render: (text) => <Typography.Text>{dateTime(text)}</Typography.Text>,
    },
    {
      title: t("financial_tab.amount"),
      dataIndex: "amount",
      className: "_financial-amount",
      render: (amount) => (
        <Typography.Text
          style={{
            color: Number(amount) < 0 ? token.colorError : token.colorSuccess,
          }}
        >
          {feeMoney(amount)}
        </Typography.Text>
      ),
    },
    {
      title: t("financial_tab.transaction_type"),
      dataIndex: "type",
      className: "_financial-type",
      render: (type) => display(type?.name ?? type),
    },
    {
      title: t("financial_tab.content"),
      dataIndex: "memo",
      className: "_financial-memo",
      render: (memo, record) => (
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {t("shipments.title_transaction_code")} : {display(record.txid)}
          </Typography.Text>
          <div>{display(memo)}</div>
        </div>
      ),
    },
  ];

  const financialClaimColumns: ColumnsType<AnyRecord> = [
    {
      title: t("fee_tab.refunded_name"),
      dataIndex: "reason",
      render: (text) => display(text),
    },
    {
      title: t("fee_tab.createdAt"),
      dataIndex: "createdAt",
      render: (text) => dateTime(text),
    },
    {
      title: t("fee_tab.claim_type"),
      dataIndex: "financialAccount",
      render: (value) => display(value?.name),
    },
    {
      title: t("fee_tab.amount"),
      dataIndex: "amount",
      align: "right",
      render: (text) => feeMoney(text),
    },
    {
      title: t("fee_tab.reason"),
      dataIndex: "memo",
      render: (text) => (
        <Typography.Text style={styles.preWrap}>
          {display(text)}
        </Typography.Text>
      ),
    },
  ];

  const financialCollectColumns: ColumnsType<AnyRecord> = [
    {
      title: t("fee_tab.createdAt"),
      dataIndex: "createdAt",
      render: (text) => dateTime(text),
    },
    {
      title: t("fee_tab.refundType"),
      dataIndex: "financialAccount",
      render: (value) => display(value?.name),
    },
    {
      title: t("fee_tab.amount"),
      dataIndex: "amount",
      align: "right",
      render: (text) => feeMoney(text),
    },
    {
      title: t("fee_tab.reason"),
      dataIndex: "memo",
      render: (text) => (
        <Typography.Text style={styles.preWrap}>
          {text && `${text}`.trim() ? `${text}`.trim() : empty}
        </Typography.Text>
      ),
    },
  ];

  const claimColumns: ColumnsType<AnyRecord> = [
    {
      title: t("complaint_tab.complaint_code"),
      dataIndex: "code",
      key: "code",
      render: (text, record) => (
        <Link
          to={`/tickets/${record.code}`}
          style={{ color: token.colorPrimary }}
        >
          #{display(text)}
        </Link>
      ),
    },
    {
      title: t("complaint_tab.complaint_name"),
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link
          to={`/tickets/${record.code}`}
          style={{ color: token.colorPrimary }}
        >
          {display(text)}
        </Link>
      ),
    },
    {
      title: t("complaint_tab.time"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => shortDateTime(text),
    },
    {
      title: t("complaint_tab.status"),
      dataIndex: "state",
      key: "state",
      render: (_text, record) =>
        record.publicStateNewView ? (
          <Flex align="center" gap={6}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                flex: "none",
                borderRadius: "50%",
                backgroundColor: record.publicStateNewView.color || "#FFC107",
              }}
            />
            {record.publicStateNewView.name}
            {record.archived && ` (${t("complaint_tab.closed")})`}
          </Flex>
        ) : (
          ""
        ),
    },
    {
      title: t("complaint_tab.refund"),
      dataIndex: "totalRefund",
      key: "totalRefund",
      render: (text) => (
        <Typography.Text strong style={{ color: token.colorSuccess }}>
          {feeMoney(text)}
        </Typography.Text>
      ),
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      render: (_text, record) => (
        <Link
          to={`/tickets/${record.code}`}
          style={{ color: token.colorPrimary }}
        >
          {t("complaint_tab.detail")}
        </Link>
      ),
    },
  ];

  const creditColumns: ColumnsType<AnyRecord> = [
    {
      title: "Mã",
      dataIndex: "loanId",
      render: (text) => (
        <Typography.Text strong style={{ color: token.colorPrimary }}>
          #{display(text)}
        </Typography.Text>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      align: "right",
      render: (text) => dateTime(text),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      align: "right",
      render: (text) => money(text),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (text) => display(text),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={styles.fullWidth}>
      {shipment.deliveryNotice && (
        <Alert
          style={{ marginBottom: token.marginLG }}
          message={
            <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
              {t("order.notification")}
            </Typography.Text>
          }
          description={
            <Typography.Text>
              {t("orderDetail.delivery_notice_1")}{" "}
              <Link to="/delivery/create">
                {t("orderDetail.delivery_notice_2")}
              </Link>{" "}
              {t("orderDetail.delivery_notice_3")}
            </Typography.Text>
          }
          type="success"
          showIcon
        />
      )}

      {showPackageAlert && (
        <Alert
          style={{ marginBottom: token.marginLG }}
          message={
            <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
              {t("order.notification")}
            </Typography.Text>
          }
          description={
            <Typography.Text>
              {t("message.freePackagesAlert", {
                taxFreeThreshHold: money(taxFreeThreshHold),
                freePackages,
              })}
            </Typography.Text>
          }
          type="warning"
          showIcon
        />
      )}

      <Card>
        <Row align="middle" gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Flex align="center" gap={12}>
              <Avatar
                shape="square"
                size={44}
                icon={<RocketOutlined />}
                style={{
                  background: token.colorBgContainerDisabled,
                  color: token.colorTextQuaternary,
                }}
              />
              <Space direction="vertical" size={4}>
                <Typography.Text strong>
                  #{display(shipment.code)}
                </Typography.Text>
                <Tag
                  color={statusInfo?.color || "default"}
                  style={{ margin: 0 }}
                >
                  {display(statusInfo?.name)}
                </Tag>
              </Space>
            </Flex>
          </Col>

          <Col xs={24} lg={8}>
            <Space direction="vertical" size={4}>
              <InfoLine
                label={t("shipments.totalFee")}
                value={roundedMoney(shipment.totalFee)}
                strong
              />
              <InfoLine
                label={t("shipments.totalValue")}
                value={roundedMoney(shipment.totalValue, currency)}
                strong
              />
            </Space>
          </Col>

          <Col xs={24} lg={8}>
            <Flex justify="end" gap={8}>
              {statusInfo?.confirmable && (
                <Button>{t("shipments.bt_received")}</Button>
              )}
              {statusInfo?.cancellable && (
                <Popconfirm
                  title={t("orderDetail.confirm_question")}
                  okText={t("button.yes")}
                  cancelText={t("button.no")}
                  onConfirm={cancelShipmentOrder}
                >
                  <Button danger loading={cancelShipment.isPending}>
                    {t("orderDetail.cancel_order")}
                  </Button>
                </Popconfirm>
              )}
            </Flex>
          </Col>
        </Row>

        {isExpand && (
          <Fragment>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <InfoBlock
                  label={t("orderDetail.costing_weight")}
                  value={
                    shipment.actualWeight
                      ? `${quantity(shipment.actualWeight)} kg`
                      : t("orderDetail.undefined")
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <InfoBlock
                  label={t("orderDetail.volume")}
                  value={
                    shipment.volumetric
                      ? `${quantity(shipment.volumetric)} cm3`
                      : t("orderDetail.undefined")
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <InfoBlock
                  label={t("shipments.declareValue")}
                  value={renderNumberEditor(
                    "declareValue",
                    shipment.declareValue,
                    roundedMoney(shipment.declareValue),
                    !!statusInfo?.updatable,
                    t("shipments.declareValue"),
                  )}
                />
              </Col>
              <Col xs={24} md={6}>
                <InfoBlock
                  label={t("shipments.hsCode")}
                  value={renderHsCodeEditor()}
                />
              </Col>
            </Row>

            {totalNeedPay > 0 && (
              <Fragment>
                <Divider />
                <Space direction="vertical" size={8}>
                  {shipment.contractWithShopkeeper && (
                    <InfoLine
                      label="BiFin"
                      value={money(
                        roundShipmentMoney(
                          activeThirdPartyLoan?.totalAmountPay ?? 0,
                        ),
                        undefined,
                        true,
                      )}
                      accent
                    />
                  )}
                  <InfoLine
                    label={t("orderDetail.total_need_payment")}
                    value={roundedMoney(totalNeedPay, undefined, true)}
                    accent
                  />
                </Space>
              </Fragment>
            )}

            <Divider />
            <InfoLine
              label={t("shipments.expectedPackages")}
              value={renderNumberEditor(
                "expectedPackages",
                shipment.expectedPackages,
                quantity(shipment.expectedPackages),
                !!statusInfo?.updatable,
                t("shipments.expectedPackages"),
              )}
            />

            {shipment.peerPaymentCode && (
              <Fragment>
                <Divider />
                <InfoLine
                  label={t("shipments.peerPaymentCode")}
                  value={display(shipment.peerPaymentCode)}
                />
              </Fragment>
            )}

            <Divider />
            <InfoLine
              label={t("shipments.actualPackages")}
              value={quantity(shipment.actualPackages)}
            />

            <Divider />
            <InfoLine
              label={t("shipments.originalReceipts")}
              value={
                <span style={styles.inlineActions}>
                  <span>{receiptText || empty}</span>
                  {statusInfo?.updatable && (
                    <EditOutlined
                      style={styles.iconPrimary}
                      onClick={() => setOriginalReceiptModalOpen(true)}
                    />
                  )}
                </span>
              }
              alignStart
            />

            <Divider />
            <div>
              <Typography.Text type="secondary">
                {t("orderDetail.service")}:{" "}
              </Typography.Text>
              {services.length > 0
                ? services.map((service, index) => (
                    <Fragment key={service.code ?? service.name ?? index}>
                      <span
                        style={{
                          color:
                            service.approved === null
                              ? token.colorWarning
                              : token.colorText,
                          textDecoration:
                            service.approved === false
                              ? "line-through"
                              : "none",
                          fontSize: token.fontSizeSM,
                        }}
                      >
                        {service.name}
                      </span>
                      <span>{index === services.length - 1 ? "" : ", "}</span>
                    </Fragment>
                  ))
                : empty}
            </div>

            {shipment.receivingWarehouse?.displayName && (
              <Fragment>
                <Divider />
                <InfoLine
                  label={t("shipments.receivingWarehouseDisplayName")}
                  value={shipment.receivingWarehouse.displayName}
                />
              </Fragment>
            )}

            <Divider />
            <InfoLine
              label={
                shipment.receiptAddress
                  ? t("orderDetail.delivery_receiptAddress")
                  : t("orderDetail.delivery_address")
              }
              value={formatAddress(shipment.address)}
            />

            {shipment.receiptAddress && (
              <Fragment>
                <Divider />
                <InfoLine
                  label={t("orderDetail.delivery_address")}
                  value={formatAddress(shipment.receiptAddress, true)}
                />
              </Fragment>
            )}

            <Divider />
            <InfoLine
              label={t("shipments.refShipmentCode")}
              value={renderTextEditor(
                "refShipmentCode",
                shipment.refShipmentCode,
                t("shipments.refShipmentCode"),
              )}
            />

            <Divider />
            <InfoLine
              label={t("shipments.refCustomerCode")}
              value={renderTextEditor(
                "refCustomerCode",
                shipment.refCustomerCode,
                t("shipments.refCustomerCode"),
              )}
            />

            <Divider />
            <Space direction="vertical" size={8} style={styles.fullWidth}>
              {shipment.remark && (
                <InfoLine
                  label={t("orderDetail.note_order")}
                  value={shipment.remark}
                />
              )}
              {editingField === "note" || shipment.note ? (
                <InfoLine
                  label={t("shipments.personal_note_for_order")}
                  value={renderPersonalNote()}
                  alignStart
                />
              ) : (
                renderPersonalNote()
              )}
            </Space>

            {shipment.receivingWarehouse?.address && (
              <Flex
                gap={token.marginSM}
                align="flex-start"
                style={{ marginTop: token.marginMD }}
              >
                <Typography.Text type="secondary" className="whitespace-nowrap">
                  {t("shipments.receivingWarehouse")}:
                </Typography.Text>
                <Space direction="vertical" size={4} style={styles.fullWidth}>
                  <Typography.Paragraph
                    copyable={{
                      text: shipment.receivingWarehouse.address.trim(),
                    }}
                    style={{ ...styles.preWrap, marginBottom: 0 }}
                  >
                    {shipment.receivingWarehouse.address.trim()}
                  </Typography.Paragraph>
                  <Typography.Text type="secondary">
                    {t("shipments.receivingWarehouse_note")}
                  </Typography.Text>
                </Space>
              </Flex>
            )}
          </Fragment>
        )}
      </Card>

      <Card styles={{ body: { padding: 8, textAlign: "center" } }}>
        <Button
          type="text"
          icon={isExpand ? <ShrinkOutlined /> : <DownOutlined />}
          onClick={() => setIsExpand((value) => !value)}
        >
          {isExpand ? t("orderDetail.collapse") : t("orderDetail.show_more")}
        </Button>
      </Card>

      <Card styles={{ body: { paddingTop: 8 } }}>
        <Tabs
          activeKey={activeTab}
          defaultActiveKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: "PRODUCT",
              label: t("order.products"),
              children: (
                <Spin spinning={isProductsLoading}>
                  <List
                    dataSource={visibleProductRows}
                    header={
                      <Card
                        size="small"
                        style={{
                          marginBottom: token.marginSM,
                          borderRadius: 0,
                        }}
                        styles={{
                          body: {
                            padding: `${token.paddingXXS}px ${token.padding}px`,
                            background: token.colorFillAlter,
                          },
                        }}
                      >
                        <Row align="middle">
                          <Col
                            span={10}
                            style={{ paddingTop: token.paddingXXS }}
                          >
                            <Text>{t("order.products")}</Text>
                          </Col>
                          <Col span={14}>
                            <Row align="middle" gutter={0}>
                              <Col
                                span={6}
                                style={{
                                  ...styles.right,
                                  paddingTop: token.paddingXXS,
                                }}
                              >
                                {t("shipments.hsCode")}
                              </Col>
                              <Col
                                span={6}
                                style={{
                                  ...styles.right,
                                  paddingTop: token.paddingXXS,
                                }}
                              >
                                {t("order.quantity")}
                              </Col>
                              <Col
                                span={6}
                                style={{
                                  ...styles.right,
                                  paddingTop: token.paddingXXS,
                                }}
                              >
                                {t("order.sale_price")}
                              </Col>
                              <Col span={6} style={styles.right}>
                                {statusInfo?.productUpdatable && (
                                  <Button onClick={() => openProductModal()}>
                                    {t("button.add_products")}
                                  </Button>
                                )}
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Card>
                    }
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          marginBottom: token.marginSM,
                          padding: token.paddingMD,
                          border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                          borderRadius: 0,
                          background: token.colorFillAlter,
                        }}
                      >
                        <Col span={10}>
                          <Flex align="flex-start" gap={token.marginSM}>
                            <Space
                              direction="vertical"
                              size={token.marginXXS}
                              style={{ width: 54, flex: "none" }}
                            >
                              {item.productImage ? (
                                <Avatar
                                  shape="square"
                                  size={44}
                                  src={item.productImage}
                                />
                              ) : (
                                <Flex
                                  align="center"
                                  justify="center"
                                  style={{
                                    width: 44,
                                    height: 44,
                                    color: token.colorTextQuaternary,
                                  }}
                                >
                                  <RocketOutlined style={{ fontSize: 30 }} />
                                </Flex>
                              )}
                              <Text
                                style={{
                                  display: "block",
                                  wordBreak: "break-word",
                                  fontSize: token.fontSizeSM,
                                }}
                              >
                                #{stripProductCode(item.code)}
                              </Text>
                            </Space>
                            <Space direction="vertical" size={2}>
                              {item.productUrl ? (
                                <Typography.Link
                                  target="_blank"
                                  href={item.productUrl}
                                  strong
                                  style={{ wordBreak: "break-word" }}
                                >
                                  {item.name || empty}
                                </Typography.Link>
                              ) : (
                                <Text
                                  strong
                                  style={{ wordBreak: "break-word" }}
                                >
                                  {item.name || empty}
                                </Text>
                              )}
                              <Text
                                type="secondary"
                                style={{ wordBreak: "break-word" }}
                              >
                                {item.translatedName || empty}
                              </Text>
                              {getVariantText(item) && (
                                <Text
                                  type="secondary"
                                  style={{ wordBreak: "break-word" }}
                                >
                                  {getVariantText(item)}
                                </Text>
                              )}
                              <Text
                                type="secondary"
                                style={{ wordBreak: "break-word" }}
                              >
                                <ShopOutlined
                                  style={{ marginRight: token.marginXXS }}
                                />
                                {item.merchantName || empty}
                              </Text>
                              <Text
                                type="secondary"
                                style={{ wordBreak: "break-word" }}
                              >
                                <EnvironmentOutlined
                                  style={{ marginRight: token.marginXXS }}
                                />
                                {item.merchantContact || empty}
                              </Text>
                            </Space>
                          </Flex>
                        </Col>
                        <Col span={14}>
                          <Row>
                            <Col span={6} style={styles.right}>
                              <Text strong>
                                {display(
                                  asArray(hsList).find(
                                    (hs) => hs.code === item.hsCode,
                                  )?.name,
                                )}
                              </Text>
                            </Col>
                            <Col span={6} style={styles.right}>
                              <Text strong>{quantity(item.quantity)}</Text>
                            </Col>
                            <Col span={6} style={styles.right}>
                              <Text strong>
                                {roundedMoney(item.unitPrice, currency)}
                              </Text>
                            </Col>
                            <Col span={6}>
                              {statusInfo?.productUpdatable && (
                                <Flex justify="end" align="center">
                                  <Button
                                    type="link"
                                    style={styles.linkButton}
                                    onClick={() => openProductModal(item)}
                                  >
                                    {t("button.edit")}
                                  </Button>
                                  <Text type="secondary">|</Text>
                                  <Popconfirm
                                    title={t("message.delete_confirm")}
                                    onConfirm={() => removeProduct(item.code)}
                                    okText={t("button.yes")}
                                    cancelText={t("button.no")}
                                  >
                                    <Button
                                      type="link"
                                      style={styles.linkButton}
                                    >
                                      {t("button.delete")}
                                    </Button>
                                  </Popconfirm>
                                </Flex>
                              )}
                            </Col>
                          </Row>
                        </Col>
                      </List.Item>
                    )}
                    locale={{
                      emptyText: <Empty description={t("common.no_data")} />,
                    }}
                  />
                  {productRows.length > productPageSize && (
                    <Flex
                      justify="center"
                      style={{ marginTop: token.marginSM }}
                    >
                      <Button
                        onClick={() =>
                          setIsProductExpanded((current) => !current)
                        }
                      >
                        {isProductExpanded
                          ? t("button.collapse")
                          : t("button.loadmore")}
                      </Button>
                    </Flex>
                  )}
                </Spin>
              ),
            },
            {
              key: "SHIPPING",
              label: t("shipments.shipping"),
              children: (
                <Spin spinning={isWaybillsLoading || isParcelsLoading}>
                  <Table
                    columns={waybillColumns}
                    dataSource={sortNewest(waybillRows)}
                    rowKey={(row, index) => row.code ?? `waybill-${index}`}
                    pagination={{ hideOnSinglePage: true, pageSize: 9999 }}
                    expandable={{
                      expandedRowKeys: expandedWaybillKeys,
                      onExpand: (expanded, record) => {
                        setExpandedWaybillKeys(
                          expanded && record.code !== null ? [record.code] : [],
                        );
                      },
                      rowExpandable: (record) => record.code !== null,
                      expandedRowRender: (row) => (
                        <Table
                          columns={parcelColumns}
                          dataSource={sortNewest(
                            getParcelsForWaybill(row, parcelRows),
                            "modifiedAt",
                          )}
                          rowKey={(parcel, index) =>
                            parcel.code ?? `parcel-${index}`
                          }
                          pagination={{
                            hideOnSinglePage: true,
                            pageSize: Math.max(
                              getParcelsForWaybill(row, parcelRows).length,
                              1,
                            ),
                          }}
                          locale={{
                            emptyText: <Empty description="Không có dữ liệu" />,
                          }}
                        />
                      ),
                    }}
                    locale={{
                      emptyText: <Empty description="Chưa có mã vận đơn" />,
                    }}
                  />
                </Spin>
              ),
            },
            ...(shipment.contractWithShopkeeper
              ? [
                  {
                    key: "CREDIT",
                    label: "Tín dụng",
                    children: (
                      <Spin spinning={isCreditsLoading || isLoansLoading}>
                        <Space
                          direction="vertical"
                          size="middle"
                          style={{
                            ...styles.fullWidth,
                            padding: `0 ${token.paddingMD}px ${token.paddingMD}px`,
                          }}
                        >
                          <Card
                            size="small"
                            style={{ background: token.colorInfoBg }}
                          >
                            <Typography.Text strong>
                              Thông tin BiFin
                            </Typography.Text>
                            <Space
                              direction="vertical"
                              size="middle"
                              style={{
                                ...styles.fullWidth,
                                maxWidth: 576,
                                marginTop: token.marginSM,
                              }}
                            >
                              <CreditInfo
                                label="Trạng thái"
                                value={display(loans?.status)}
                              />
                              <CreditInfo
                                label="Tỷ giá"
                                value={display(loans?.currencyExchangeRate)}
                              />
                              <CreditInfo
                                label="Dư nợ gốc còn lại"
                                value={money(loans?.disbursedAmount)}
                              />
                              <CreditInfo
                                label="Phí còn lại"
                                value={money(loans?.feeAndInterestAccumulation)}
                              />
                              <CreditInfo
                                label="Khoản vay"
                                value={money(loans?.loanAmount)}
                              />
                              <CreditInfo
                                label="Phí"
                                value={money(loans?.feeAndInterestOriginal)}
                              />
                              <CreditInfo
                                label="Tổng cần thanh toán"
                                value={money(loans?.totalAmountPay)}
                              />
                            </Space>
                          </Card>
                          <Table
                            columns={creditColumns}
                            dataSource={asArray(credits)}
                            pagination={false}
                            rowKey={(row, index) => row.id ?? `credit-${index}`}
                          />
                        </Space>
                      </Spin>
                    ),
                  },
                ]
              : []),
            {
              key: "FEES",
              label: t("fee_tab.finance"),
              children: (
                <Spin
                  spinning={
                    isFeesLoading ||
                    isFinancialClaimLoading ||
                    isFinancialCollectLoading
                  }
                >
                  <Row gutter={[token.marginLG, token.marginLG]}>
                    <Col xs={24} lg={16}>
                      <Space
                        direction="vertical"
                        size={token.marginLG}
                        style={styles.fullWidth}
                      >
                        <FeeGroup
                          title={t("fee_tab.service_fee")}
                          rows={sortByPosition(asArray(fees)).filter(
                            (item) =>
                              item.type &&
                              !item.type.shipping &&
                              !item.type.additional,
                          )}
                          shipmentFees={asArray(shipmentFees)}
                          order={shipment}
                          onOpenFeeTable={setFeeTableConfig}
                        />
                        <FeeGroup
                          title={t("fee_tab.transport_fee")}
                          rows={sortByPosition(asArray(fees)).filter(
                            (item) =>
                              item.type &&
                              item.type.shipping &&
                              !item.type.additional,
                          )}
                          shipmentFees={asArray(shipmentFees)}
                          order={shipment}
                          onOpenFeeTable={setFeeTableConfig}
                        />
                        <FeeGroup
                          title={t("fee_tab.surcharge")}
                          rows={sortByPosition(asArray(fees)).filter(
                            (item) =>
                              item.type &&
                              !item.type.shipping &&
                              item.type.additional,
                          )}
                          shipmentFees={asArray(shipmentFees)}
                          order={shipment}
                          onOpenFeeTable={setFeeTableConfig}
                        />
                        {asArray(fees).length === 0 && (
                          <Empty description={t("fee_tab.empty_fee")} />
                        )}
                      </Space>
                    </Col>
                    <Col xs={24} lg={8}>
                      <Space
                        direction="vertical"
                        size={token.marginSM}
                        style={styles.fullWidth}
                      >
                        <Typography.Title
                          level={5}
                          style={{
                            margin: 0,
                            textTransform: "uppercase",
                            fontSize: token.fontSize,
                          }}
                        >
                          {t("fee_tab.order_finance")}
                        </Typography.Title>
                        <Card
                          bordered={false}
                          styles={{
                            body: {
                              background: token.colorPrimary,
                              borderRadius: token.borderRadius,
                              color: token.colorWhite,
                              padding: `${token.paddingSM}px ${token.padding}px`,
                            },
                          }}
                        >
                          <Space
                            direction="vertical"
                            size={0}
                            style={styles.fullWidth}
                          >
                            <FinanceLine
                              label={t("shipments.declareValue")}
                              value={feeMoney(shipment.declareValue)}
                            />
                            <FinanceLine
                              label={t("shipments.totalFee")}
                              value={feeMoney(shipment.totalFee)}
                            />
                            {asArray(coupons).length > 0 && (
                              <FinanceLine
                                label={
                                  <Tooltip
                                    color={token.colorPrimary}
                                    title={
                                      <Space direction="vertical" size={2}>
                                        {asArray(coupons).map(
                                          (coupon, index) => (
                                            <Typography.Text
                                              key={
                                                coupon.code ?? `coupon-${index}`
                                              }
                                              style={{
                                                color: token.colorWhite,
                                              }}
                                            >
                                              {[coupon.code, coupon.description]
                                                .filter(Boolean)
                                                .join(" - ")}
                                            </Typography.Text>
                                          ),
                                        )}
                                      </Space>
                                    }
                                  >
                                    <Space size={token.marginXXS}>
                                      <span>{t("button.coupon")}</span>
                                      <InfoCircleOutlined />
                                    </Space>
                                  </Tooltip>
                                }
                                value={`-${feeMoney(shipment.totalCoupon)}`}
                              />
                            )}
                            <FinanceLine
                              label={t("fee_tab.paid")}
                              value={feeMoney(shipment.totalPaid)}
                            />
                            <FinanceLine
                              label={t("fee_tab.refunded_service")}
                              value={feeMoney(shipment.totalRefund)}
                            />
                            {!statusInfo?.negativeEnd && (
                              <FinanceLine
                                label={
                                  shipment.totalUnpaid >= 0
                                    ? t("order.need_payment")
                                    : t("order.excess_cash")
                                }
                                value={feeMoney(shipment.totalUnpaid, true)}
                              />
                            )}
                            {shipment.totalClaim && (
                              <>
                                <Divider
                                  style={{
                                    margin: `${token.marginXS}px 0`,
                                    borderColor: "rgba(255,255,255,0.35)",
                                  }}
                                />
                                <FinanceLine
                                  label={t("fee_tab.claimed_refund")}
                                  value={feeMoney(shipment.totalClaim)}
                                  onDetail={() => setClaimModalOpen(true)}
                                />
                              </>
                            )}
                            {shipment.totalCollect && (
                              <>
                                <Divider
                                  style={{
                                    margin: `${token.marginXS}px 0`,
                                    borderColor: "rgba(255,255,255,0.35)",
                                  }}
                                />
                                <FinanceLine
                                  label={t("fee_tab.collect_refund")}
                                  value={feeMoney(shipment.totalCollect, true)}
                                  onDetail={() => setCollectModalOpen(true)}
                                />
                              </>
                            )}
                          </Space>
                        </Card>
                        {statusInfo?.couponEnabled && (
                          <Flex justify="end">
                            <Button type="link" onClick={openCouponModal}>
                              {t("button.coupon")}
                            </Button>
                          </Flex>
                        )}
                      </Space>
                    </Col>
                  </Row>
                </Spin>
              ),
            },
            {
              key: "FINANCE",
              label: t("financial_tab.transaction"),
              children: (
                <Spin spinning={isFinancialLoading}>
                  {asArray(financial).length > 0 ? (
                    <Table
                      columns={financeColumns}
                      dataSource={asArray(financial)}
                      rowKey={(row, index) =>
                        row.id ?? row.txid ?? `finance-${index}`
                      }
                      pagination={false}
                    />
                  ) : (
                    <Empty description={t("financial_tab.empty_transaction")} />
                  )}
                </Spin>
              ),
            },
            {
              key: "TICKETS",
              label: (
                <span>
                  {t("complaint_tab.complaint")}
                  {claims.length > 0 ? ` (${quantity(claims.length)})` : ""}
                </span>
              ),
              children: (
                <Spin spinning={isClaimsLoading}>
                  <div style={{ padding: token.paddingXS }}>
                    {claims.length > 0 ? (
                      <Fragment>
                        <Flex
                          justify="space-between"
                          align="center"
                          style={{
                            marginBottom: token.marginSM,
                            paddingBottom: token.paddingSM,
                            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                          }}
                        >
                          <Text strong>
                            {t("ticket_add.list_claims")} (
                            {quantity(claims.length)})
                          </Text>
                          <Link
                            to={`/tickets/create?orderCode=${shipment.code}&isShipment=true`}
                          >
                            <Button type="primary" ghost size="small">
                              {t("complaint_tab.create_complaint")}
                            </Button>
                          </Link>
                        </Flex>
                        <Table
                          columns={claimColumns}
                          dataSource={sortNewest(asArray(claims))}
                          rowKey={(row) => row.code}
                          pagination={{ hideOnSinglePage: true, pageSize: 10 }}
                        />
                      </Fragment>
                    ) : (
                      <Flex vertical align="center" gap={token.marginSM}>
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={false}
                        />
                        <Link
                          to={`/tickets/create?orderCode=${shipment.code}&isShipment=true`}
                        >
                          <Button type="primary">{t("tickets.create")}</Button>
                        </Link>
                      </Flex>
                    )}
                  </div>
                </Spin>
              ),
            },
            {
              key: "HISTORY",
              label: t("history_tab.history"),
              children: (
                <Spin spinning={isMilestonesLoading}>
                  <Timeline
                    mode="alternate"
                    style={{
                      padding: `0 ${token.paddingMD}px ${token.paddingMD}px`,
                    }}
                  >
                    {asArray(milestones).map((item, index) => {
                      const foundStatus = statusData?.find(
                        (status) => status.code === item.status,
                      );
                      const day =
                        Number(item.handlingTime) > 1
                          ? t("label.days")
                          : t("label.day");
                      return (
                        <Timeline.Item
                          key={item.id ?? `${item.status}-${index}`}
                          color={index === 0 ? "red" : "green"}
                          dot={
                            index === 0 ? (
                              <ClockCircleOutlined style={{ fontSize: 24 }} />
                            ) : undefined
                          }
                        >
                          <span
                            style={{
                              color: token.colorTextSecondary,
                              paddingRight: 4,
                            }}
                          >
                            {display(foundStatus?.name)}:
                          </span>
                          <span
                            style={{
                              fontWeight: token.fontWeightStrong,
                              paddingRight: 4,
                            }}
                          >
                            {shortDateTime(item.timestamp)}
                          </span>
                          <span style={{ fontWeight: token.fontWeightStrong }}>
                            (
                            {item.handlingTime === null
                              ? t("orderDetail.undefined")
                              : `${item.handlingTime} ${day}`}
                            )
                          </span>
                        </Timeline.Item>
                      );
                    })}
                  </Timeline>
                </Spin>
              ),
            },
            {
              key: "LOG",
              label: t("shipment_tab.log"),
              children: (
                <Spin spinning={isActivitiesLoading}>
                  <div
                    style={{
                      padding: `0 ${token.paddingLG}px ${token.paddingMD}px`,
                    }}
                  >
                    <List
                      itemLayout="horizontal"
                      dataSource={shipmentLogRows}
                      locale={{
                        emptyText: (
                          <Empty description={t("orderDetail.empty_log")} />
                        ),
                      }}
                      renderItem={(item, index) => (
                        <List.Item
                          key={item.id ?? `log-${index}`}
                          style={{
                            display: "block",
                            padding: 0,
                            borderBlockEnd: 0,
                          }}
                        >
                          <div
                            style={{
                              color: token.colorTextSecondary,
                              fontSize: token.fontSizeSM,
                              marginTop: index !== 0 ? token.marginSM : 0,
                            }}
                          >
                            <span>{dateTime(item.timestamp)}</span>,
                            <span style={{ paddingLeft: 4 }}>
                              {item.role === "CUSTOMER"
                                ? t("shipment_log.customer")
                                : t("shipment_log.staff")}
                              :
                            </span>
                            <span
                              style={{
                                paddingLeft: 4,
                                fontWeight: token.fontWeightStrong,
                                color: token.colorText,
                              }}
                            >
                              {display(item.fullname ?? item.actor?.fullname)}
                            </span>
                          </div>
                          <div
                            style={{
                              whiteSpace: "pre-wrap",
                              fontSize: token.fontSizeLG,
                            }}
                            dangerouslySetInnerHTML={{
                              __html: activityText(item, t),
                            }}
                          />
                          <Divider
                            style={{ margin: `${token.marginSM}px 0` }}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                </Spin>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={t("coupon.modalTitle")}
        open={couponModalOpen}
        footer={null}
        width={600}
        onCancel={closeCouponModal}
      >
        <Space
          direction="vertical"
          size={token.marginMD}
          style={styles.fullWidth}
        >
          <Typography.Text>{t("coupon.inputVoucher")}</Typography.Text>
          <Input.Search
            value={couponCode}
            placeholder={t("message.enter_coupon")}
            enterButton={t("button.check")}
            loading={checkVoucher.isPending}
            onChange={(event) => changeCouponCode(event.target.value)}
            onSearch={checkCouponCode}
          />
          {couponValidTo && (
            <Alert
              type="success"
              showIcon
              message={t("coupon.voucherValidTo", {
                value: dateTime(couponValidTo),
              })}
            />
          )}
          {couponValidMessage && (
            <Alert
              type={couponValid ? "success" : "error"}
              showIcon
              message={couponValidMessage}
            />
          )}
          <Flex justify="end" gap={token.marginSM}>
            <Button onClick={closeCouponModal}>{t("button.cancel")}</Button>
            <Button
              type="primary"
              disabled={!couponValid}
              loading={applyShipmentCoupon.isPending}
              onClick={submitCouponCode}
            >
              {t("button.use")}
            </Button>
          </Flex>
        </Space>
      </Modal>

      <Modal
        title={t("fee_tab.refunded_list")}
        open={claimModalOpen}
        footer={null}
        width={980}
        onCancel={() => setClaimModalOpen(false)}
      >
        <Table
          columns={financialClaimColumns}
          dataSource={sortNewest(asArray(financialClaim), "createdAt")}
          rowKey={(row, index) => row.id ?? `financial-claim-${index}`}
          pagination={{ hideOnSinglePage: true, pageSize: 25 }}
          locale={{
            emptyText: <Empty description={t("fee_tab.empty_detail")} />,
          }}
        />
      </Modal>

      <Modal
        title={t("fee_tab.retrospectiveList")}
        open={collectModalOpen}
        footer={null}
        width={700}
        onCancel={() => setCollectModalOpen(false)}
      >
        <Table
          bordered
          columns={financialCollectColumns}
          dataSource={sortNewest(asArray(financialCollect), "createdAt")}
          rowKey={(row, index) => row.id ?? `financial-collect-${index}`}
          pagination={{ hideOnSinglePage: true, pageSize: 25 }}
          locale={{
            emptyText: <Empty description={t("fee_tab.empty_detail")} />,
          }}
        />
      </Modal>

      <Modal
        title={t("config_group.feeTable")}
        open={!!feeTableConfig}
        width={1100}
        okText={t("button.close")}
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={() => setFeeTableConfig(null)}
        onCancel={() => setFeeTableConfig(null)}
      >
        {feeTableConfig && (
          <FeeTableContent feeConfig={feeTableConfig} order={shipment} />
        )}
      </Modal>

      <Modal
        title={
          currentProduct
            ? `Sản phẩm ${display(currentProduct.name)}`
            : "Thêm sản phẩm"
        }
        open={productModalOpen}
        destroyOnClose
        onOk={submitProduct}
        confirmLoading={createProduct.isPending || updateProduct.isPending}
        onCancel={closeProductModal}
        okText={currentProduct ? "Lưu" : "Thêm sản phẩm"}
        cancelText="Hủy"
      >
        <Form layout="vertical">
          <ProductField
            label="Link sản phẩm"
            required
            error={productErrors.productUrl}
          >
            <Input
              value={productDraft.productUrl}
              onChange={(event) =>
                updateProductDraft("productUrl", event.target.value)
              }
              onPressEnter={submitProduct}
            />
          </ProductField>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <ProductField
                label="Số lượng"
                required
                error={productErrors.quantity}
              >
                <InputNumber
                  style={styles.fullWidth}
                  min={0}
                  precision={0}
                  value={productDraft.quantity}
                  formatter={(value) =>
                    `${value ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    (value || "").replace(/\$\s?|(,*)/g, "") as any
                  }
                  onChange={(value) => updateProductDraft("quantity", value)}
                  onPressEnter={submitProduct}
                />
              </ProductField>
            </Col>
            <Col xs={24} md={12}>
              <ProductField
                label="Đơn giá"
                required
                error={productErrors.unitPrice}
              >
                <InputNumber
                  style={styles.fullWidth}
                  min={0}
                  value={productDraft.unitPrice}
                  formatter={(value) =>
                    `${value ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    (value || "").replace(/\$\s?|(,*)/g, "") as any
                  }
                  onChange={(value) => updateProductDraft("unitPrice", value)}
                  onPressEnter={submitProduct}
                />
              </ProductField>
            </Col>
          </Row>

          <ProductField
            label="Tên sản phẩm tiếng Trung"
            required
            error={productErrors.name}
          >
            <Input
              value={productDraft.name}
              onChange={(event) =>
                updateProductDraft("name", event.target.value)
              }
              onPressEnter={submitProduct}
            />
          </ProductField>
          <ProductField
            label="Tên sản phẩm tiếng Việt"
            required
            error={productErrors.translatedName}
          >
            <Input
              value={productDraft.translatedName}
              onChange={(event) =>
                updateProductDraft("translatedName", event.target.value)
              }
              onPressEnter={submitProduct}
            />
          </ProductField>
          <ProductField label="Tên shop Trung Quốc">
            <Input
              value={productDraft.merchantName}
              onChange={(event) =>
                updateProductDraft("merchantName", event.target.value)
              }
              onPressEnter={submitProduct}
            />
          </ProductField>
          <ProductField label="Địa chỉ shop Trung Quốc">
            <Input
              value={productDraft.merchantContact}
              onChange={(event) =>
                updateProductDraft("merchantContact", event.target.value)
              }
              onPressEnter={submitProduct}
            />
          </ProductField>
        </Form>
      </Modal>

      <Modal
        title="Hóa đơn gốc"
        open={originalReceiptModalOpen}
        onCancel={() => setOriginalReceiptModalOpen(false)}
        footer={null}
      >
        <Space direction="vertical" size="middle" style={styles.fullWidth}>
          <Flex gap={token.marginXS}>
            <Input
              value={originalReceiptCode}
              placeholder="Nhập mã hóa đơn gốc"
              onChange={(event) => setOriginalReceiptCode(event.target.value)}
              onPressEnter={addReceipt}
            />
            <Button
              type="primary"
              loading={addOriginalReceipt.isPending}
              onClick={addReceipt}
            >
              Thêm
            </Button>
          </Flex>
          <Flex wrap="wrap" gap={token.marginXS}>
            {asArray(originalReceipts).length > 0 ? (
              asArray(originalReceipts).map((receipt) => (
                <Tag
                  key={receipt.id ?? receipt.code}
                  closable
                  onClose={(event) => {
                    event.preventDefault();
                    removeReceipt(receipt);
                  }}
                >
                  {display(receipt.code)}
                </Tag>
              ))
            ) : (
              <Empty description="Chưa có hóa đơn gốc" />
            )}
          </Flex>
        </Space>
      </Modal>
    </Space>
  );
};

const getParcelsForWaybill = (waybill: AnyRecord, parcels: AnyRecord[]) => {
  if (waybill.emptyWaybill) return parcels.filter((item) => !item.waybillCode);
  return parcels.filter((item) => item.waybillCode === waybill.code);
};

const InfoBlock = ({ label, value }: { label: string; value: ReactNode }) => (
  <Space direction="vertical" size={2}>
    <Typography.Text type="secondary">{label}</Typography.Text>
    <Typography.Text strong>{value}</Typography.Text>
  </Space>
);

const InfoLine = ({
  label,
  value,
  strong,
  accent,
  alignStart,
}: {
  label: string;
  value: ReactNode;
  strong?: boolean;
  accent?: boolean;
  alignStart?: boolean;
}) => (
  <InfoLineInner
    label={label}
    value={value}
    strong={strong}
    accent={accent}
    alignStart={alignStart}
  />
);

const InfoLineInner = ({
  label,
  value,
  strong,
  accent,
  alignStart,
}: {
  label: string;
  value: ReactNode;
  strong?: boolean;
  accent?: boolean;
  alignStart?: boolean;
}) => {
  const { token } = theme.useToken();
  return (
    <Flex gap={token.marginXS} align={alignStart ? "flex-start" : "center"}>
      {label && <Typography.Text type="secondary">{label}: </Typography.Text>}
      <Typography.Text
        strong={strong}
        style={{
          color: accent ? token.colorPrimary : token.colorText,
          fontWeight: strong ? token.fontWeightStrong : 500,
        }}
      >
        {value}
      </Typography.Text>
    </Flex>
  );
};

const FeeGroup = ({
  title,
  rows,
  shipmentFees,
  order,
  onOpenFeeTable,
}: {
  title: string;
  rows: AnyRecord[];
  shipmentFees: AnyRecord[];
  order: AnyRecord;
  onOpenFeeTable: (feeConfig: AnyRecord) => void;
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  if (rows.length === 0) return null;

  const getFeeConfig = (item: AnyRecord) =>
    item.type
      ? shipmentFees.find(
          (fee) =>
            fee.code === item.type.code &&
            fee.feeMetadata?.template &&
            fee.feeMetadata.template !== "custom",
        )
      : null;

  const renderDiscountTooltip = (item: AnyRecord) => {
    const customerDiscountLevel = order?.customerDiscountLevels?.find(
      (discount: AnyRecord) => discount?.feeCode === item?.type?.code,
    );

    if (!item.reason && !(customerDiscountLevel && item.actualAmount)) {
      return null;
    }

    return (
      <Tooltip
        color={token.colorPrimary}
        title={
          <Space direction="vertical" size={2}>
            {item.reason && (
              <Typography.Text style={{ color: token.colorWhite }}>
                {item.reason}
              </Typography.Text>
            )}
            {customerDiscountLevel && item.actualAmount && (
              <Typography.Text style={{ color: token.colorWhite }}>
                {t("fee_tab.discountCustomer", {
                  value:
                    customerDiscountLevel.discountType === "PERCENT"
                      ? `${customerDiscountLevel.discountValue}%`
                      : feeMoney(customerDiscountLevel.discountValue),
                })}
              </Typography.Text>
            )}
          </Space>
        }
      >
        <QuestionCircleOutlined style={{ color: token.colorTextTertiary }} />
      </Tooltip>
    );
  };

  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Typography.Text strong style={{ textTransform: "uppercase" }}>
        {title}
      </Typography.Text>
      <Card size="small" style={{ background: token.colorFillAlter }}>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          {rows.map((item, index) => {
            const currentFee = getFeeConfig(item);

            return (
              <Flex
                key={item.id ?? `${title}-${index}`}
                justify="space-between"
                align="center"
                gap={token.marginMD}
              >
                <Space size={token.marginXS} wrap>
                  <Typography.Text>{display(item.type?.name)}</Typography.Text>
                  {(item.type?.minFee || item.type?.maxFee) && (
                    <Tooltip
                      color={token.colorPrimary}
                      title={
                        <Space direction="vertical" size={2}>
                          <Typography.Text style={{ color: token.colorWhite }}>
                            {t("fee_tab.min_fee")}:{" "}
                            {feeMoney(item.type?.minFee)}
                          </Typography.Text>
                          <Typography.Text style={{ color: token.colorWhite }}>
                            {t("fee_tab.max_fee")}:{" "}
                            {feeMoney(item.type?.maxFee)}
                          </Typography.Text>
                        </Space>
                      }
                    >
                      <InfoCircleOutlined
                        style={{ color: token.colorTextTertiary }}
                      />
                    </Tooltip>
                  )}
                  {currentFee && (
                    <Tooltip
                      title={t("config_group.feeTable")}
                      color={token.colorPrimary}
                    >
                      <DollarOutlined
                        onClick={() => onOpenFeeTable(currentFee)}
                        style={{
                          color: token.colorTextTertiary,
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  )}
                </Space>
                <Space size={token.marginXS}>
                  {item.free ? (
                    <>
                      <Typography.Text delete type="secondary">
                        {feeMoney(item.actualAmount)}
                      </Typography.Text>
                      <Typography.Text>{t("fee_tab.free")}</Typography.Text>
                    </>
                  ) : item.manual && item.provisionalAmount !== null ? (
                    <>
                      <Typography.Text delete type="secondary">
                        {feeMoney(item.provisionalAmount)}
                      </Typography.Text>
                      <Typography.Text>
                        {feeMoney(item.actualAmount)}
                      </Typography.Text>
                    </>
                  ) : (
                    <Typography.Text>
                      {feeMoney(item.actualAmount)}
                    </Typography.Text>
                  )}
                  {renderDiscountTooltip(item)}
                </Space>
              </Flex>
            );
          })}
        </Space>
      </Card>
    </Space>
  );
};

const makeRangeColumns = (sample: AnyRecord) =>
  Object.keys(sample || {}).map((key) => ({
    title: key,
    dataIndex: key,
    key,
    render: (value: any) =>
      typeof value === "number" ? feeMoney(value) : display(value),
  }));

const numericSort = (left: any, right: any) => Number(left) - Number(right);

const buildRanges = (data: AnyRecord, emptyKey: string) => {
  const keys = Object.keys(data || {}).sort(numericSort);

  return keys.map((key, index) => {
    if (key === emptyKey) {
      return { key, from: null, to: null, value: data[key], empty: true };
    }

    const nextKey = keys[index + 1];
    return {
      key,
      from: Number(key),
      to:
        nextKey && nextKey !== emptyKey
          ? Number(nextKey)
          : index === keys.length - 1
            ? null
            : Number(key),
      value: data[key],
      empty: false,
    };
  });
};

const rangeText = (
  range: AnyRecord,
  {
    emptyText,
    suffix = "",
    moneyUnit,
  }: { emptyText: string; suffix?: string; moneyUnit?: string } = {
    emptyText: empty,
  },
) => {
  if (range.empty) return emptyText;
  const formatValue = (value: any) =>
    moneyUnit ? money(value, moneyUnit) : quantity(value);
  if (range.to === null || range.to === undefined) {
    return `${formatValue(range.from)}${suffix}+`;
  }
  return `${formatValue(range.from)}${suffix} - ${formatValue(range.to)}${suffix}`;
};

const normalizeTableRows = (data: any) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  if (Array.isArray(data.ranges)) return data.ranges;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.table)) return data.table;

  return Object.keys(data)
    .filter((key) => typeof data[key] === "object")
    .map((key) => ({ range: key, ...data[key] }));
};

const renderFeeDataFallback = (data: any, emptyText: ReactNode) => {
  const rows = normalizeTableRows(data);

  if (rows.length > 0) {
    return (
      <Table
        size="small"
        bordered
        pagination={false}
        rowKey={(_, index) => String(index)}
        columns={makeRangeColumns(rows[0])}
        dataSource={rows}
      />
    );
  }

  if (data && typeof data === "object" && Object.keys(data).length > 0) {
    return (
      <Input.TextArea
        value={JSON.stringify(data, null, 2)}
        disabled
        autoSize={{ minRows: 6, maxRows: 16 }}
      />
    );
  }

  return <Empty description={emptyText} />;
};

const getShippingFees = (feeConfig: AnyRecord, data: AnyRecord) => {
  if (asArray(feeConfig.shippingFees).length > 0) {
    return asArray(feeConfig.shippingFees);
  }
  if (asArray(data.shippingFees).length > 0) {
    return asArray(data.shippingFees);
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

const getLocationCode = (item: AnyRecord) =>
  display(item.location?.code ?? item.locationCode ?? item.code);

const getLocationName = (location: AnyRecord) =>
  display(location.display ?? location.name ?? location.code);

const getLocationFromShippingFee = (item: AnyRecord) => {
  if (item.location && typeof item.location === "object") return item.location;
  return {
    code: item.locationCode ?? item.location ?? item.code,
    display: item.locationName ?? item.name,
  };
};

const getWeightKey = (item: AnyRecord) =>
  `${display(item.minWeight)}-${display(item.maxWeight)}`;

const FeeTableContent = ({
  feeConfig,
  order,
}: {
  feeConfig: AnyRecord;
  order: AnyRecord;
}) => {
  const { t } = useTranslation();
  const metadata = feeConfig?.feeMetadata || {};
  const template = metadata.template;
  const marketplaceData = metadata.dataWithMarketPlace?.find(
    (item: AnyRecord) => item.marketplace === order?.marketplace?.code,
  )?.data;
  const data = marketplaceData || metadata.data || {};
  const emptyText = t("config_group.empty_fee_table");
  const localShippingFees = getShippingFees(feeConfig, data);
  const shouldFetchShippingFees =
    template === "shipping" && localShippingFees.length === 0;
  const { data: fetchedShippingFees = [], isLoading: isShippingFeesLoading } =
    useShipmentShippingFeesQuery(
      order?.configGroupId,
      feeConfig?.shippingClass ?? metadata.shippingClass,
      shouldFetchShippingFees,
    );

  if (template === "percentage_of_total_value") {
    const rows = buildRanges(data, "empty_order").map((range) => ({
      key: range.key,
      orderValue: rangeText(range, {
        emptyText: t("config_group.emptyOrderValue"),
        moneyUnit: order?.currency,
      }),
      fee: range.value,
    }));

    if (rows.length === 0) {
      return renderFeeDataFallback(data, emptyText);
    }

    return (
      <Table
        size="small"
        bordered
        pagination={false}
        rowKey="key"
        columns={[
          {
            title: t("config_group.orderValue"),
            dataIndex: "orderValue",
          },
          {
            title: t("config_group.serviceCharge"),
            dataIndex: "fee",
            render: (value) => <Input value={display(value)} disabled />,
          },
        ]}
        dataSource={rows}
      />
    );
  }

  if (template === "inspection") {
    const priceRanges = buildRanges(data, "empty_price");
    const quantityRanges = priceRanges.reduce<AnyRecord[]>((result, range) => {
      Object.keys(range.value || {}).forEach((key) => {
        if (!result.some((item) => item.key === key)) {
          result.push(buildRanges({ [key]: null }, "empty_quantity")[0]);
        }
      });
      return result;
    }, []);

    const rows = quantityRanges.map((quantityRange) => ({
      key: quantityRange.key,
      quantity: rangeText(quantityRange, {
        emptyText: t("config_group.emptyQuantity"),
      }),
      ...priceRanges.reduce((result: AnyRecord, priceRange) => {
        result[priceRange.key] = priceRange.value?.[quantityRange.key];
        return result;
      }, {}),
    }));

    if (rows.length === 0 || priceRanges.length === 0) {
      return renderFeeDataFallback(data, emptyText);
    }

    return (
      <Table
        size="small"
        bordered
        pagination={false}
        rowKey="key"
        columns={[
          {
            title: t("config_group.numberProducts"),
            dataIndex: "quantity",
            fixed: "left",
          },
          ...priceRanges.map((range) => ({
            title: rangeText(range, {
              emptyText: t("config_group.emptyUnitPrice"),
              moneyUnit: order?.currency,
            }),
            dataIndex: range.key,
            render: (value: any) => (
              <Input
                value={
                  value === null || value === undefined
                    ? empty
                    : feeMoney(value)
                }
                disabled
              />
            ),
          })),
        ]}
        dataSource={rows}
        scroll={{ x: "max-content" }}
      />
    );
  }

  if (template === "shipping") {
    const shippingFees =
      localShippingFees.length > 0
        ? localShippingFees
        : asArray(fetchedShippingFees);

    if (isShippingFeesLoading) {
      return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    if (shippingFees.length === 0) {
      return renderFeeDataFallback(data, emptyText);
    }

    const locations = shippingFees.reduce<AnyRecord[]>((result, item) => {
      const location = getLocationFromShippingFee(item);
      const code = display(location.code);
      if (!result.some((locationItem) => display(locationItem.code) === code)) {
        result.push(location);
      }
      return result;
    }, []);
    const firstLocationCode = display(locations[0]?.code);
    const weights = shippingFees
      .filter((item) => getLocationCode(item) === firstLocationCode)
      .sort(
        (left, right) =>
          Number(left.minWeight ?? 0) - Number(right.minWeight ?? 0),
      );
    const tableLocations =
      locations.length > 0 ? locations : [{ code: "newLocation" }];
    const tableWeights =
      weights.length > 0
        ? weights
        : [
            {
              minWeight: undefined,
              maxWeight: undefined,
              price: null,
              priceFormula: null,
            },
          ];

    return (
      <Table
        size="small"
        bordered
        pagination={false}
        rowKey={(record) => display(record.code)}
        columns={[
          {
            title: t("config_group.location"),
            dataIndex: "display",
            fixed: "left",
            render: (_text, record) => getLocationName(record),
          },
          ...tableWeights.map((weight) => ({
            title: `${t("config_group.from")} ${quantity(
              weight.minWeight,
            )}(kg) ${t("config_group.to")} ${quantity(weight.maxWeight)} (kg)`,
            dataIndex: getWeightKey(weight),
            render: (_value: any, record: AnyRecord) => {
              const currentFee = shippingFees.find(
                (item) =>
                  getLocationCode(item) === display(record.code) &&
                  item.minWeight === weight.minWeight &&
                  item.maxWeight === weight.maxWeight,
              );
              const price = currentFee?.price;
              return (
                <Input
                  value={
                    price === null || price === undefined || price === ""
                      ? empty
                      : quantity(price)
                  }
                  addonAfter="/kg"
                  disabled
                />
              );
            },
          })),
        ]}
        dataSource={tableLocations}
        scroll={{ x: 200 * tableWeights.length + 250 }}
      />
    );
  }

  if (template === "fixed_order" || template === "fixed_package") {
    return (
      <Row gutter={12} align="middle">
        <Col span={8}>
          <Typography.Text>{t("config_group.applied")}</Typography.Text>
        </Col>
        <Col span={10}>
          <Input value={data.value ?? empty} disabled />
        </Col>
        <Col span={6}>
          <Typography.Text>
            {template === "fixed_order"
              ? `₫/${t("config_group.order")}`
              : `₫/${t("config_group.package")}`}
          </Typography.Text>
        </Col>
      </Row>
    );
  }

  const rows = normalizeTableRows(data);
  if (rows.length === 0) {
    return renderFeeDataFallback(data, emptyText);
  }

  return (
    <Table
      size="small"
      bordered
      pagination={false}
      rowKey={(_, index) => String(index)}
      columns={makeRangeColumns(rows[0])}
      dataSource={rows}
    />
  );
};

const FinanceLine = ({
  label,
  value,
  onDetail,
}: {
  label: ReactNode;
  value: string;
  onDetail?: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <Flex
      align={onDetail ? "flex-start" : "center"}
      justify="space-between"
      gap={12}
      style={{ padding: "5px 0" }}
    >
      <Typography.Text style={{ color: "inherit" }}>{label}</Typography.Text>
      <Space direction="vertical" size={0} align="end">
        <Typography.Text
          strong
          style={{ color: "inherit", textAlign: "right" }}
        >
          {value}
        </Typography.Text>
        {onDetail && (
          <Typography.Link
            onClick={onDetail}
            style={{ color: "inherit", fontSize: 12 }}
          >
            {t("fee_tab.detail")}
          </Typography.Link>
        )}
      </Space>
    </Flex>
  );
};

const ProductField = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) => (
  <Form.Item
    label={label}
    required={required}
    validateStatus={error ? "error" : undefined}
    help={error}
  >
    {children}
  </Form.Item>
);

const CreditInfo = ({ label, value }: { label: string; value: string }) => (
  <CreditInfoInner label={label} value={value} />
);

const CreditInfoInner = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  const { token } = theme.useToken();
  return (
    <Flex align="flex-start" justify="space-between" gap={token.marginMD}>
      <span>{label}</span>
      <Typography.Text strong style={{ color: token.colorPrimary }}>
        {value}
      </Typography.Text>
    </Flex>
  );
};
