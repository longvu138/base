import { Card, Button, Space, Typography, Alert, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { RocketOutlined, MobileOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function HomePage() {
    // Example React Query usage
    const { data, isLoading, error } = useQuery({
        queryKey: ['mobile-example'],
        queryFn: async () => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { message: 'Mobile data loaded successfully!' };
        },
    });

    return (
        <div className="py-4">
            <Space direction="vertical" size="large" className="w-full">
                <div className="text-center mb-4">
                    <Title level={2} className="!mb-3">
                        <MobileOutlined className="mr-2 text-primary" />
                        Mobile Web App
                    </Title>
                    <Paragraph className="text-base text-gray-600 px-4">
                        Responsive mobile-first design with touch-optimized controls
                    </Paragraph>
                </div>

                <Alert
                    message="Mobile Features"
                    description={
                        <div className="space-y-1">
                            <div><CheckCircleOutlined className="text-green-500 mr-2" />Touch-optimized UI</div>
                            <div><CheckCircleOutlined className="text-green-500 mr-2" />Responsive design</div>
                            <div><CheckCircleOutlined className="text-green-500 mr-2" />Drawer navigation</div>
                            <div><CheckCircleOutlined className="text-green-500 mr-2" />Mobile-first approach</div>
                        </div>
                    }
                    type="success"
                    showIcon
                    className="mb-4"
                />

                <Card
                    title={
                        <span>
                            <RocketOutlined className="mr-2" />
                            Ant Design Mobile
                        </span>
                    }
                    className="shadow-lg"
                >
                    <Paragraph>
                        Fully configured with mobile-optimized theme settings:
                    </Paragraph>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                        <li>Larger touch targets (44px)</li>
                        <li>Increased font size (16px)</li>
                        <li>Rounded corners (12px)</li>
                        <li>Drawer menu for navigation</li>
                    </ul>
                    <Button type="primary" size="large" block>
                        Explore Components
                    </Button>
                </Card>

                <Card
                    title="React Query Status"
                    className="shadow-lg"
                >
                    {isLoading && (
                        <div className="text-center py-4">
                            <Spin size="large" />
                            <Paragraph className="mt-2">Loading data...</Paragraph>
                        </div>
                    )}
                    {error && (
                        <Alert
                            message="Error"
                            description="Failed to load data"
                            type="error"
                            showIcon
                        />
                    )}
                    {data && (
                        <Alert
                            message={data.message}
                            description="React Query is working perfectly on mobile!"
                            type="success"
                            showIcon
                        />
                    )}
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Title level={4}>Tech Stack</Title>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <span className="text-2xl mr-3">⚛️</span>
                            <div>
                                <Paragraph className="!mb-0 font-semibold">React + Vite</Paragraph>
                                <Paragraph className="!mb-0 text-sm text-gray-600">Fast, modern development</Paragraph>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <span className="text-2xl mr-3">🎨</span>
                            <div>
                                <Paragraph className="!mb-0 font-semibold">Ant Design</Paragraph>
                                <Paragraph className="!mb-0 text-sm text-gray-600">Mobile-optimized UI components</Paragraph>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <span className="text-2xl mr-3">🔄</span>
                            <div>
                                <Paragraph className="!mb-0 font-semibold">React Query</Paragraph>
                                <Paragraph className="!mb-0 text-sm text-gray-600">Smart data synchronization</Paragraph>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <span className="text-2xl mr-3">🎯</span>
                            <div>
                                <Paragraph className="!mb-0 font-semibold">Tailwind CSS</Paragraph>
                                <Paragraph className="!mb-0 text-sm text-gray-600">Utility-first styling</Paragraph>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                    <Title level={5}>💡 Quick Tip</Title>
                    <Paragraph className="!mb-0">
                        This mobile app runs on <strong>port 3001</strong>. Try resizing your browser
                        to see the responsive design in action!
                    </Paragraph>
                </Card>
            </Space>
        </div>
    );
}

export default HomePage;
