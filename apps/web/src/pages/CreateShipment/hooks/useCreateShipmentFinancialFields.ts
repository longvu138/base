import { useState } from "react";

export const useCreateShipmentFinancialFields = () => {
  const [editingFinancialFields, setEditingFinancialFields] = useState<Record<string, boolean>>({});

  const isEmptyField = (value: any) =>
    value === undefined || value === null || String(value).trim() === "";

  const setFinancialFieldEditing = (name: string, value: boolean) => {
    setEditingFinancialFields((current) => ({ ...current, [name]: value }));
  };

  const finishFinancialFieldEditing = (name: string, value: any) => {
    setFinancialFieldEditing(name, isEmptyField(value));
  };

  return {
    editingFinancialFields,
    finishFinancialFieldEditing,
    isEmptyField,
    setFinancialFieldEditing,
  };
};
