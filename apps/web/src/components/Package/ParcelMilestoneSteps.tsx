import { Spin, Empty } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    useParcelStatusesQuery,
    useParcelMilestonesQuery,
} from '@repo/hooks';
import './ParcelMilestoneSteps.css';

const NEGATIVE_CODES = new Set(['MIA', 'INACTIVE', 'RETURN']);

interface Props {
    parcelCode: string;
}

export const ParcelMilestoneSteps = ({ parcelCode }: Props) => {
    const { data: milestones, isLoading } = useParcelMilestonesQuery(parcelCode);
    const { data: parcelStatuses } = useParcelStatusesQuery();

    if (isLoading) {
        return (
            <div className="parcel-steps-wrapper parcel-steps-loading">
                <Spin size="small" />
                <span>Đang tải hành trình...</span>
            </div>
        );
    }

    if (!milestones || !parcelStatuses) {
        return (
            <div className="parcel-steps-wrapper parcel-steps-empty">
                <Empty description="Không có dữ liệu hành trình" imageStyle={{ height: 40 }} />
            </div>
        );
    }

    /* ── Dedup by position, sort asc ── */
    const seen = new Set<number>();
    const sorted = [...parcelStatuses]
        .sort((a: any, b: any) => a.position - b.position)
        .filter((s: any) => {
            if (seen.has(s.position)) return false;
            seen.add(s.position);
            return true;
        });

    /* ── Map reached milestones ── */
    const milestoneMap = (milestones as any[]).reduce((acc: any, m: any) => {
        acc[m.status] = m;
        return acc;
    }, {});

    const reachedCodes = new Set(Object.keys(milestoneMap));
    const currentStatus = sorted.reduce<any>((cur, s) =>
        reachedCodes.has(s.code) ? s : cur, null,
    );
    const isNeg = currentStatus && NEGATIVE_CODES.has(currentStatus.code);
    const currentColor = isNeg ? '#dc2626' : (currentStatus?.color ?? '#6366f1');

    return (
        <div className="parcel-steps-wrapper">
            {/* Current status badge */}
            {currentStatus && (
                <div className="parcel-badge-row">
                    <span className="parcel-badge" style={{ background: currentColor }}>
                        <span className="parcel-badge-pulse" />
                        {currentStatus.name}
                    </span>
                    {milestoneMap[currentStatus.code]?.handlingTime > 0 && (
                        <span className="parcel-badge-note">
                            {milestoneMap[currentStatus.code].handlingTime} ngày xử lý
                        </span>
                    )}
                </div>
            )}

            {/* Timeline — full width flex */}
            <div className="parcel-timeline">
                {sorted.map((status: any, idx: number) => {
                    const milestone = milestoneMap[status.code];
                    const reached = !!milestone;
                    const isCurrent = status.code === currentStatus?.code;
                    const negStep = NEGATIVE_CODES.has(status.code);
                    const color = negStep ? '#dc2626' : (status.color ?? '#6366f1');
                    const prevReached = idx > 0 && !!milestoneMap[sorted[idx - 1]?.code];

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
                                        background: idx === sorted.length - 1
                                            ? 'transparent'
                                            : (reached ? color : 'var(--track-empty)'),
                                        opacity: idx === sorted.length - 1 ? 0 : 1,
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
                                {milestone ? (
                                    <>
                                        <span style={{ color: isCurrent ? color : undefined, fontWeight: isCurrent ? 700 : undefined }}>
                                            {dayjs(milestone.timestamp).format('HH:mm')}
                                        </span>
                                        <span>{dayjs(milestone.timestamp).format('DD/MM/YY')}</span>
                                    </>
                                ) : (
                                    <span className="parcel-step-time--empty">—</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
