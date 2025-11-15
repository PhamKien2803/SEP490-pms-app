import { AxiosError } from "axios";
import {
  LoginRequest,
  LoginResponse,
  MedicalResponse,
  StuParent,
  StuParents,
  User,
} from "../types/auth";
import { apiEndPoint } from "./api";
import axiosAuth from "./axiosAuth";
import { messages } from "../constants/message";
import {
  ClassData,
  CreatePostParams,
  CreatePostResponse,
  PostsResponse,
} from "../types/post";

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
    console.log("🚀 ~ response:", response);
    return response.data;
  },
  getStudentByParent: async (parentId: string): Promise<StuParents> => {
    const response = await axiosAuth.get<StuParents>(
      `${apiEndPoint.STUDENT_BY_PARENT}/${parentId}`
    );
    return response.data;
  },
  getScheduleByClassAndMonth: async (
    classId: string,
    month: number
  ): Promise<User[]> => {
    const response = await axiosAuth.get<User[]>(
      apiEndPoint.SC_BY_CLASS_MONTH,
      {
        params: { classId, month },
      }
    );
    return response.data;
  },
  getAttByStuDate: async (studentId: string, date: string): Promise<User[]> => {
    const response = await axiosAuth.get<User[]>(apiEndPoint.ATT_BY_STU_DATE, {
      params: { studentId, date },
    });
    return response.data;
  },
  getClassByStuAndSY: async (
    studentId: string,
    schoolYearId: string
  ): Promise<User[]> => {
    const response = await axiosAuth.get<User[]>(apiEndPoint.CLASS_BY_STU_SY, {
      params: { studentId, schoolYearId },
    });
    return response.data;
  },
  getFbByStuAndDate: async (
    studentId: string,
    date: string
  ): Promise<User[]> => {
    const response = await axiosAuth.get<User[]>(apiEndPoint.FB_BY_STU_DATE, {
      params: { studentId, date },
    });
    return response.data;
  },
  getMedByStu: async (studentId: string): Promise<MedicalResponse> => {
    console.log("🚀 ~ studentI222d:", studentId);
    const response = await axiosAuth.get<MedicalResponse>(
      `${apiEndPoint.MED_BY_STUDENT}/${studentId}`
    );
    return response.data;
  },
  getMenuByAgeAndDate: async (
    studentId: string,
    date: string
  ): Promise<User[]> => {
    const response = await axiosAuth.get<User[]>(apiEndPoint.MENU_BY_AGE_DATE, {
      params: { studentId, date },
    });
    return response.data;
  },
  getListSY: async (): Promise<User[]> => {
    const response = await axiosAuth.get<User[]>(`${apiEndPoint.SY_LIST}`);
    return response.data;
  },
};

export const postApis = {
  createNewPost: async (
    params: CreatePostParams
  ): Promise<CreatePostResponse> => {
    const response = await axiosAuth.post<CreatePostResponse>(
      apiEndPoint.CREATE_NEW_POST,
      params
    );
    return response.data;
  },

  getClass: async (teacherId: string): Promise<ClassData> => {
    const response = await axiosAuth.get<ClassData>(
      apiEndPoint.GET_CLASS_OF_TEACHER(teacherId)
    );
    return response.data;
  },

  getListPost: async (teacherId: string): Promise<PostsResponse> => {
    const response = await axiosAuth.get<PostsResponse>(
      apiEndPoint.GET_LIST_POST(teacherId)
    );
    return response.data;
  },

  deletePost: async (postId: string): Promise<any> => {
    const response = await axiosAuth.post<any>(apiEndPoint.DELETE_POST(postId));
    return response.data;
  },

  deleteImage: async (imageId: string): Promise<any> => {
    const response = await axiosAuth.post<any>(
      apiEndPoint.DELETE_IMAGE(imageId)
    );
    return response.data;
  },

  updatePost: async (
    postId: string,
    params: CreatePostParams
  ): Promise<any> => {
    const response = await axiosAuth.put<any>(
      apiEndPoint.UPDATE_POST(postId),
      params
    );
    return response.data;
  },

  getListPostByStudent: async (studentId: string): Promise<PostsResponse> => {
    const response = await axiosAuth.get<PostsResponse>(
      apiEndPoint.GET_LIST_POST_BY_STUDENT(studentId)
    );
    return response.data;
  },

  uploadAlbum: async (
    postId: string,
    files: File[]
  ): Promise<CreatePostResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosAuth.post<CreatePostResponse>(
      apiEndPoint.UPLOAD_ALBUM(postId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};
