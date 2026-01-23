import { Card, Typography, Divider } from 'antd';

const { Title, Paragraph } = Typography;

function AboutPage() {
    return (
        <div className="py-8">
            <Card className="shadow-lg">
                <Title level={2}>About This Project</Title>
                <Divider />

                <Paragraph className="text-lg">
                    This is a Turbo monorepo setup with the following technologies:
                </Paragraph>

                <div className="space-y-4">
                    <div>
                        <Title level={4}>🚀 Turbo Monorepo</Title>
                        <Paragraph>
                            High-performance build system for JavaScript and TypeScript codebases.
                            Enables efficient mono-repository management with intelligent caching.
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4}>⚛️ React + Vite</Title>
                        <Paragraph>
                            Fast, modern development experience with Hot Module Replacement (HMR)
                            and optimized production builds.
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4}>🎨 Ant Design</Title>
                        <Paragraph>
                            Enterprise-class UI design system with ConfigProvider for easy theming.
                            Customize colors, borders, spacing, and more through token configuration.
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4}>🔄 React Query</Title>
                        <Paragraph>
                            Powerful data synchronization for React. Handles caching, background updates,
                            and stale data management automatically.
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4}>🛣️ React Router</Title>
                        <Paragraph>
                            Declarative routing for React applications with full TypeScript support.
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4}>🎯 Tailwind CSS</Title>
                        <Paragraph>
                            Utility-first CSS framework configured to work seamlessly with Ant Design.
                            Build responsive, modern UIs quickly.
                        </Paragraph>
                    </div>

                    <div>
                        <Title level={4}>📱 Responsive Design</Title>
                        <Paragraph>
                            Both web and mobile apps are fully responsive and optimized for all screen sizes.
                        </Paragraph>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default AboutPage;
