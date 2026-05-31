export const getDeliveryNote = (record: any) => record?.delivery_note || {};

export const getDeliveryNoteRowKey = (record: any) => {
  const note = getDeliveryNote(record);
  return note.id || note.code;
};

export const getDeliveryNoteTrackingBills = (record: any): string[] =>
  record?.tracking_bills || getDeliveryNote(record).tracking_bills || [];

export const getDeliveryNoteAddress = (record: any) => {
  const note = getDeliveryNote(record);
  return note.customer_receiver || note.customer_address
    ? `${note.customer_receiver || "---"} - ${note.customer_address || "---"}`
    : "---";
};

export const getDeliveryNotePageTotals = (rows: any[] = []) =>
  rows.reduce(
    (totals, item) => {
      const note = getDeliveryNote(item);
      return {
        totalWeight: totals.totalWeight + Number(note.total_weight || 0),
        totalCollect: totals.totalCollect + Number(note.amount_collect || 0),
      };
    },
    { totalWeight: 0, totalCollect: 0 },
  );

export const groupDeliveryNotePackagesByOrder = (items: any[] = []) => {
  const groups: Record<string, any> = {};

  items.forEach((item) => {
    const order = item.order || {};
    const key = order.code || item?.package?.orderCode || "UNKNOWN";

    if (!groups[key]) {
      groups[key] = { ...order, code: key, packages: [] };
    }

    if (item.package) {
      groups[key].packages.push(item.package);
    }
  });

  return Object.values(groups);
};
