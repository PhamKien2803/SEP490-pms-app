import { AxiosError } from "axios";
import { LoginRequest, LoginResponse, User } from "../types/auth";
import { apiEndPoint } from "./api";
import axiosAuth from "./axiosAuth";
import { messages } from "../constants/message";

export const authApis = {
    login: async (body: LoginRequest): Promise<LoginResponse> => {
        try {
            const response = await axiosAuth.post<LoginResponse>(
                apiEndPoint.LOGIN,
                body
            );
            return response.data;
        } catch (err: AxiosError | unknown) {
            if (err instanceof AxiosError) {
                const errorResponse = err.response?.data;
                return errorResponse;
            }

            return {
                error: {
                    message: messages.AN_UNKNOWN_ERROR_OCCURRED,
                },
            };
        }
    },

    logout: async (): Promise<void> => {
        const response = await axiosAuth.post(apiEndPoint.LOGOUT);
        return response.data;
    },
};

export const userApis = {
    getCurrentUser: async (): Promise<User> => {
        const response = await axiosAuth.get<User>(apiEndPoint.CURRENT_USER);
        return response.data;
    },
};