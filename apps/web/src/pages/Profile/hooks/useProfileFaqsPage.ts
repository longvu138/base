import { useState } from "react";
import { useFaqsLogic } from "@repo/hooks";

const defaultPageSize = 25;

export const useProfileFaqsPage = () => {
  const [page, setPage] = useState(1);
  const [activeFaq, setActiveFaq] = useState<string | string[]>(["0"]);

  const { faqsData, isFaqsLoading } = useFaqsLogic({
    page,
    pageSize: defaultPageSize,
    filters: {},
  });

  return {
    activeFaq,
    faqs: faqsData?.data || [],
    isLoading: isFaqsLoading,
    page,
    pageSize: defaultPageSize,
    setActiveFaq,
    setPage,
    total: faqsData?.total || 0,
  };
};
