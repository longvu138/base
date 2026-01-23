import { Card, Typography, Divider, Timeline } from 'antd';
import {
    CheckCircleOutlined,
    MobileOutlined,
    ThunderboltOutlined,
    SafetyOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function AboutPage() {
    return (
        <div className="py-4">
            <Card className="shadow-lg mb-4">
                <Title level={3}>About Mobile App</Title>
                <Divider />

                <Paragraph className="text-base">
                    This mobile web application is part of a Turbo monorepo,
                    optimized for mobile devices with touch-friendly controls
                    and responsive design.
                </Paragraph>
            </Card>

            <Card className="shadow-lg mb-4">
                <Title level={4}>
                    <MobileOutlined className="mr-2 text-blue-600" />
                    Mobile Optimizations
                </Title>
                <Timeline
                    className="mt-4"
                    items={[
                        {
                            dot: <CheckCircleOutlined className="text-green-500" />,
                            children: (
                                <>
                                    <Paragraph className="!mb-1 font-semibold">Touch Targets</Paragraph>
                                    <Paragraph className="text-sm text-gray-600">
                                        All interactive elements are at least 44px for easy tapping
                                    </Paragraph>
                                </>
                            ),
                        },
                        {
                            dot: <CheckCircleOutlined className="text-green-500" />,
                            children: (
                                <>
                                    <Paragraph className="!mb-1 font-semibold">Responsive Layout</Paragraph>
                                    <Paragraph className="text-sm text-gray-600">
                                        Adapts seamlessly from mobile to tablet to desktop
                                    </Paragraph>
                                </>
                            ),
                        },
                        {
                            dot: <CheckCircleOutlined className="text-green-500" />,
                            children: (
                                <>
                                    <Paragraph className="!mb-1 font-semibold">Drawer Navigation</Paragraph>
                                    <Paragraph className="text-sm text-gray-600">
                                        Space-efficient menu system for mobile screens
                                    </Paragraph>
                                </>
                            ),
                        },
                        {
                            dot: <CheckCircleOutlined className="text-green-500" />,
                            children: (
                                <>
                                    <Paragraph className="!mb-1 font-semibold">Optimized Typography</Paragraph>
                                    <Paragraph className="text-sm text-gray-600">
                                        Larger, more readable fonts for mobile viewing
                                    </Paragraph>
                                </>
                            ),
                        },
                    ]}
                />
            </Card>

            <Card className="shadow-lg mb-4 bg-gradient-to-br from-purple-50 to-pink-50">
                <Title level={4}>
                    <ThunderboltOutlined className="mr-2 text-purple-600" />
                    Performance
                </Title>
                <Paragraph>
                    Built with Vite for blazing-fast development and optimized production builds.
                    Features include:
                </Paragraph>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Lightning-fast HMR (Hot Module Replacement)</li>
                    <li>Optimized bundle size</li>
                    <li>Lazy loading and code splitting</li>
                    <li>Efficient caching with React Query</li>
                </ul>
            </Card>

            <Card className="shadow-lg bg-gradient-to-br from-green-50 to-teal-50">
                <Title level={4}>
                    <SafetyOutlined className="mr-2 text-green-600" />
                    Architecture
                </Title>
                <Paragraph>
                    Part of a Turbo monorepo structure that enables:
                </Paragraph>
                <div className="space-y-2">
                    <div className="flex items-start">
                        <span className="mr-2">📦</span>
                        <Paragraph className="!mb-0">
                            Shared packages and components across apps
                        </Paragraph>
                    </div>
                    <div className="flex items-start">
                        <span className="mr-2">🔄</span>
                        <Paragraph className="!mb-0">
                            Incremental builds with intelligent caching
                        </Paragraph>
                    </div>
                    <div className="flex items-start">
                        <span className="mr-2">⚡</span>
                        <Paragraph className="!mb-0">
                            Parallel task execution for faster builds
                        </Paragraph>
                    </div>
                    <div className="flex items-start">
                        <span className="mr-2">🛠️</span>
                        <Paragraph className="!mb-0">
                            Consistent tooling across all applications
                        </Paragraph>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default AboutPage;
