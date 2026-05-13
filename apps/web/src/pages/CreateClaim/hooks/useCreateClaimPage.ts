import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Form, notification } from "antd";
import type { UploadFile } from "antd";
import { useTranslation } from "@repo/i18n";
import {
  useClaimReasonsQuery,
  useCreateClaimMutation,
  useSolutionsQuery,
} from "@repo/hooks";

const TYPE_REASON_ORDER = "ORDER";
const TYPE_REASON_PRODUCT_ORDER = "ORDER_PRODUCT";
const TYPE_REASON_SHIPMENT = "SHIPMENT";
const TYPE_REASON_PRODUCT_SHIPMENT = "SHIPMENT_PRODUCT";

const normalizeBooleanParam = (value: string | null) =>
  value === "true" || value === "1";

const onlyDigits = (value?: string | number) => String(value || "").replace(/\D/g, "");

const resolveCreateClaimError = (error: any, t: (key: string) => string) => {
  const title = error?.response?.data?.title;
  const detail = error?.response?.data?.detail;

  if (title === "order_not_found" || title === "shipment_not_found") {
    return t("message.order_not_found");
  }
  if (title === "product_not_found") return t("message.product_not_found");
  if (title === "user_not_found") return t("message.user_not_found");
  if (title === "shipment_state_negative_end" || title === "order_state_negative_end") {
    return t("message.shipment_state_negative_end");
  }
  if (title === "invalid_not_received_quantity") {
    const suffix = detail?.includes(":") ? ` ${detail.substring(detail.indexOf(":") + 1)}` : "";
    return `${t("message.invalid_not_received_quantity")}${suffix}`;
  }

  return error?.response?.data?.message || detail || t("common.error");
};

export const useCreateClaimPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [isShipment, setIsShipment] = useState(
    normalizeBooleanParam(searchParams.get("isShipment")),
  );
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const orderCode = searchParams.get("orderCode") || "";
  const productCode = searchParams.get("productCode") || "";

  const orderReasonType = isShipment ? TYPE_REASON_SHIPMENT : TYPE_REASON_ORDER;
  const productReasonType = isShipment
    ? TYPE_REASON_PRODUCT_SHIPMENT
    : TYPE_REASON_PRODUCT_ORDER;

  const { data: orderReasons = [], isLoading: isOrderReasonsLoading } =
    useClaimReasonsQuery(orderReasonType);
  const { data: productReasons = [], isLoading: isProductReasonsLoading } =
    useClaimReasonsQuery(productReasonType);
  const { data: solutions = [], isLoading: isSolutionsLoading } = useSolutionsQuery([
    isShipment ? "shipment" : "order",
  ]);
  const createClaim = useCreateClaimMutation();

  const productCodeValue = Form.useWatch("productCode", form);
  const reasonCode = Form.useWatch("reasonCode", form);
  const solutionCode = Form.useWatch("solutionCode", form);

  const reasonOptions = useMemo(
    () => (productCodeValue ? productReasons : orderReasons),
    [orderReasons, productReasons, productCodeValue],
  );

  const selectedReason = reasonOptions.find((item: any) => item.code === reasonCode);
  const selectedSolution = solutions.find((item: any) => item.code === solutionCode);
  const requiresMissingQuantity =
    reasonCode === "not_received" || reasonCode === "shipping_not_received";
  const requiresDescription = reasonCode === "other";
  const requiresAttachment =
    reasonCode === "faulty_product" || reasonCode === "shipping_faulty_product";
  const requiresSuggest = solutionCode === "compensate";

  const initialValues = {
    orderCode,
    productCode,
  };

  const resetReasonState = () => {
    form.setFieldsValue({
      reasonCode: undefined,
      notReceived: undefined,
      description: undefined,
    });
    setFileList([]);
  };

  const handleShipmentChange = (checked: boolean) => {
    setIsShipment(checked);
    form.setFieldsValue({
      productCode: undefined,
      solutionCode: undefined,
      suggest: undefined,
    });
    resetReasonState();
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isValidSize = file.size / 1024 / 1024 <= 10;

    if (!isImage) {
      notification.error({ message: t("message.picture") });
      return false;
    }

    if (!isValidSize) {
      notification.error({ message: t("ticket_add.picture_size") });
      return false;
    }

    if (fileList.length >= 10) {
      notification.error({ message: t("ticket_add.picture_size") });
      return false;
    }

    return false;
  };

  const handleRemoveFile = (file: UploadFile) => {
    setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
  };

  const buildPayload = (values: any) => {
    const finalOrderCode = values.orderCode?.trim();
    const finalProductCode = values.productCode?.trim();
    const name = [
      finalOrderCode ? `${t("ticket_add.order")} ${finalOrderCode.toUpperCase()}` : "",
      finalProductCode ? `${t("ticket_add.product")} ${finalProductCode.toUpperCase()}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    return {
      name,
      description: values.description || "",
      relatedProduct: finalProductCode || "",
      relatedOrder: finalOrderCode,
      reasonCode: values.reasonCode,
      solutionCode: values.solutionCode,
      suggest: values.suggest ? onlyDigits(values.suggest) : null,
      reasonData: {
        reasonDetail: [],
      },
      notReceived: values.notReceived ? onlyDigits(values.notReceived) : null,
      ticketType: isShipment ? TYPE_REASON_SHIPMENT : TYPE_REASON_ORDER,
    };
  };

  const handleSubmit = async (values: any) => {
    if (requiresAttachment && fileList.length === 0) {
      notification.error({ message: t("message.picture") });
      return;
    }

    const files = fileList
      .map((file) => file.originFileObj)
      .filter(Boolean) as File[];

    try {
      await createClaim.mutateAsync({
        payload: buildPayload(values),
        files,
      });
      notification.success({ message: t("message.success") });
      navigate("/claims");
    } catch (error: any) {
      notification.error({ message: resolveCreateClaimError(error, t) });
    }
  };

  return {
    t,
    form,
    initialValues,
    isShipment,
    handleShipmentChange,
    reasonOptions,
    solutions,
    selectedReason,
    selectedSolution,
    reasonCode,
    solutionCode,
    requiresMissingQuantity,
    requiresDescription,
    requiresAttachment,
    requiresSuggest,
    fileList,
    setFileList,
    beforeUpload,
    handleRemoveFile,
    handleSubmit,
    createClaim,
    isLoading:
      isOrderReasonsLoading || isProductReasonsLoading || isSolutionsLoading,
    resetReasonState,
    onlyDigits,
  };
};
