
import api from "./api";

export const getRoomAPI = async (params: any = {}) => {
    try {
        const response = await api.get('rooms/', { params });
        return { success: true, data: response.data };

    } catch (error: any) {
        console.error("Lỗi lấy danh sách phòng: ", error);
        return {
            success: false,
            message: error.response?.data?.detail || "Không thể tải dữ liệu phòng!"
        };
    }
};

export const createRoomAPI = async (roomData: any) => {
    try {
        const response = await api.post('rooms/', roomData);
        return { success: true, data: response.data };
    } catch (error: any) {
        console.error("Lỗi thêm phòng mới: ", error);
        let errorMessage = "Không thể thêm phòng mới!";
        if (error.response?.data) {
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (typeof error.response.data === 'object') {
                errorMessage = Object.values(error.response.data)[0] as string;
            }
        }
        return {
            success: false,
            message: errorMessage   
        };
    }
};
export const deleteRoomAPI = async (id: number) => {
    try {
         await api.delete(`rooms/${id}/`);
        return { success: true};
    } catch (error: any) {
        console.error("Lỗi xóa phòng: ", error);
        return {
            success: false,
            message: error.response?.data?.detail || "Không thể xóa phòng!"
        };
    }
};
