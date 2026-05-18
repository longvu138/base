import { Form, Input, Button, Typography, Card, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, ArrowRightOutlined, RocketOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {
    confirmPasswordRules,
    emailRules,
    fullnameRules,
    normalizePhone,
    passwordRules,
    phoneRules,
    RegisterTermsContent,
    termsRules,
    usernameRules,
} from './RegisterShared';
import './RegisterStyleGobiz.css';

const { Title, Text } = Typography;

export const RegisterStyleGobiz = ({ form, onFinish, isLoading, projectInfo }: any) => {
    const bgImage = projectInfo?.tenantConfig?.generalConfig?.registerBackgroundImage;
    return (
        <div className="register-mobile-style-gobiz">
            <div 
                className="header-blob"
                style={bgImage ? {
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '200px'
                } : {}}
            >
                {!bgImage && (
                    <div className="blob-content">
                        {projectInfo?.tenantConfig?.logoStandard ? (
                            <img 
                                src={projectInfo.tenantConfig.logoStandard} 
                                alt="logo" 
                                className="h-16 object-contain mb-4"
                            />
                        ) : (
                            <RocketOutlined className="rocket-icon" />
                        )}
                        <Title level={2} className="text-white m-0">Gia nhập Gobiz</Title>
                        <Text className="text-white-50">Vận hành thông minh trong tầm tay</Text>
                    </div>
                )}
            </div>

            <div className="form-wrapper-mobile">
                <Card className="modern-register-card">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="fullname"
                            label={<span className="label-bold">Họ và tên</span>}
                            rules={fullnameRules}
                        >
                            <Input prefix={<IdcardOutlined />} placeholder="Họ và tên của bạn" size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item
                            name="username"
                            label={<span className="label-bold">Tên đăng nhập</span>}
                            rules={usernameRules}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label={<span className="label-bold">Email</span>}
                            rules={emailRules}
                        >
                            <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label={<span className="label-bold">Số điện thoại</span>}
                            getValueFromEvent={normalizePhone}
                            rules={phoneRules}
                        >
                            <Input prefix={<PhoneOutlined />} placeholder="+84 ..." size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span className="label-bold">Mật khẩu</span>}
                            rules={passwordRules}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item
                            name="confirm"
                            label={<span className="label-bold">Xác nhận mật khẩu</span>}
                            dependencies={['password']}
                            rules={confirmPasswordRules}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item
                            name="ref"
                            label={<span className="label-bold">Mã giới thiệu</span>}
                        >
                            <Input prefix={<UserAddOutlined />} placeholder="Mã giới thiệu (nếu có)" size="large" className="premium-input" />
                        </Form.Item>

                        <Form.Item
                            name="terms"
                            valuePropName="checked"
                            rules={termsRules}
                        >
                            <Checkbox>
                                <RegisterTermsContent projectInfo={projectInfo} linkClassName="text-primary" className="text-sm" />
                            </Checkbox>
                        </Form.Item>

                        <Form.Item className="mt-6">
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                block 
                                size="large" 
                                loading={isLoading} 
                                className="premium-btn"
                                icon={<ArrowRightOutlined />}
                                iconPosition="end"
                            >
                                ĐĂNG KÝ NGAY
                            </Button>
                        </Form.Item>

                        <div className="text-center mt-4">
                            <Text type="secondary">Bạn đã có tài khoản? </Text>
                            <Link to="/login" className="login-text-bold">Đăng nhập</Link>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default RegisterStyleGobiz;
