import React from 'react';
import { Spin } from 'antd';


export interface StatCardProps {
    title: string;
    value: string | number | React.ReactNode;
    icon?: React.ReactNode;
    description?: React.ReactNode;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    variant?: 'default' | 'dark' | 'clean';
    className?: string;
    action?: React.ReactNode;
    colSpan?: number;
}

export interface ChartWidgetProps {
    title: string;
    description?: string;
    variant?: 'dark' | 'light';
    type?: 'bar' | 'donut';
    colSpan?: number;
}

export interface DashboardLayoutProps {
    children: React.ReactNode;
    loading?: boolean;
    className?: string;
    title?: React.ReactNode;
    actions?: React.ReactNode;
}

export interface DashboardSectionProps {
    title?: string;
    extra?: React.ReactNode;
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4; // Responsive columns configuration
    className?: string;
}


const getGridClass = (cols: number = 4) => {
    switch (cols) {
        case 1: return 'grid-cols-1';
        case 2: return 'grid-cols-1 md:grid-cols-2';
        case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
        default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
};



const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    description,
    trend,
    variant = 'default',
    className = '',
    action,
    colSpan
}) => {

    const renderContent = () => {

        if (variant === 'dark') {
            return (
                <div className={`bg-filter dark:bg-filter-dark rounded-lg p-4 border border-gray-800 h-full ${className}`}>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wide">
                            {icon && <span className="text-gray-400">{icon}</span>}
                            {title}
                        </div>
                        {action}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
                        {description && <div className="text-xs text-gray-500">{description}</div>}
                    </div>
                    {trend && (
                        <div className={`text-xs mt-2 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {trend.isPositive ? '↑' : '↓'} {trend.value} <span className="text-gray-600">so với tháng trước</span>
                        </div>
                    )}
                </div>
            );
        }


        if (variant === 'clean') {
            return (
                <div className={`bg-filter dark:bg-filter-dark rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full ${className}`}>
                    <div className="flex items-start gap-4 h-full">
                        {icon && (
                            <div className="p-3 bg-primary/10 rounded-full text-primary h-fit">
                                {icon}
                            </div>
                        )}
                        <div className="flex-1 flex flex-col h-full">
                            <div className="text-sm text-gray-500 mb-1">{title}</div>
                            <div className="text-2xl font-bold text-primary">{value}</div>
                            {description && <div className="mt-auto pt-2">{description}</div>}
                        </div>
                        {action && <div>{action}</div>}
                    </div>
                </div>
            );
        }

        // Default
        return (
            <div className={`bg-filter dark:bg-filter-dark p-4 rounded-lg shadow border border-gray-200 h-full ${className}`}>
                <div className="text-gray-500 text-sm">{title}</div>
                <div className="text-xl font-bold">{value}</div>
            </div>
        );
    };

    return (
        <div style={colSpan ? { gridColumn: `span ${colSpan} / span ${colSpan}` } : undefined}>
            {renderContent()}
        </div>
    );
};

const ChartWidget: React.FC<ChartWidgetProps> = ({
    title,
    variant = 'dark',
    type = 'bar',
    colSpan
}) => {

    const isDark = variant === 'dark';
    const bgColor = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const subTextColor = isDark ? 'text-gray-400' : 'text-gray-500';
    const borderColor = isDark ? 'border-gray-800' : 'border-gray-100';

    return (
        <div style={colSpan ? { gridColumn: `span ${colSpan} / span ${colSpan}` } : undefined} className="h-full">
            <div className={`${bgColor} border ${borderColor} rounded-lg p-5 h-full min-h-[300px]`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`font-semibold text-sm ${textColor}`}>{title}</h3>
                    <div className={`text-xs ${subTextColor} border ${borderColor} rounded px-2 py-1`}>
                        6 tháng gần nhất
                    </div>
                </div>

                <div className="h-[200px] w-full flex items-end gap-2 text-xs text-center text-gray-500">
                    <div className="w-full h-full flex items-center justify-center bg-primary/5 rounded border border-dashed border-primary/20 text-primary">
                        Chart: {type} ({variant})
                    </div>
                </div>
            </div>
        </div>
    );
};

const Layout: React.FC<DashboardLayoutProps> = ({
    children,
    loading = false,
    className = "",
    title,
    actions
}) => {
    return (
        <Spin spinning={loading} tip="Loading Dashboard...">
            <div className={`p-6 max-w-7xl mx-auto space-y-8 ${className}`}>

                {(title || actions) && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        {title && <h1 className="text-2xl font-bold text-primary">{title}</h1>}
                        {actions && <div className="flex gap-2">{actions}</div>}
                    </div>
                )}
                {children}
            </div>
        </Spin>
    );
};

const Section: React.FC<DashboardSectionProps> = ({
    title,
    extra,
    children,
    columns = 4,
    className = ""
}) => {
    return (
        <div className={`space-y-4 ${className}`}>

            {(title || extra) && (
                <div className="flex items-center justify-between">
                    {title && <h3 className="text-lg font-semibold text-primary border-l-4 border-primary pl-3">{title}</h3>}
                    {extra && <div className="text-sm">{extra}</div>}
                </div>
            )}


            <div className={`grid gap-6 ${getGridClass(columns)}`}>
                {children}
            </div>
        </div>
    );
};



interface DashboardComponent extends React.FC<DashboardLayoutProps> {
    Section: typeof Section;
    StatCard: typeof StatCard;
    Chart: typeof ChartWidget;
}

const DashboardRoot: any = Layout; // Main export is Layout
DashboardRoot.Section = Section;
DashboardRoot.StatCard = StatCard;
DashboardRoot.Chart = ChartWidget;

export const Dashboard = DashboardRoot as DashboardComponent;
