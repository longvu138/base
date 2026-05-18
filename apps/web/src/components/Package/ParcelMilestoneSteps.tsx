import { Spin, Empty } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    usePackageMilestonesQuery,
    usePackageStatusesQuery,
    useParcelStatusesQuery,
    useParcelMilestonesQuery,
} from '@repo/hooks';
import './ParcelMilestoneSteps.css';

const NEGATIVE_CODES = new Set(['MIA', 'INACTIVE', 'RETURN']);

interface Props {
    parcelCode?: string;
    packageCode?: string;
    isShipment?: boolean;
    currentStatus?: string;
}

export const ParcelMilestoneSteps = ({
    parcelCode,
    packageCode,
    isShipment = false,
    currentStatus,
}: Props) => {
    const code = parcelCode || packageCode || '';
    const { data: parcelMilestones, isLoading: isParcelMilestonesLoading } = useParcelMilestonesQuery(code, !!code && isShipment);
    const { data: packageMilestones, isLoading: isPackageMilestonesLoading } = usePackageMilestonesQuery(code, !!code && !isShipment);
    const { data: parcelStatuses } = useParcelStatusesQuery();
    const { data: packageStatuses } = usePackageStatusesQuery();
    const milestones = isShipment ? parcelMilestones : packageMilestones;
    const statuses = isShipment ? parcelStatuses : packageStatuses;
    const isLoading = isShipment ? isParcelMilestonesLoading : isPackageMilestonesLoading;

    if (isLoading) {
        return (
            <div className="parcel-steps-wrapper parcel-steps-loading">
                <Spin size="small" />
                <span>Đang tải hành trình...</span>
            </div>
        );
    }

    if (!milestones || !statuses) {
        return (
            <div className="parcel-steps-wrapper parcel-steps-empty">
                <Empty description="Không có dữ liệu hành trình" imageStyle={{ height: 40 }} />
            </div>
        );
    }

    /* ── Dedup by position, sort asc ── */
    const seen = new Set<number>();
    const sorted = [...statuses]
        .sort((a: any, b: any) => a.position - b.position)
        .filter((s: any) => {
            if (seen.has(s.position)) return false;
            seen.add(s.position);
            return true;
        });

    /* ── Map reached milestones ── */
    const milestoneMap = (milestones as any[]).reduce((acc: any, m: any) => {
        acc[m.status] = [...(acc[m.status] || []), m];
        return acc;
    }, {});

    const currentStatusMeta = sorted.find((status: any) => status.code === currentStatus);
    const isNegativeEnd = currentStatusMeta?.negativeEnd || NEGATIVE_CODES.has(currentStatus || '');
    const latestPositiveMilestone = [...(milestones as any[])]
        .filter((item) => item.status !== currentStatus)
        .sort((a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf())[0];
    const latestPositiveIndex = latestPositiveMilestone
        ? sorted.findIndex((status: any) => status.code === latestPositiveMilestone.status)
        : -1;
    const visibleStatuses = isNegativeEnd
        ? [
            ...sorted
                .filter((status: any) => !status.negativeEnd)
                .slice(0, Math.max(latestPositiveIndex + 1, 0)),
            currentStatusMeta,
        ].filter(Boolean)
        : sorted.filter((status: any) => !status.negativeEnd);
    const visibleCurrentIndex = isNegativeEnd
        ? visibleStatuses.length - 1
        : visibleStatuses.findIndex((status: any) => status.code === currentStatus);
    const currentColor = isNegativeEnd ? '#dc2626' : (currentStatusMeta?.color ?? '#6366f1');

    return (
        <div className="parcel-steps-wrapper">
            {/* Current status badge */}
            {currentStatusMeta && (
                <div className="parcel-badge-row">
                    <span className="parcel-badge" style={{ background: currentColor }}>
                        <span className="parcel-badge-pulse" />
                        {currentStatusMeta.name}
                    </span>
                </div>
            )}

            {/* Timeline — full width flex */}
            <div className="parcel-timeline">
                {visibleStatuses.map((status: any, idx: number) => {
                    const statusMilestones = (milestoneMap[status.code] || [])
                        .sort((a: any, b: any) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf());
                    const reached = idx <= visibleCurrentIndex;
                    const isCurrent = idx === visibleCurrentIndex;
                    const negStep = status.negativeEnd || NEGATIVE_CODES.has(status.code);
                    const color = negStep ? '#dc2626' : (status.color ?? '#6366f1');
                    const prevReached = idx > 0 && idx - 1 <= visibleCurrentIndex;

                    return (
                        <div key={status.code} className="parcel-step">
                            {/* Connector row: line — dot — line */}
                            <div className="parcel-step-track">
                                {/* Left line */}
                                <div
                                    className="parcel-track-line"
                                    style={{
                                        background: idx === 0
                                            ? 'transparent'
                                            : (prevReached && reached ? color : 'var(--track-empty)'),
                                        opacity: idx === 0 ? 0 : 1,
                                    }}
                                />

                                {/* Dot */}
                                {isCurrent ? (
                                    <span className="parcel-dot parcel-dot-current" style={{ background: color, boxShadow: `0 0 0 3px ${color}30` }}>
                                        <span className="parcel-dot-pulse" />
                                    </span>
                                ) : reached ? (
                                    <span className="parcel-dot parcel-dot-done" style={{ background: color }}>
                                        <CheckOutlined style={{ fontSize: 7, color: '#fff', lineHeight: 1 }} />
                                    </span>
                                ) : (
                                    <span className="parcel-dot parcel-dot-wait" />
                                )}

                                {/* Right line */}
                                <div
                                    className="parcel-track-line"
                                    style={{
                                        background: idx === visibleStatuses.length - 1
                                            ? 'transparent'
                                            : (idx < visibleCurrentIndex ? color : 'var(--track-empty)'),
                                        opacity: idx === visibleStatuses.length - 1 ? 0 : 1,
                                    }}
                                />
                            </div>

                            {/* Label */}
                            <div
                                className={`parcel-step-label${isCurrent ? ' parcel-step-label--current' : reached ? ' parcel-step-label--done' : ' parcel-step-label--wait'}`}
                                style={isCurrent ? { color } : undefined}
                            >
                                {status.name}
                            </div>

                            {/* Timestamp */}
                            <div className="parcel-step-time">
                                {statusMilestones.length > 0 ? (
                                    <>
                                        {statusMilestones.map((item: any, index: number) => (
                                            <span
                                                key={`${status.code}-${item.timestamp}-${index}`}
                                                style={{ color: isCurrent && index === 0 ? color : undefined, fontWeight: isCurrent && index === 0 ? 700 : undefined }}
                                            >
                                                {dayjs(item.timestamp).format('HH:mm DD/MM/YY')}
                                            </span>
                                        ))}
                                    </>
                                ) : (
                                    <span className="parcel-step-time--empty">—</span>
                                )}
                            </div>
                            {isCurrent && <span className='!text-xs text-black italic text-center'>({milestoneMap[currentStatusMeta.code][0].handlingTime} ngày)</span>}

                        </div>
                    );
                })}
            </div>
        </div>
    );
};
