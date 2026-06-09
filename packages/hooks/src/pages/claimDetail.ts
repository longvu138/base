import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';
import { useTranslation } from '@repo/i18n';
import {
    useArchiveClaimMutation,
    useClaimDetailQuery,
    useClaimHistoriesQuery,
    useClaimStatusesQuery,
    useUpdateClaimRatingMutation,
} from '../useClaimHooks';

const asArray = (value: any) => (Array.isArray(value) ? value : []);

const getStateCode = (detail: any) => detail?.publicStateNewView?.code || detail?.publicState || 'NEW';

export const useClaimDetailPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { code = '' } = useParams();
    const detailQuery = useClaimDetailQuery(code);
    const historiesQuery = useClaimHistoriesQuery(code);
    const statusesQuery = useClaimStatusesQuery();
    const archiveMutation = useArchiveClaimMutation(code);
    const ratingMutation = useUpdateClaimRatingMutation(code);

    const detail = detailQuery.data || {};
    const currentStateCode = getStateCode(detail);
    const isRefund = detail?.publicStateNewView?.code === 'REFUND';
    const canArchive =
        detail &&
        !detail.archived &&
        ['REFUND', 'REJECT'].includes(String(detail?.publicStateNewView?.code || ''));

    const steps = useMemo(() => {
        const histories = asArray(historiesQuery.data);
        return asArray(statusesQuery.data)
            .map((state: any) => ({
                ...state,
                timestamp: histories.find((item: any) => item.state === state.code)?.timestamp,
            }))
            .sort((a: any, b: any) => Number(a.sort || 0) - Number(b.sort || 0));
    }, [historiesQuery.data, statusesQuery.data]);

    const currentStep = Math.max(
        0,
        steps.findIndex((item: any) => item.code === currentStateCode),
    );

    const archiveClaim = async () => {
        try {
            await archiveMutation.mutateAsync();
            message.success(t('message.success'));
        } catch (error: any) {
            message.error(error?.message || t('message.fail'));
        }
    };

    const updateRating = async (payload: { rating: number; comment?: string }) => {
        try {
            await ratingMutation.mutateAsync(payload);
            message.success(t('message.success'));
        } catch (error: any) {
            message.error(error?.message || t('message.fail'));
        }
    };

    return {
        t,
        code,
        detail,
        isLoading: detailQuery.isLoading || statusesQuery.isLoading || historiesQuery.isLoading,
        isError: detailQuery.isError,
        steps,
        currentStep,
        isRefund,
        canArchive,
        archiveClaim,
        isArchiving: archiveMutation.isPending,
        updateRating,
        isUpdatingRating: ratingMutation.isPending,
        goBack: () => navigate(-1),
    };
};
