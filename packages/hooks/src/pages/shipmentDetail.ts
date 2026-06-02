import { useNavigate, useParams } from "react-router-dom";
import {
  useShipmentDetailQuery,
  useShipmentStatusesQuery,
} from "../useShipmentHooks";

export const useShipmentDetailPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const shipmentQuery = useShipmentDetailQuery(code || "");
  const statusesQuery = useShipmentStatusesQuery();

  const goToShipments = () => {
    navigate("/shipments");
  };

  return {
    code: code || "",
    shipment: shipmentQuery.data,
    statusData: statusesQuery.data,
    isLoading: shipmentQuery.isLoading,
    isError: shipmentQuery.isError,
    goToShipments,
  };
};
