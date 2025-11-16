import { AxiosError } from "axios";
import { AttendanceResponse, FeedbackApiResponse, LoginRequest, LoginResponse, MedicalResponse, Menu, MonthlySchedule, StuParent, StuParents, User } from "../types/auth";
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
        console.log("🚀 ~ response:", response)
        return response.data;
    },
    getStudentByParent: async (parentId: string): Promise<StuParents> => {
        const response = await axiosAuth.get<StuParents>(
            `${apiEndPoint.STUDENT_BY_PARENT}/${parentId}`
        );
        return response.data;
    },
    getScheduleByClassAndMonth: async (classId: string, month: number): Promise<MonthlySchedule[]> => {
        const response = await axiosAuth.get<MonthlySchedule[]>(apiEndPoint.SC_BY_CLASS_MONTH, {
            params: { classId, month },
        });
        return response.data;
    },
    getAttByStuDate: async (studentId: string, date: string): Promise<AttendanceResponse> => {
        const response = await axiosAuth.get<AttendanceResponse>(apiEndPoint.ATT_BY_STU_DATE, {
            params: { studentId, date },
        });
        return response.data;
    },
    getClassByStuAndSY: async (studentId: string, schoolYearId: string): Promise<User[]> => {
        const response = await axiosAuth.get<User[]>(apiEndPoint.CLASS_BY_STU_SY, {
            params: { studentId, schoolYearId },
        });
        return response.data;
    },
    getFbByStuAndDate: async (studentId: string, date: string): Promise<FeedbackApiResponse> => {
        const response = await axiosAuth.get<FeedbackApiResponse>(apiEndPoint.FB_BY_STU_DATE, {
            params: { studentId, date },
        });
        return response.data;
    },
    getMedByStu: async (studentId: string): Promise<MedicalResponse> => {
        console.log("🚀 ~ studentI222d:", studentId)
        const response = await axiosAuth.get<MedicalResponse>(
            `${apiEndPoint.MED_BY_STUDENT}/${studentId}`
        );
        return response.data;
    },
    getMenuByAgeAndDate: async (studentId: string, date: string): Promise<Menu> => {
        const response = await axiosAuth.get<Menu>(apiEndPoint.MENU_BY_AGE_DATE, {
            params: { studentId, date },
        });
        return response.data; // res.data là Menu object
    },
    getListSY: async (): Promise<User[]> => {
        const response = await axiosAuth.get<User[]>(
            `${apiEndPoint.SY_LIST}`
        );
        return response.data;
    },
};