import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { App, Form, Upload } from "antd";
import dayjs from "dayjs";
import {
  useExportShipmentsMutation,
  useImportShipmentsMutation,
  useListShipmentQuery,
  useShipmentServiceGroupsQuery,
  useShipmentServicesQuery,
  useShipmentStatisticQuery,
  useShipmentStatusesQuery,
} from "../useShipmentHooks";
import { useFilterWithURL } from "../useFilterWithURL";
import { usePaginationWithURL } from "../usePaginationWithURL";
import { useTranslation } from "@repo/i18n";

export const sortShipmentServicesByPosition = <
  T extends { position?: number | string },
>(
  items: T[] = [],
) =>
  [...items].sort(
    (a, b) => Number(a.position || 0) - Number(b.position || 0),
  );

export const getCustomerVisibleShipmentServices = (services: any[] = []) =>
  sortShipmentServicesByPosition(services).filter(
    (service: any) => service.onlyStaff !== true,
  );

export const getShipmentServicesWithoutGroup = (services: any[] = []) =>
  sortShipmentServicesByPosition(
    services.filter((service: any) => !service.serviceGroup),
  );

export const getShipmentServicesInGroup = (
  services: any[] = [],
  groupCode?: string,
) =>
  sortShipmentServicesByPosition(
    services.filter((service: any) => service.serviceGroup?.code === groupCode),
  );

export const getVisibleShipmentServiceGroups = (
  serviceGroups: any[] = [],
  services: any[] = [],
) =>
  sortShipmentServicesByPosition(serviceGroups).filter((group: any) =>
    services.some((service: any) => service.serviceGroup?.code === group.code),
  );

export interface UseShipmentsLogicProps {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
}

export const useShipmentsLogic = ({
  page,
  pageSize,
  filters,
}: UseShipmentsLogicProps) => {
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      page: page - 1,
      size: pageSize,
      sort: "createdAt:desc",
      ...filters,
    };

    ["statuses", "services"].forEach((key) => {
      if (Array.isArray(params[key])) {
        params[key] = params[key].join(",");
      }
    });

    if (params.existsProduct === true) {
      params.existsProduct = "false";
    }

    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === null || params[key] === "") {
        delete params[key];
      }
    });

    return params;
  }, [page, pageSize, filters]);

  const {
    data: shipmentData,
    isLoading: isShipmentLoading,
    isFetching: isShipmentFetching,
  } = useListShipmentQuery(apiParams);
  const { data: statusData } = useShipmentStatusesQuery();
  const { data: statisticData } = useShipmentStatisticQuery();
  const { data: servicesData, isLoading: isServicesLoading } =
    useShipmentServicesQuery();
  const { data: serviceGroupsData, isLoading: isServiceGroupsLoading } =
    useShipmentServiceGroupsQuery();

  const statusOptions = useMemo(() => {
    if (!statusData) return [];
    return statusData.map((status: any) => {
      const statistic = statisticData?.find(
        (item: any) => item.status === status.code,
      );
      const count = Number(statistic?.total || 0);

      return {
        label: status.name,
        value: status.code,
        count,
        hasStatistic: Boolean(statistic),
      };
    });
  }, [statusData, statisticData]);

  return {
    shipmentData,
    isShipmentLoading,
    isShipmentFetching,
    statusData,
    statisticData,
    servicesData,
    serviceGroupsData,
    isServicesLoading: isServicesLoading || isServiceGroupsLoading,
    statusOptions,
    apiParams,
  };
};

const validateLink = (text: string) => {
  const urlRegex =
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\\/%?=~_|!:,.;]*[-A-Z0-9+&@#\\/%=~_|])/gi;
  return urlRegex.test(text);
};

const readFileAsBinaryString = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(String(event.target?.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsBinaryString(file);
  });

