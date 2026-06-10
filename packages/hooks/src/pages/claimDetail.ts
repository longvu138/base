import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from '@repo/i18n';
import { moneyCeil, moneyFormat, quantityFormat } from '@repo/util';
import {
    useArchiveClaimMutation,
    useClaimDetailQuery,
    useClaimHistoriesQuery,
    useClaimStatusesQuery,
    useUpdateClaimRatingMutation,
} from '../useClaimHooks';

const asArray = (value: any) => (Array.isArray(value) ? value : []);

const getStateCode = (detail: any) => detail?.publicStateNewView?.code || detail?.publicState || 'NEW';

const getRelatedPath = (detail: any) => {
    const ticketType = String(detail?.ticketType || '').toUpperCase();
    return ticketType === 'SHIPMENT'
        ? `/shipments/${detail?.relatedOrder}`
        : `/orders/${detail?.relatedOrder}`;
};

const getClaimNameModel = (detail: any) => {
    const name = String(detail?.name || '');
    const relatedOrder = detail?.relatedOrder;

    if (!name || !relatedOrder || !name.includes(relatedOrder)) {
        return {
            text: name,
            relatedOrder: '',
            relatedPath: '',
            before: name,
            after: '',
            hasRelatedLink: false,
        };
    }

    const [before, after] = name.split(relatedOrder);
    return {
        text: name,
        relatedOrder,
        relatedPath: getRelatedPath(detail),
        before,
        after,
        hasRelatedLink: true,
    };
};

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

    const view = useMemo(() => {
        const status = detail.publicStateNewView || {};
        const attachments = asArray(detail.attachments);
        const hasClaimContent =
            Boolean(detail.reasonView && detail.description) || attachments.length > 0;
        const quantityMissing =
            detail.notReceived === 0
                ? t('ticket_detail.all')
                : quantityFormat(detail.notReceived);

        return {
            status,
            attachments,
            hasClaimContent,
            claimName: getClaimNameModel(detail),
            metrics: [
                {
                    key: 'reason',
                    label: t('ticket_detail.reason'),
                    value: detail.reasonView?.name || '---',
                    visible: true,
                },
                {
                    key: 'solution',
                    label: t('ticket_detail.solution'),
                    value: detail.solutionView?.name || '---',
                    visible: true,
                },
                {
                    key: 'demain',
                    label: t('ticket_detail.demain'),
                    value: moneyFormat(moneyCeil(detail.suggest)),
                    visible: true,
                },
                {
                    key: 'quantity_missing',
                    label: t('ticket_detail.quantity_missing'),
                    value: quantityMissing,
                    visible: Boolean(detail.reasonView),
                },
                {
                    key: 'refund_or_suggestion',
                    label: isRefund ? t('ticket_detail.refund') : t('ticket_detail.suggestion'),
                    value: moneyFormat(
                        moneyCeil(isRefund ? detail.totalRefund : detail.estimatedRefundValue),
                    ),
                    visible: true,
                },
            ].filter((item) => item.visible),
            stepItems: steps.map((item: any) => ({
                title: item.description || item.name,
                description: item.timestamp ? dayjs(item.timestamp).format('HH:mm DD/MM/YYYY') : '',
            })),
        };
    }, [detail, isRefund, steps, t]);

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
        view,
        isRefund,
        canArchive,
        archiveClaim,
        isArchiving: archiveMutation.isPending,
        updateRating,
        isUpdatingRating: ratingMutation.isPending,
        goBack: () => navigate(-1),
    };
};
