import { Table, Button, Tooltip } from "antd";
import { DownloadOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import {
  TableComponent,
  Pagination,
} from "@repo/ui";
import { ParcelMilestoneSteps } from "../../components/Package/ParcelMilestoneSteps";
import { usePackagesPage } from "./hooks/usePackagesPage";
import { PackageGobizFilter } from "./PackageGobizFilter";
import {
  CopyableText,
  OrderCodeLink,
  PackageCodeCell,
  PackageExportModal,
  PackageStatusTag,
} from "./PackageShared";
import { formatPackageDate } from "./PackageUtils";

const numberFormatter = new Intl.NumberFormat("vi-VN");

function formatCm(value: number | string | null | undefined) {
  const numberValue = Number(value || 0);
  return `${numberFormatter.format(numberValue)} cm`;
}

function formatCm3(value: number | string | null | undefined) {
  if (!value) return "Chưa xác định";
  return `${numberFormatter.format(Number(value))} cm3`;
}

function formatKg(value: number | string | null | undefined) {
  if (!value) return "---";
  return `${numberFormatter.format(Number(value))} kg`;
}

function PackageDimensionsCell({ record }: { record: any }) {
  return (
    <div style={{ textAlign: "left", lineHeight: 1.6 }}>
      <div>
        <span>{formatCm3(record.volumetric)}</span>
        <Tooltip title="Dài × Rộng × Cao">
          <QuestionCircleOutlined
            style={{ marginLeft: 8, color: "#bfbfbf", cursor: "help" }}
          />
        </Tooltip>
      </div>
      <div style={{ color: "#8c8c8c", fontWeight: 600 }}>
        {formatCm(record.length)}×{formatCm(record.width)}×{formatCm(record.height)}
      </div>
    </div>
  );
}

export const PackageStyleDefault = () => {
  const pageState = usePackagesPage();
  const {
    form,
    page,
    pageSize,
    setPage,
    setPageSize,
    packageData,
    isPackageLoading,
    filters,
    handleSearch,
    handleReset,
    handleExportOpen,
    isExporting,
    navigateToOrder,
    packageStatusData
  } = pageState;

  const columns = [
    {
      title: "Mã kiện",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <PackageCodeCell code={text} />,
    },
    {
      title: "Mã đơn",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (_: string, record: any) => (
        <OrderCodeLink record={record} onNavigate={navigateToOrder} />
      ),
    },
    {
      title: "Mã vận đơn",
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      render: (text: string) => <CopyableText text={text} />,
    },
    {
      title: "Cân nặng",
      dataIndex: "actualWeight",
      key: "actualWeight",
      render: (val: number) => formatKg(val),
    },
    {
      title: "Thông số",
      key: "dimensions",
      render: (_: any, record: any) => <PackageDimensionsCell record={record} />,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatPackageDate,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "right" as const,
      render: (status: any) => <PackageStatusTag status={status} statusData={packageStatusData || []} />,
    },
  ];

  return (
    <div className="min-h-screen bg-layout p-4 space-y-4">
      <PackageGobizFilter
        form={form}
        statusData={packageStatusData || []}
        filters={filters}
        handleSearch={handleSearch}
        handleReset={handleReset}
        handleExportOpen={handleExportOpen}
        isExporting={isExporting}
      />

      <TableComponent
        title="Danh sách kiện hàng"
        totalCount={packageData?.total}
        loading={isPackageLoading}
        extra={
          handleExportOpen ? (
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportOpen}
              loading={isExporting}
            >
              Xuất Excel
            </Button>
          ) : null
        }
      >
        <Table
          columns={columns}
          dataSource={packageData?.data || []}
          pagination={false}
          rowKey="code"
          size="middle"
          expandable={{
            expandedRowRender: (record) => (
              <ParcelMilestoneSteps
                packageCode={record.code}
                isShipment={!!record.isShipment}
                currentStatus={typeof record.status === "object" ? record.status?.code : record.status}
              />
            ),
            expandRowByClick: true,
          }}
          rowClassName="cursor-pointer"
        />
      </TableComponent>

      <Pagination
        current={page}
        pageSize={pageSize}
        total={packageData?.total || 0}
        onChange={(p, s) => {
          setPage(p);
          if (s !== pageSize) setPageSize(s);
        }}
      />
      <PackageExportModal page={pageState} />
    </div>
  );
};
