import { Form, Input, Button, Typography, Row, Col, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, ArrowRightOutlined, UserAddOutlined } from '@ant-design/icons';
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
        <div className="register-style-gobiz-container">
            <Row className="register-card-wrapper" align="middle">
                <Col 
                    xs={0} md={12} 
                    className="register-hero-section"
                    style={bgImage ? {
                        backgroundImage: `url(${bgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    } : {}}
                >
                    {!bgImage && (
                        <div className="hero-content">
                            {projectInfo?.tenantConfig?.logoStandard && (
                                <div className="hero-logo-box mb-6">
                                    <img 
                                        src={projectInfo.tenantConfig.logoStandard} 
                                        alt="logo" 
                                        className="h-16 object-contain"
                                    />
                                </div>
                            )}
                            <Title level={1} className="hero-title">Chào mừng bạn đến với <span className="brand-text">Gobiz</span></Title>
                            <Text className="hero-subtitle">Bắt đầu hành trình vận hành thông minh cùng chúng tôi ngay hôm nay.</Text>
                            <div className="hero-features">
                                <div className="feature-item">
                                    <div className="feature-icon">🚀</div>
                                    <Text>Vận hành nhanh chóng</Text>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">🛡️</div>
                                    <Text>Bảo mật tuyệt đối</Text>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">📊</div>
                                    <Text>Báo cáo chuyên sâu</Text>
                                </div>
                            </div>
                        </div>
                    )}
                </Col>
                <Col xs={24} md={12} className="register-form-section">
                    <div className="form-container">
                        <Title level={2} className="form-title">Tạo tài khoản mới</Title>
                        <Text type="secondary" className="form-subtitle">Điền thông tin bên dưới để đăng ký</Text>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                            className="modern-form"
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="fullname"
                                        label="Họ và tên"
                                        rules={fullnameRules}
                                    >
                                        <Input prefix={<IdcardOutlined />} placeholder="Nguyễn Văn A" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="username"
                                        label="Tên đăng nhập"
                                        rules={usernameRules}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="username123" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="email"
                                label="Địa chỉ Email"
                                rules={emailRules}
                            >
                                <Input prefix={<MailOutlined />} placeholder="example@mail.com" size="large" />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                getValueFromEvent={normalizePhone}
                                rules={phoneRules}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="+84 ..." size="large" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={passwordRules}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
                            </Form.Item>

                            <Form.Item
                                name="confirm"
                                label="Xác nhận mật khẩu"
                                dependencies={['password']}
                                rules={confirmPasswordRules}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
                            </Form.Item>

                            <Form.Item
                                name="ref"
                                label="Mã giới thiệu"
                            >
                                <Input prefix={<UserAddOutlined />} placeholder="Nhập mã giới thiệu (nếu có)" size="large" />
                            </Form.Item>

                            <Form.Item
                                name="terms"
                                valuePropName="checked"
                                rules={termsRules}
                            >
                                <Checkbox>
                                    <RegisterTermsContent projectInfo={projectInfo} />
                                </Checkbox>
                            </Form.Item>

                            <Form.Item>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    block 
                                    size="large" 
                                    loading={isLoading} 
                                    className="submit-btn"
                                    icon={<ArrowRightOutlined />}
                                    iconPosition="end"
                                >
                                    Đăng ký tài khoản
                                </Button>
                            </Form.Item>

                            <div className="form-footer">
                                <Text type="secondary">Đã là thành viên? </Text>
                                <Link to="/login" className="login-link">Đăng nhập ngay</Link>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default RegisterStyleGobiz;
