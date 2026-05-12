import { Fragment } from "react";
import type { ReactNode } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Form,
  Image,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ClockCircleOutlined,
  CloseOutlined,
  DownOutlined,
  EditOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  RocketOutlined,
  SaveOutlined,
  ShrinkOutlined,
} from "@ant-design/icons";
import {
  useShipmentDetailContent,
  type AnyRecord,
} from "./hooks/useShipmentDetailContent";

interface ShipmentDetailContentProps {
  shipment: AnyRecord;
  statusData?: AnyRecord[];
}

const empty = "---";
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

const money = (value: any, currency = "VND", signed = false): string => {
  if (value === null || value === undefined || value === "") return empty;
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return empty;
  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.ceil(Math.abs(numericValue)));
  return signed && numericValue < 0 ? `-${formatted}` : formatted;
};

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

const feeText = (item: AnyRecord, currency: string) => {
  if (item.free) {
    return `${money(item.actualAmount, currency)}  Miễn phí`;
  }
  if (item.manual && item.provisionalAmount !== null) {
    return `${money(item.provisionalAmount, currency)}  ${money(item.actualAmount, currency)}`;
  }
  return money(item.actualAmount, currency);
};

const activityText = (item: AnyRecord) => {
  const data = Array.isArray(item.data) ? item.data[0] : item.data;
  if (item.memo) return item.memo;
  if (data?.oldValue !== undefined || data?.newValue !== undefined) {
    return `${display(data.property)}: ${display(data.oldValue?.name ?? data.oldValue)} -> ${display(data.newValue?.name ?? data.newValue)}`;
  }
  return display(item.activity ?? item.type);
};

