import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { loginAPI } from '../../services/auth.service';
import './login.css'; 

const { Title } = Typography;

const Login: React.FC = () => {
    const [loading, setLoading] = useState<boolean> (false);

    const onFinish = async (values : any ) => {
        setLoading(true);
        const { username, password } = values;
        
        const result = await loginAPI(username, password);
        
        if (result && result.success) {
            message.success(`Đăng nhập thành công! Xin chào ${result.user?.username}`);
            window.location.href = '/rooms';
        } else {
            message.error(result?.message || 'Đăng nhập thất bại!');
        }
        setLoading(false);
    };

    return (
       <div className="login-wrapper">
            <Card className="login-card">
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>Đảo Home</Title>

                </div>

                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập (VD: admin)" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;