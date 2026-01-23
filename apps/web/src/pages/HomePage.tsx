import { Card, Button, Row, Col, Space, Typography, Alert } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { RocketOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function HomePage() {
    // Example React Query usage
    const { data, isLoading, error } = useQuery({
        queryKey: ['example'],
        queryFn: async () => {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { message: 'Data loaded successfully!' };
        },
    });

    return (
        <div className="py-8">
            <Space direction="vertical" size="large" className="w-full">
                <div className="text-center mb-8">
                    <Title level={1} className="!mb-4">
                        <span className='text-primary'>
                            Welcome to Web App
                        </span>
                    </Title>
                    <Paragraph className="text-lg text-gray-600">
                        Built with Turbo Monorepo, React, Vite, Ant Design, React Query & Tailwind CSS
                    </Paragraph>
                </div>

                <Alert
                    message="Features Included"
                    description="✅ Turbo Monorepo | ✅ React + Vite | ✅ Ant Design with ConfigProvider | ✅ React Query | ✅ React Router | ✅ Tailwind CSS | ✅ TypeScript"
                    type="info"
                    showIcon
                    className="mb-6"
                />

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} lg={8}>
                        <Card
                            title="Ant Design"
                            bordered={false}
                            className="shadow-md hover:shadow-lg transition-shadow"
                        >
                            <Paragraph>
                                Fully configured with ConfigProvider for easy theme customization.
                                Change colors, borders, and more!
                            </Paragraph>
                            <Button type="primary" block>
                                Explore Components
                            </Button>
                        </Card>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <Card
                            title="React Query"
                            bordered={false}
                            className="shadow-md hover:shadow-lg transition-shadow"
                        >
                            <Paragraph>
                                {isLoading && 'Loading...'}
                                {error && 'Error loading data'}
                                {data && data.message}
                            </Paragraph>
                            <Paragraph className="text-sm text-gray-500">
                                Efficient data fetching and caching out of the box.
                            </Paragraph>
                            <Button type="default" block>
                                Learn More
                            </Button>
                        </Card>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <Card
                            title="Tailwind CSS"
                            bordered={false}
                            className="shadow-md hover:shadow-lg transition-shadow"
                        >
                            <Paragraph>
                                Utility-first CSS framework for rapid UI development with responsive design.
                            </Paragraph>
                            <Button type="dashed" block>
                                View Docs
                            </Button>
                        </Card>
                    </Col>
                </Row>

                <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
                    <Title level={3}>Getting Started</Title>
                    <Paragraph>
                        This is a fully configured Turbo monorepo with web and mobile apps.
                        Each app has its own configuration but shares common packages.
                    </Paragraph>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Web app runs on port 3000</li>
                        <li>Mobile app runs on port 3001</li>
                        <li>Shared packages in /packages directory</li>
                        <li>Full TypeScript support</li>
                    </ul>
                </Card>
            </Space>
        </div>
    );
}

export default HomePage;
