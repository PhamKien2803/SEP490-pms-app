import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { apiConfig } from './api';

const axiosAuth = axios.create({
    baseURL: apiConfig.baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosAuth.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        Alert.alert('Lỗi', 'Đã xảy ra lỗi không xác định');
        return Promise.reject(error);
    }
);

axiosAuth.interceptors.response.use(
    response => response,
    error => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            // Handle unauthorized, maybe navigate to login screen
            // Example: navigationRef.navigate("Login");
        }

        let errorMessage = 'Đã xảy ra lỗi không xác định';
        if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
            error.message = errorMessage;
        } else {
            switch (status) {
                case 401:
                    errorMessage = 'Không được phép truy cập';
                    break;
                case 403:
                    errorMessage = 'Bạn không có quyền truy cập';
                    break;
                case 404:
                    errorMessage = 'Không tìm thấy dữ liệu';
                    break;
                case 500:
                    errorMessage = 'Lỗi máy chủ';
                    break;
                case 503:
                    errorMessage = 'Dịch vụ không khả dụng';
                    break;
            }
        }

        if (!error?.response?.data?.silent) {
            // Alert.alert('Yêu cầu thất bại', errorMessage);
        }

        return Promise.reject(errorMessage);
    }
);

export default axiosAuth;
