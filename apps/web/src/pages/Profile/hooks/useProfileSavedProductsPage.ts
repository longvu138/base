import { useMemo, useState } from "react";
import { App, Form } from "antd";
import type { Dayjs } from "dayjs";
import {
  useDeleteWishlistItemMutation,
  useUpdateWishlistItemMutation,
  useWishlistQuery,
} from "@repo/hooks";

const defaultPageSize = 5;

type SavedProductsFilters = {
  query?: string;
  createdFrom?: Dayjs;
  createdTo?: Dayjs;
};

const cleanFilters = (values: SavedProductsFilters) => ({
  query: values.query?.trim() || undefined,
  createdFrom: values.createdFrom,
  createdTo: values.createdTo,
});

export const useProfileSavedProductsPage = (t: (key: string) => string) => {
  const [form] = Form.useForm();
  const { notification } = App.useApp();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SavedProductsFilters>({});
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [editingIds, setEditingIds] = useState<Record<string, boolean>>({});

  const apiParams = useMemo(() => {
    const params: Record<string, any> = {
      page: page - 1,
      size: defaultPageSize,
      sort: "createdAt:desc",
    };
    if (filters.query) params.query = filters.query;
    if (filters.createdFrom) {
      params.createdFrom = filters.createdFrom.startOf("day").toISOString();
    }
    if (filters.createdTo) {
      params.createdTo = filters.createdTo.endOf("day").toISOString();
    }
    return params;
  }, [filters, page]);

  const { data, isLoading } = useWishlistQuery(apiParams);
  const deleteMutation = useDeleteWishlistItemMutation(apiParams);
  const updateMutation = useUpdateWishlistItemMutation(apiParams);

  const handleSearch = () => {
    setPage(1);
    setFilters(cleanFilters(form.getFieldsValue()));
  };

  const handleReset = () => {
    form.resetFields();
    setPage(1);
    setFilters({});
  };

  const startEdit = (item: any) => {
    setEditingIds((current) => ({ ...current, [item.id]: true }));
    setEditingNotes((current) => ({ ...current, [item.id]: item.note || "" }));
  };

  const updateNoteDraft = (id: string | number, value: string) => {
    setEditingNotes((current) => ({ ...current, [id]: value }));
  };

  const saveNote = async (item: any) => {
    const nextNote = editingNotes[item.id] ?? "";
    if ((item.note || "") === nextNote) {
      setEditingIds((current) => ({ ...current, [item.id]: false }));
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: item.id,
        data: { ...item, note: nextNote },
      });
      setEditingIds((current) => ({ ...current, [item.id]: false }));
      notification.success({ message: t("userProfile.successfully_save") });
    } catch (error: any) {
      notification.error({
        message: error?.response?.data?.message || error?.message || t("common.error"),
      });
    }
  };

  const deleteItem = async (id: string | number) => {
    try {
      await deleteMutation.mutateAsync(id);
      notification.success({ message: t("message.delete_success") });
    } catch (error: any) {
      notification.error({
        message: error?.response?.data?.message || error?.message || t("common.error"),
      });
    }
  };

  return {
    apiParams,
    deleteItem,
    deletingId: deleteMutation.variables,
    editingIds,
    editingNotes,
    form,
    handleReset,
    handleSearch,
    isLoading,
    isSaving: updateMutation.isPending,
    page,
    pageSize: defaultPageSize,
    products: data?.data || [],
    saveNote,
    setPage,
    startEdit,
    total: data?.total || 0,
    updateNoteDraft,
  };
};
