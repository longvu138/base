import { Form, Input, Button, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './RegisterStyle3.css';

const { Title, Text } = Typography;

export const RegisterStyle3 = ({ form, onFinish, isLoading }: any) => {
    return (
        <div className="register-style3-container">
            <Row className="register-card-wrapper" align="middle">
                <Col xs={0} md={12} className="register-hero-section">
                    <div className="hero-content">
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
                                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                                    >
                                        <Input prefix={<IdcardOutlined />} placeholder="Nguyễn Văn A" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="username"
                                        label="Tên đăng nhập"
                                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="username123" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="email"
                                label="Địa chỉ Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="example@mail.com" size="large" />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="+84 ..." size="large" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
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

export default RegisterStyle3;