const validateShipmentExcelFile = async (
  file: File,
  t: (key: string) => string,
) => {
  const resultFile = await readFileAsBinaryString(file);
  const workbook = XLSX.read(resultFile, { type: "binary", sheets: 0 });
  const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!firstWorksheet) {
    throw new Error("data_sheet_not_found");
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(firstWorksheet, {
    range: 2,
    header: "A",
  });
  const requiredColumns = [
    "A",
    "B",
    "C",
    "E",
    "F",
    "I",
    "J",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
  ];
  const numberColumns = ["A", "I", "J"];

  return rows
    .map((row: Record<string, any>, index: number) => {
      const errors: string[] = [];

      requiredColumns.forEach((column) => {
        const value = row[column];
        if (value === undefined || value === null || !String(value).trim()) {
          errors.push(
            `${t("shipments.column")} ${column} ${t("shipments.lack_of_information")}`,
          );
        }
      });

      numberColumns.forEach((column) => {
        const value = row[column];
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() &&
          Number.isNaN(Number(value))
        ) {
          errors.push(
            `${t("shipments.column")} ${column} ${t("shipments.wrong_data_type")}`,
          );
        }
      });

      const linkValue = row.C;
      if (
        linkValue !== undefined &&
        linkValue !== null &&
        String(linkValue).trim() &&
        !validateLink(String(linkValue))
      ) {
        errors.push(`${t("shipments.column")} C ${t("shipments.link_error")}`);
      }

      return errors.length > 0
        ? `${t("shipments.row")} ${index + 3}, ${errors.join(", ")}`
        : "";
    })
    .filter(Boolean);
};

/**
 * Shared orchestration for the shipments page.
 * Syncs filter/pagination URL state and handles import/export interactions.
 */
