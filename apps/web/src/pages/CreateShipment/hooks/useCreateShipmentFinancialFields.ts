import { useState } from "react";

export const useCreateShipmentFinancialFields = () => {
  const [financialFieldValues, setFinancialFieldValues] = useState<Record<string, any>>({});
  const [editingFinancialFields, setEditingFinancialFields] = useState<Record<string, boolean>>({
    expectedPackages: true,
    refTrackingNumbers: true,
    refShipmentCode: true,
    refCustomerCode: true,
    remark: true,
    note: false,
  });

  const isEmptyField = (value: any) =>
    value === undefined || value === null || String(value).trim() === "";

  const setFinancialFieldEditing = (name: string, value: boolean) => {
    setEditingFinancialFields((current) => ({ ...current, [name]: value }));
  };

  const finishFinancialFieldEditing = (name: string, value: any) => {
    setFinancialFieldValues((current) => ({ ...current, [name]: value }));
    setFinancialFieldEditing(name, isEmptyField(value));
  };

  return {
    editingFinancialFields,
    financialFieldValues,
    finishFinancialFieldEditing,
    isEmptyField,
    setFinancialFieldEditing,
    setFinancialFieldValues,
  };
};