export const ShipmentDetailContent = ({
  shipment,
  statusData,
}: ShipmentDetailContentProps) => {
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
    currency,
    statusInfo,
    shipmentWaybillThreshold,
    productRows,
    parcelRows,
    activityRows,
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
    financial,
    claims,
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
    addReceipt,
    removeReceipt,
    openProductModal,
    closeProductModal,
    updateProductDraft,
    submitProduct,
    removeProduct,
    submitWaybill,
    removeWaybill,
  } = detail;

  const renderNumberEditor = (
    field: string,
    value: any,
    displayValue: string,
    canEdit: boolean,
    placeholder: string,
  ) => {
    if (editingField === field) {
      return (
        <span className="inline-flex max-w-[260px] items-center gap-2">
          <InputNumber
            min={0}
            precision={0}
            value={draftValue}
            placeholder={placeholder}
            className="w-full"
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
            className="cursor-pointer text-primary"
            onMouseDown={() =>
              saveShipmentField(field, draftValue === "" ? null : draftValue)
            }
          />
          <CloseOutlined
            className="cursor-pointer text-gray-400"
            onClick={cancelEdit}
          />
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2">
        <span>{displayValue}</span>
        {canEdit && (
          <EditOutlined
            className="cursor-pointer text-primary"
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
        <span className="inline-flex w-full max-w-[520px] items-start gap-2">
          <span className="min-w-0 flex-1">{input}</span>
          <SaveOutlined
            className="mt-2 cursor-pointer text-primary"
            onMouseDown={() => saveShipmentField(field, draftValue ?? "")}
          />
          <CloseOutlined
            className="mt-2 cursor-pointer text-gray-400"
            onClick={cancelEdit}
          />
        </span>
      );
    }

    return (
      <span className="inline-flex min-w-0 items-center gap-2">
        <span className="whitespace-pre-wrap break-words">
          {display(value)}
        </span>
        <EditOutlined
          className="flex-none cursor-pointer text-primary"
          onClick={() => startEdit(field, value ?? "")}
        />
      </span>
    );
  };

  const renderHsCodeEditor = () => {
    if (editingField === "hsCode") {
      return (
        <span className="inline-flex max-w-[320px] items-center gap-2">
          <Select
            showSearch
            value={draftValue ?? undefined}
            className="min-w-[240px]"
            placeholder="HS Code"
            optionFilterProp="label"
            options={asArray(hsList).map((item) => ({
              value: item.code,
              label: item.name || item.code,
            }))}
            onChange={(nextValue) => saveShipmentField("hsCode", nextValue)}
          />
          <CloseOutlined
            className="cursor-pointer text-gray-400"
            onClick={cancelEdit}
          />
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2">
        <span>{display(hsCode?.name)}</span>
        {!statusInfo?.negativeEnd && (
          <EditOutlined
            className="cursor-pointer text-primary"
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
              <span className="inline-flex items-center gap-2">
                <Input
                  value={waybillCodeDraft}
                  className="w-[180px]"
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
                className="p-0"
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
            <Button type="link" className="p-0">
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
          <div className="uppercase">{display(text)}</div>
          {row.note && <div className="text-primary underline">Ghi chú</div>}
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
        <div className="whitespace-nowrap">
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
      render: () => <span className="text-primary">Chi tiết</span>,
    },
  ];

  const financeColumns: ColumnsType<AnyRecord> = [
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      render: (text) => dateTime(text),
    },
    {
      title: "Giá trị",
      dataIndex: "amount",
      render: (text) => money(text, currency, true),
    },
    {
      title: "Loại giao dịch",
      dataIndex: "type",
      render: (type) => display(type?.name ?? type),
    },
    {
      title: "Nội dung",
      dataIndex: "memo",
      render: (memo, record) => (
        <div>
          <div className="text-xs text-gray-500">
            Mã giao dịch : {display(record.txid)}
          </div>
          <div>{display(memo)}</div>
        </div>
      ),
    },
  ];

  const claimColumns: ColumnsType<AnyRecord> = [
    {
      title: "Mã khiếu nại",
      dataIndex: "code",
      render: (text, record) => (
        <Link to={`/tickets/${record.code}`} className="text-primary">
          #{display(text)}
        </Link>
      ),
    },
    {
      title: "Tên khiếu nại",
      dataIndex: "name",
      render: (text, record) => (
        <Link to={`/tickets/${record.code}`} className="text-primary">
          {display(text)}
        </Link>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      render: (text) => shortDateTime(text),
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      render: (_text, record) =>
        record.publicStateNewView ? (
          <Flex align="center" gap={6}>
            <span
              className="inline-block h-2 w-2 flex-none rounded-full"
              style={{
                backgroundColor: record.publicStateNewView.color || "#FFC107",
              }}
            />
            {record.publicStateNewView.name}
            {record.archived && " (Đã đóng)"}
          </Flex>
        ) : (
          ""
        ),
    },
    {
      title: "Hoàn tiền",
      dataIndex: "totalRefund",
      render: (text) => (
        <span className="font-semibold text-green-600">{money(text)}</span>
      ),
    },
    {
      title: "",
      dataIndex: "action",
      className: "hidden-md",
      render: (_text, record) => (
        <Link to={`/tickets/${record.code}`} className="text-primary">
          Chi tiết
        </Link>
      ),
    },
  ];

  const creditColumns: ColumnsType<AnyRecord> = [
    {
      title: "Mã",
      dataIndex: "loanId",
      render: (text) => (
        <span className="font-semibold text-primary">#{display(text)}</span>
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
    <div className="flex-1 min-w-0 space-y-4">
      {shipment.deliveryNotice && (
        <Alert
          message={<span className="font-semibold">Thông báo</span>}
          description={
            <span>
              Đơn hàng đã có thông báo giao hàng. Vui lòng tạo yêu cầu giao.
            </span>
          }
          type="success"
          showIcon
        />
      )}

      {showPackageAlert && (
        <Alert
          message={<span className="font-semibold">Thông báo</span>}
          description={`Giá trị hàng vượt ngưỡng ${money(taxFreeThreshHold)}, số kiện miễn thuế dự kiến ${freePackages}`}
          type="warning"
          showIcon
        />
      )}

      <Card className="">
        <Row align="middle" gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Flex align="center" gap={12}>
              <div className="flex h-11 w-11 items-center justify-center rounded border bg-gray-50">
                <RocketOutlined className="text-2xl text-gray-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  #{display(shipment.code)}
                </div>
                <Tag color={statusInfo?.color || "default"} className="mt-1">
                  {display(statusInfo?.name)}
                </Tag>
              </div>
            </Flex>
          </Col>

          <Col xs={24} lg={8} className="space-y-1">
            <InfoLine
              label="Tổng chi phí"
              value={money(shipment.totalFee)}
              strong
            />
            <InfoLine
              label="Tổng tiền hàng"
              value={money(shipment.totalValue, currency)}
              strong
            />
          </Col>

          <Col xs={24} lg={8}>
            <Flex justify="end" gap={8}>
              {statusInfo?.confirmable && <Button>Xác nhận đã nhận</Button>}
              {statusInfo?.cancellable && <Button danger>Hủy đơn</Button>}
            </Flex>
          </Col>
        </Row>

        {isExpand && (
          <Fragment>
            <Divider className="my-4" />
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <InfoBlock
                  label="Cân nặng tính phí"
                  value={
                    shipment.actualWeight
                      ? `${quantity(shipment.actualWeight)} kg`
                      : "Không xác định"
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <InfoBlock
                  label="Thể tích"
                  value={
                    shipment.volumetric
                      ? `${quantity(shipment.volumetric)} cm3`
                      : "Không xác định"
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <InfoBlock
                  label="Giá trị hàng hóa"
                  value={renderNumberEditor(
                    "declareValue",
                    shipment.declareValue,
                    money(shipment.declareValue),
                    !!statusInfo?.updatable,
                    "Giá trị hàng hóa",
                  )}
                />
              </Col>
              <Col xs={24} md={6}>
                <InfoBlock label="HS Code" value={renderHsCodeEditor()} />
              </Col>
            </Row>

            {totalNeedPay > 0 && (
              <Fragment>
                <Divider className="my-4" />
                <div className="space-y-2">
                  {shipment.contractWithShopkeeper && (
                    <InfoLine
                      label="BiFin"
                      value={money(
                        activeThirdPartyLoan?.totalAmountPay ?? 0,
                        undefined,
                        true,
                      )}
                      accent
                    />
                  )}
                  <InfoLine
                    label="Số tiền cần thanh toán"
                    value={money(totalNeedPay, undefined, true)}
                    accent
                  />
                </div>
              </Fragment>
            )}

            <Divider className="my-4" />
            <InfoLine
              label="Số kiện dự kiến"
              value={renderNumberEditor(
                "expectedPackages",
                shipment.expectedPackages,
                quantity(shipment.expectedPackages),
                !!statusInfo?.updatable,
                "Số kiện dự kiến",
              )}
            />

            {shipment.peerPaymentCode && (
              <Fragment>
                <Divider className="my-4" />
                <InfoLine
                  label="Mã yêu cầu thanh toán"
                  value={display(shipment.peerPaymentCode)}
                />
              </Fragment>
            )}

            <Divider className="my-4" />
            <InfoLine
              label="Số kiện thực tế"
              value={quantity(shipment.actualPackages)}
            />

            <Divider className="my-4" />
            <InfoLine
              label="Hóa đơn gốc"
              value={
                <span className="inline-flex items-center gap-2">
                  <span>{receiptText || empty}</span>
                  {statusInfo?.updatable && (
                    <EditOutlined
                      className="cursor-pointer text-primary"
                      onClick={() => setOriginalReceiptModalOpen(true)}
                    />
                  )}
                </span>
              }
              alignStart
            />

            <Divider className="my-4" />
            <div>
              <span className="text-sm text-gray-500">Dịch vụ: </span>
              {services.length > 0
                ? services.map((service, index) => (
                    <Fragment key={service.code ?? service.name ?? index}>
                      <span
                        className={
                          service.approved === false
                            ? "text-sm line-through"
                            : service.approved === null
                              ? "text-sm text-yellow-500"
                              : "text-sm text-gray-900 dark:text-gray-100"
                        }
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
                <Divider className="my-4" />
                <InfoLine
                  label="Kho nhận"
                  value={shipment.receivingWarehouse.displayName}
                />
              </Fragment>
            )}

            <Divider className="my-4" />
            <InfoLine
              label={
                shipment.receiptAddress
                  ? "Địa chỉ nhận hàng"
                  : "Địa chỉ giao hàng"
              }
              value={formatAddress(shipment.address)}
            />

            {shipment.receiptAddress && (
              <Fragment>
                <Divider className="my-4" />
                <InfoLine
                  label="Địa chỉ giao hàng"
                  value={formatAddress(shipment.receiptAddress, true)}
                />
              </Fragment>
            )}

            <Divider className="my-4" />
            <InfoLine
              label="Mã đơn ký gửi tham chiếu"
              value={renderTextEditor(
                "refShipmentCode",
                shipment.refShipmentCode,
                "Mã đơn ký gửi tham chiếu",
              )}
            />

            <Divider className="my-4" />
            <InfoLine
              label="Mã đơn hàng khách"
              value={renderTextEditor(
                "refCustomerCode",
                shipment.refCustomerCode,
                "Mã đơn hàng khách",
              )}
            />

            <Divider className="my-4" />
            <div className="space-y-2">
              {shipment.remark && (
                <InfoLine label="Ghi chú đơn hàng" value={shipment.remark} />
              )}
              <InfoLine
                label="Ghi chú cá nhân cho đơn hàng"
                value={renderTextEditor(
                  "note",
                  shipment.note,
                  "Ghi chú cá nhân cho đơn hàng",
                  true,
                )}
              />
            </div>

            {shipment.receivingWarehouse?.address && (
              <div className="mt-4 flex gap-3">
                <span className="flex-none text-sm text-gray-500">
                  Kho nhận hàng:
                </span>
                <div className="w-full">
                  <div className="whitespace-pre-wrap rounded border bg-white p-2 text-sm text-gray-900">
                    {shipment.receivingWarehouse.address.trim()}
                  </div>
                  <div className="pt-1 text-sm text-gray-600">
                    Lưu ý kho nhận hàng
                  </div>
                </div>
              </div>
            )}
          </Fragment>
        )}
      </Card>

      <Card className="text-center" styles={{ body: { padding: 8 } }}>
        <Button
          type="text"
          icon={isExpand ? <ShrinkOutlined /> : <DownOutlined />}
          onClick={() => setIsExpand((value) => !value)}
        >
          {isExpand ? <>Thu gọn</> : <>Xem thêm</>}
        </Button>
      </Card>

      <Card styles={{ body: { paddingTop: 8 } }}>
        <Tabs
          defaultActiveKey="WAYBILLS"
          items={[
            {
              key: "PRODUCT",
              label: "Sản phẩm",
              children: (
                <Spin spinning={isProductsLoading}>
                  <List
                    dataSource={productRows}
                    header={
                      <Card
                        size="small"
                        className="mb-3 bg-gray-50"
                        styles={{ body: { padding: "8px 12px" } }}
                      >
                        <Row align="middle">
                          <Col span={10}>
                            <Text>Sản phẩm</Text>
                          </Col>
                          <Col span={14}>
                            <Row align="middle">
                              <Col span={6} className="text-right">
                                HS Code
                              </Col>
                              <Col span={6} className="text-right">
                                Số lượng
                              </Col>
                              <Col span={6} className="text-right">
                                Đơn giá
                              </Col>
                              <Col span={6} className="text-right">
                                {statusInfo?.productUpdatable && (
                                  <Button onClick={() => openProductModal()}>
                                    Thêm sản phẩm
                                  </Button>
                                )}
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Card>
                    }
                    renderItem={(item) => (
                      <List.Item className="mb-3 rounded border border-gray-200 bg-gray-50 p-4">
                        <Col span={10}>
                          <Flex align="flex-start" gap={10}>
                            {item.productImage ? (
                              <Image
                                src={item.productImage}
                                alt={display(item.name)}
                                width={44}
                                height={44}
                                preview={false}
                                className="rounded object-cover"
                              />
                            ) : (
                              <RocketOutlined
                                className="text-gray-400"
                                style={{ fontSize: 30 }}
                              />
                            )}
                            <Space direction="vertical" size={2}>
                              <Text className="text-xs">
                                #{stripProductCode(item.code)}
                              </Text>
                              {item.productUrl ? (
                                <Typography.Link
                                  target="_blank"
                                  href={item.productUrl}
                                  className="break-words font-semibold"
                                >
                                  {item.name || empty}
                                </Typography.Link>
                              ) : (
                                <Text strong className="break-words">
                                  {item.name || empty}
                                </Text>
                              )}
                              <Text type="secondary" className="break-words">
                                {item.translatedName || empty}
                              </Text>
                              {getVariantText(item) && (
                                <Text type="secondary" className="break-words">
                                  {getVariantText(item)}
                                </Text>
                              )}
                              <Text type="secondary" className="break-words">
                                {item.merchantName || empty}
                              </Text>
                              <Text type="secondary" className="break-words">
                                {item.merchantContact || empty}
                              </Text>
                            </Space>
                          </Flex>
                        </Col>
                        <Col span={14}>
                          <Row>
                            <Col span={6} className="text-right">
                              <Text strong>
                                {display(
                                  asArray(hsList).find(
                                    (hs) => hs.code === item.hsCode,
                                  )?.name,
                                )}
                              </Text>
                            </Col>
                            <Col span={6} className="text-right">
                              <Text strong>{quantity(item.quantity)}</Text>
                            </Col>
                            <Col span={6} className="text-right">
                              <Text strong>
                                {money(item.unitPrice, currency)}
                              </Text>
                            </Col>
                            <Col span={6}>
                              {statusInfo?.productUpdatable && (
                                <Flex justify="end" align="center">
                                  <Button
                                    type="link"
                                    className="p-0"
                                    onClick={() => openProductModal(item)}
                                  >
                                    Sửa
                                  </Button>
                                  <Divider type="vertical" />
                                  <Popconfirm
                                    title="Bạn có chắc muốn xóa?"
                                    onConfirm={() => removeProduct(item.code)}
                                    okText="Có"
                                    cancelText="Không"
                                  >
                                    <Button type="link" className="p-0">
                                      Xóa
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
                      emptyText: <Empty description="Không có dữ liệu" />,
                    }}
                  />
                </Spin>
              ),
            },
            {
              key: "WAYBILLS",
              label: "Mã vận đơn",
              children: (
                <Spin spinning={isWaybillsLoading || isParcelsLoading}>
                  <Table
                    columns={waybillColumns}
                    dataSource={sortNewest(waybillRows)}
                    rowKey={(row, index) => row.code ?? `waybill-${index}`}
                    pagination={{ hideOnSinglePage: true, pageSize: 9999 }}
                    expandable={{
                      expandedRowRender: (row) => (
                        <Table
                          columns={parcelColumns}
                          dataSource={getParcelsForWaybill(row, parcelRows)}
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
                        <div className="px-4 pb-4">
                          <div className="mb-3 rounded-md bg-blue-50 p-3">
                            <div className="mb-3 font-semibold">
                              Thông tin BiFin
                            </div>
                            <div className="max-w-xl space-y-3">
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
                            </div>
                          </div>
                          <Table
                            columns={creditColumns}
                            dataSource={asArray(credits)}
                            pagination={false}
                            rowKey={(row, index) => row.id ?? `credit-${index}`}
                          />
                        </div>
                      </Spin>
                    ),
                  },
                ]
              : []),
            {
              key: "FEES",
              label: "Tài chính",
              children: (
                <Spin spinning={isFeesLoading}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={16}>
                      <Space direction="vertical" size={16} className="w-full">
                        <FeeGroup
                          title="Phí dịch vụ"
                          rows={sortByPosition(asArray(fees)).filter(
                            (item) =>
                              item.type &&
                              !item.type.shipping &&
                              !item.type.additional,
                          )}
                          currency={currency}
                        />
                        <FeeGroup
                          title="Phí vận chuyển"
                          rows={sortByPosition(asArray(fees)).filter(
                            (item) =>
                              item.type &&
                              item.type.shipping &&
                              !item.type.additional,
                          )}
                          currency={currency}
                        />
                        <FeeGroup
                          title="Phụ phí"
                          rows={sortByPosition(asArray(fees)).filter(
                            (item) =>
                              item.type &&
                              !item.type.shipping &&
                              item.type.additional,
                          )}
                          currency={currency}
                        />
                      </Space>
                    </Col>
                    <Col xs={24} lg={8}>
                      <Space direction="vertical" size={8} className="w-full">
                        <Text strong className="uppercase">
                          Tài chính đơn
                        </Text>
                        <Card
                          className="bg-blue-600 text-white"
                          styles={{ body: { padding: 12 } }}
                        >
                          <Space
                            direction="vertical"
                            size={8}
                            className="w-full"
                          >
                            <FinanceLine
                              label="Giá trị hàng hóa"
                              value={money(shipment.declareValue)}
                            />
                            <FinanceLine
                              label="Tổng chi phí"
                              value={money(shipment.totalFee)}
                            />
                            {shipment.totalCoupon > 0 && (
                              <FinanceLine
                                label="Mã giảm giá"
                                value={`-${money(shipment.totalCoupon)}`}
                              />
                            )}
                            <FinanceLine
                              label="Đã thanh toán"
                              value={money(shipment.totalPaid)}
                            />
                            <FinanceLine
                              label="Dịch vụ trả lại"
                              value={money(shipment.totalRefund)}
                            />
                            {!statusInfo?.negativeEnd && (
                              <FinanceLine
                                label={
                                  shipment.totalUnpaid >= 0
                                    ? "Cần thanh toán"
                                    : "Tiền thừa"
                                }
                                value={money(
                                  shipment.totalUnpaid,
                                  undefined,
                                  true,
                                )}
                              />
                            )}
                            {shipment.totalClaim && (
                              <>
                                <Divider className="my-2 bg-blue-300" />
                                <FinanceLine
                                  label="Khiếu nại đã hoàn"
                                  value={`${money(shipment.totalClaim)} / Chi tiết`}
                                />
                              </>
                            )}
                            {shipment.totalCollect && (
                              <>
                                <Divider className="my-2 bg-blue-300" />
                                <FinanceLine
                                  label="Truy thu"
                                  value={`${money(shipment.totalCollect, undefined, true)} / Chi tiết`}
                                />
                              </>
                            )}
                          </Space>
                        </Card>
                        {statusInfo?.couponEnabled && (
                          <Flex justify="end">
                            <Button type="link">Mã giảm giá</Button>
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
              label: "Giao dịch",
              children: (
                <Spin spinning={isFinancialLoading}>
                  <Table
                    columns={financeColumns}
                    dataSource={asArray(financial)}
                    rowKey={(row, index) =>
                      row.id ?? row.txid ?? `finance-${index}`
                    }
                    pagination={false}
                    locale={{
                      emptyText: <Empty description="Không có dữ liệu" />,
                    }}
                  />
                </Spin>
              ),
            },
            {
              key: "TICKETS",
              label: (
                <span>
                  Khiếu nại
                  {claims.length > 0 ? ` (${quantity(claims.length)})` : ""}
                </span>
              ),
              children: (
                <Spin spinning={isClaimsLoading}>
                  <div className="p-2">
                    {claims.length > 0 ? (
                      <Fragment>
                        <Flex
                          justify="space-between"
                          align="center"
                          className="mb-3 border-b border-gray-200 pb-3"
                        >
                          <Text strong>
                            Danh sách khiếu nại ({quantity(claims.length)})
                          </Text>
                          <Link
                            to={`/tickets/create?orderCode=${shipment.code}&isShipment=true`}
                          >
                            <Button type="primary" ghost size="small">
                              Tạo khiếu nại
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
                      <Row>
                        <Col span={10}>
                          <Empty description={false} />
                        </Col>
                        <Col span={14}>
                          <Flex align="center" className="h-full">
                            <Link
                              to={`/tickets/create?orderCode=${shipment.code}&isShipment=true`}
                            >
                              <Button type="primary">Tạo khiếu nại</Button>
                            </Link>
                          </Flex>
                        </Col>
                      </Row>
                    )}
                  </div>
                </Spin>
              ),
            },
            {
              key: "HISTORY",
              label: "Lịch sử",
              children: (
                <Spin spinning={isMilestonesLoading}>
                  <Timeline mode="alternate" className="px-4 pb-4">
                    {asArray(milestones).map((item, index) => {
                      const foundStatus = statusData?.find(
                        (status) => status.code === item.status,
                      );
                      const day =
                        Number(item.handlingTime) > 1 ? "ngày" : "ngày";
                      return (
                        <Timeline.Item
                          key={item.id ?? `${item.status}-${index}`}
                          color={index === 0 ? "red" : "green"}
                          dot={
                            index === 0 ? (
                              <ClockCircleOutlined className="text-2xl" />
                            ) : undefined
                          }
                        >
                          <span className="pr-1 text-gray-500">
                            {display(foundStatus?.name)}:
                          </span>
                          <span className="pr-1 font-semibold">
                            {shortDateTime(item.timestamp)}
                          </span>
                          <span className="font-semibold">
                            (
                            {item.handlingTime === null
                              ? "Không xác định"
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
              label: "Log",
              children: (
                <Spin spinning={isActivitiesLoading}>
                  <div className="px-5 pb-4">
                    {activityRows.length > 0 ? (
                      activityRows.map((item, index) => (
                        <div key={item.id ?? `log-${index}`}>
                          <div
                            className={`text-sm text-gray-500 ${index !== 0 ? "mt-3" : ""}`}
                          >
                            <span>{shortDateTime(item.timestamp)}</span>,
                            <span className="pl-1">
                              {item.role === "CUSTOMER"
                                ? "Khách hàng"
                                : "Nhân viên"}
                              :
                            </span>
                            <span className="pl-1 font-semibold text-gray-900">
                              {display(item.actor?.fullname)}
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap text-base">
                            {activityText(item)}
                          </div>
                          <Divider className="my-3" />
                        </div>
                      ))
                    ) : (
                      <Empty description="Không có dữ liệu" />
                    )}
                  </div>
                </Spin>
              ),
            },
          ]}
        />
      </Card>

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

          <div className="grid gap-4 md:grid-cols-2">
            <ProductField
              label="Số lượng"
              required
              error={productErrors.quantity}
            >
              <InputNumber
                className="w-full"
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
            <ProductField
              label="Đơn giá"
              required
              error={productErrors.unitPrice}
            >
              <InputNumber
                className="w-full"
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
          </div>

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
        <div className="space-y-3">
          <div className="flex gap-2">
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
          </div>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      </Modal>
    </div>
  );
};

const getParcelsForWaybill = (waybill: AnyRecord, parcels: AnyRecord[]) => {
  if (waybill.emptyWaybill) return parcels.filter((item) => !item.waybillCode);
  return parcels.filter((item) => item.waybillCode === waybill.code);
};

const InfoBlock = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <h3 className="mb-1 text-sm font-normal text-gray-500">{label}</h3>
    <span className="font-medium text-gray-900 dark:text-gray-100">
      {value}
    </span>
  </div>
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
  <div className={`flex gap-2 ${alignStart ? "items-start" : "items-center"}`}>
    <span className="flex-none text-sm text-gray-500">{label}: </span>
    <span
      className={`${strong ? "font-bold" : "font-medium"} ${accent ? "text-primary" : "text-gray-900 dark:text-gray-100"}`}
    >
      {value}
    </span>
  </div>
);

const FeeGroup = ({
  title,
  rows,
  currency,
}: {
  title: string;
  rows: AnyRecord[];
  currency: string;
}) => {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase">{title}</h3>
      <ul className="space-y-2 rounded bg-gray-50 p-4">
        {rows.map((item, index) => (
          <li
            key={item.id ?? `${title}-${index}`}
            className="flex items-center justify-between gap-4"
          >
            <span>
              {display(item.type?.name)}
              {(item.reason || item.customerDiscountLevel) && (
                <QuestionCircleOutlined className="ml-2 text-gray-400" />
              )}
            </span>
            <span>{feeText(item, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FinanceLine = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span>{label}</span>
    <span className="text-right font-semibold">{value}</span>
  </div>
);

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
  <div className="flex items-start justify-between gap-4">
    <span>{label}</span>
    <span className="font-semibold text-primary">{value}</span>
  </div>
);
