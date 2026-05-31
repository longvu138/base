import dayjs from "dayjs";

export type DeliveryNoteFilters = Record<string, any>;

const toStartOfDayIso = (value: unknown) =>
  dayjs.isDayjs(value) ? value.startOf("day").toISOString() : value;

const toEndOfDayIso = (value: unknown) =>
  dayjs.isDayjs(value) ? value.endOf("day").toISOString() : value;

export const normalizeDeliveryNoteFilters = (
  values: DeliveryNoteFilters,
): DeliveryNoteFilters => {
  const next = { ...values };

  if (next.exportedAtRange) {
    next.exportedAtFrom = next.exportedAtRange[0]?.toISOString();
    next.exportedAtTo = next.exportedAtRange[1]?.toISOString();
    delete next.exportedAtRange;
  }

  next.exportedAtFrom = toStartOfDayIso(next.exportedAtFrom);
  next.exportedAtTo = toEndOfDayIso(next.exportedAtTo);

  return next;
};

export const buildDeliveryNoteApiParams = ({
  page,
  pageSize,
  filters,
}: {
  page: number;
  pageSize: number;
  filters: DeliveryNoteFilters;
}) => ({
  page: page - 1,
  size: pageSize,
  sort: "exported_at:desc",
  ...normalizeDeliveryNoteFilters(filters),
});