export const useShipmentsPage = () => {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importServices, setImportServices] = useState<string[]>([]);
  const [importFileErrors, setImportFileErrors] = useState<string[]>([]);
  const [importBackendErrors, setImportBackendErrors] = useState<string[]>([]);
  const [importValidating, setImportValidating] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportSecret, setExportSecret] = useState("");
  const [exportError, setExportError] = useState("");

  const { page, pageSize, setPage, setPageSize } = usePaginationWithURL();
  const { applyFilters, clearFilters, filters } = useFilterWithURL({ form });

  // Use the shared logic from @repo/hooks
  const logic = useShipmentsLogic({ page, pageSize, filters });
  const exportMutation = useExportShipmentsMutation();
  const importMutation = useImportShipmentsMutation();

  const normalizeShipmentFilters = (values: Record<string, any>) => {
    const next = { ...values };

    [
      "query",
      "originalReceiptCode",
      "refShipmentCode",
      "refCustomerCode",
      "wayBill",
      "merchantName",
      "handlingTimeFrom",
      "handlingTimeTo",
    ].forEach((key) => {
      if (typeof next[key] === "string") {
        next[key] = next[key].trim();
      }
    });

    if (dayjs.isDayjs(next.timestampFrom)) {
      next.timestampFrom = next.timestampFrom.startOf("day").toISOString();
    }
    if (dayjs.isDayjs(next.timestampTo)) {
      next.timestampTo = next.timestampTo.endOf("day").toISOString();
    }

    if (next.existsProduct === true) {
      next.existsProduct = "false";
    }

    if (!next.handlingTimeFrom && !next.handlingTimeTo) {
      delete next.typeSearch;
      delete next.cutOffStatus;
      delete next.handlingTimeFrom;
      delete next.handlingTimeTo;
    }

    return next;
  };

  const handleSearch = () => {
    const values = form.getFieldsValue(true);
    applyFilters(normalizeShipmentFilters(values));
  };

  const handleReset = () => {
    form.setFieldsValue({
      cutOffStatus: undefined,
      typeSearch: undefined,
      handlingTimeFrom: "",
      handlingTimeTo: "",
    });
    clearFilters();
  };

  const downloadBlob = (response: any, fallbackName: string) => {
    const disposition = response.headers?.["content-disposition"] || "";
    const fileName =
      disposition.split("filename=")[1]?.replaceAll('"', "") || fallbackName;
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", decodeURIComponent(fileName));
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const getExportErrorTitle = async (error: any) => {
    const data = error?.response?.data;
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        return JSON.parse(text)?.title;
      } catch {
        return undefined;
      }
    }
    return data?.title || error?.title;
  };

  const handleExport = async () => {
    if (!exportSecret) {
      setExportError(t("cartCheckout.incorrect_pin"));
      return;
    }

    try {
      const response = await exportMutation.mutateAsync({
        params: logic.apiParams,
        secret: exportSecret,
      });
      downloadBlob(response, `shipments_${Date.now()}.xlsx`);
      setExportOpen(false);
      setExportSecret("");
      setExportError("");
    } catch (error: any) {
      const title = await getExportErrorTitle(error);
      setExportError(
        title === "invalid_pin" || title === "invalid_password"
          ? t("cartCheckout.incorrect_pin")
          : t("shipments.export_error"),
      );
    }
  };

  const handleImport = () => {
    if (!importFile) {
      notification.error({ message: t("shipments.import_file_required") });
      return;
    }
    if (importServices.length === 0) {
      notification.error({ message: t("shipments.import_services_required") });
      return;
    }
    setImportBackendErrors([]);
    importMutation.mutate(
      { file: importFile, services: importServices },
      {
        onSuccess: (response) => {
          if (
            Array.isArray(response?.errorCells) &&
            response.errorCells.length > 0
          ) {
            setImportBackendErrors(response.errorCells);
            notification.error({ message: t("shipments.import_error") });
            return;
          }
          notification.success({ message: t("shipments.import_success") });
          setImportOpen(false);
          setImportFile(null);
          setImportServices([]);
          setImportFileErrors([]);
          setImportBackendErrors([]);
        },
        onError: (error: any) => {
          const title = error?.response?.data?.title || error?.title;
          notification.error({
            message:
              title === "data_sheet_not_found"
                ? t("shipments.data_sheet_not_found")
                : error?.response?.data?.message ||
                  error?.message ||
                  t("shipments.import_error"),
          });
        },
      },
    );
  };

  const uploadProps = {
    maxCount: 1,
    accept: ".xlsx",
    beforeUpload: async (file: File) => {
      setImportBackendErrors([]);
      const isExcelFile = /\.xlsx$/i.test(file.name);
      if (!isExcelFile) {
        setImportFile(null);
        setImportFileErrors([t("shipments.import_invalid_file")]);
        return Upload.LIST_IGNORE;
      }
      if (file.size > 1024 * 1024 * 3) {
        setImportFile(null);
        setImportFileErrors([t("shipments.import_file_too_large")]);
        return Upload.LIST_IGNORE;
      }

      setImportFile(file);
      setImportValidating(true);
      try {
        const errors = await validateShipmentExcelFile(file, t);
        setImportFileErrors(errors);
      } catch (error: any) {
        setImportFileErrors([
          error?.message === "data_sheet_not_found"
            ? t("shipments.data_sheet_not_found")
            : t("shipments.import_error"),
        ]);
      } finally {
        setImportValidating(false);
      }
      return false;
    },
    onRemove: () => {
      setImportFile(null);
      setImportFileErrors([]);
      setImportBackendErrors([]);
    },
  };

  const closeImportModal = () => {
    setImportOpen(false);
    setImportFile(null);
    setImportServices([]);
    setImportFileErrors([]);
    setImportBackendErrors([]);
  };

  const closeExportModal = () => {
    setExportOpen(false);
    setExportSecret("");
    setExportError("");
  };

  return {
    t,
    form,
    expanded,
    setExpanded,
    page,
    pageSize,
    setPage,
    setPageSize,
    ...logic,
    exportMutation,
    importMutation,
    importOpen,
    setImportOpen,
    importFile,
    importServices,
    setImportServices,
    importFileErrors,
    importBackendErrors,
    importValidating,
    uploadProps,
    closeImportModal,
    handleImport,
    exportOpen,
    setExportOpen,
    exportSecret,
    setExportSecret,
    exportError,
    setExportError,
    handleExport,
    closeExportModal,
    handleSearch,
    handleReset,
    filters,
    applyFilters,
    clearFilters,
  };
};
