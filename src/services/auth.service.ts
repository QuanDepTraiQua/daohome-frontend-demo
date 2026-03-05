import api from './api';

export const loginAPI = async (username: String, password: String) => {
    try {
        const response = await api.post('/users/login/', { username, password });
        if (response.data.access) {  
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            const payloadBase64 = response.data.access.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            const userInfo = {
                username: decodedPayload.username,
                role: decodedPayload.role,
                first_name: decodedPayload.first_name,
                last_name: decodedPayload.last_name
            };
            localStorage.setItem('user', JSON.stringify(userInfo));

            return { success: true, user: userInfo }
        }
    } catch (error: any) {
        console.error("Lỗi đăng nhập: ", error);
        return {
            success: false,
            message: error.response?.data?.detail || "Sai tài khoản hoặc mật khẩu!"
        };
    }
};

export const logoutAPI = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
}