import type { useDeliveryNotesMobileModel } from "../model/useDeliveryNotesMobileModel";
import type { useDeliveryNotesModel } from "../model/useDeliveryNotesModel";

export type DeliveryNotesModel = ReturnType<typeof useDeliveryNotesModel>;
export type DeliveryNotesMobileModel = ReturnType<
  typeof useDeliveryNotesMobileModel
>;
