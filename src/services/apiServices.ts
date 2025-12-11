import { AxiosError } from "axios";
import { AttendanceResponse, ChangePasswordPayload, ConfirmTuitionPayload, ConfirmTuitionResponse, FeedbackApiResponse, LoginRequest, LoginResponse, MedicalResponse, Menu, MonthlySchedule, StuParent, StuParents, UpdateParentPayload, User } from "../types/auth";
import { apiEndPoint } from "./api";
import axiosAuth from "./axiosAuth";
import { messages } from "../constants/message";
import {
  ClassData,
  CreatePostParams,
  CreatePostResponse,
  PostsResponse,
} from "../types/post";
import {
  ChangeTeacherPasswordPayload,
  IAttendanceCreatePayload,
  IAttendanceDetailResponse,
  IAttendanceUpdatePayload,
  IFeedbackCreatePayload,
  IFeedbackDetailResponse,
  IFeedbackListResponse,
  IFeedbackUpdatePayload,
  IGetTimetableTeacherResponse,
  ILessonDetailResponse,
  ILessonListResponse,
  ILessonPayload,
  IScheduleWeekResponse,
  ITeacherClassStudentResponse,
  StudentDetailResponse,
  TeacherProfile,
  TeacherProfileResponse,
  UpdateTeacherPayload,
} from "../types/teacher";
import {
  CreateSchoolYearDto,
  SchoolYearListItem,
  SchoolYearReportResponses,
  SchoolYearsListResponse,
  UpdateSchoolYearDto,
} from "../types/schoolYear";
import { ClassListResponse } from "../types/class";

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
      `${apiEndPoint.CREATE_GUARDIAN}`
    );
    return response.data;
  },
  createGuardian: async (data: any): Promise<any> => {
    const url = apiEndPoint.CREATE_GUARDIAN;
    const response = await axiosAuth.post(url, data);
    return response.data;
  },
  getGuardiansByStudent: async (studentId: any): Promise<any> => {
    const url = apiEndPoint.GET_LIST_GUARDIAN_BY_STUDENT(studentId);
    const response = await axiosAuth.get(url);
    return response.data;
  },
  getTuitionByParent: async (parentId: any): Promise<any> => {
    const url = apiEndPoint.GET_TUITION_BY_PARENT(parentId);
    const response = await axiosAuth.get(url);
    return response.data;
  },
  getParentInfo: async (parentId: any): Promise<any> => {
    const url = apiEndPoint.GET_INFOR_PARENT(parentId);
    const response = await axiosAuth.get(url);
    return response.data;
  },
  getPostsByStudent: async (studentId: any): Promise<any> => {
    const url = apiEndPoint.GET_POST_BY_STUDENT(studentId);
    const response = await axiosAuth.get(url);
    return response.data;
  },
  updateParent: async (parentId: string, payload: UpdateParentPayload): Promise<any> => {
    const url = apiEndPoint.UPDATE_INFOR_PARENT(parentId);
    const response = await axiosAuth.put(url, payload);
    return response.data;
  },
  changeParentPassword: async (parentId: string, payload: ChangePasswordPayload): Promise<any> => {
    console.log("🚀 HieuDD ×͜× ~ payload:", payload)
    const url = apiEndPoint.CHANGE_PASS_PARENT(parentId);
    const response = await axiosAuth.put(url, payload);
    console.log("🚀 HieuDD ×͜× ~ response:", response)
    return response.data;
  },
  confirmTuition: async (
    payload: ConfirmTuitionPayload
  ): Promise<ConfirmTuitionResponse> => {
    const response = await axiosAuth.post<ConfirmTuitionResponse>(
      apiEndPoint.CONFIRM_TUITION,
      payload
    );
    return response.data;
  }
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

export const teacherApis = {
  getPDFById: async (id: string): Promise<ArrayBuffer> => {
    const response = await axiosAuth.get<ArrayBuffer>(
      apiEndPoint.GET_PDF_BY_IDS(id),
      {
        responseType: "arraybuffer",
      }
    );
    return response.data;
  },

  getClassAndStudentByTeacher: async (
    teacherId: string,
    schoolYearId: string
  ): Promise<ITeacherClassStudentResponse> => {
    const response = await axiosAuth.get<ITeacherClassStudentResponse>(
      apiEndPoint.GET_CLASS_AND_STUDENT_BY_TEACHER(teacherId),
      {
        params: { schoolYearId },
      }
    );
    return response.data;
  },

  getSchoolYearList: async (params: {
    page: number;
    limit: number;
  }): Promise<SchoolYearsListResponse> => {
    const response = await axiosAuth.get<SchoolYearsListResponse>(
      apiEndPoint.GET_SCHOOLYEARS_LIST,
      { params }
    );
    return response.data;
  },

  getTeacherInfo: async (teacherId: any): Promise<any> => {
    const url = apiEndPoint.GET_TEACHER_INFO(teacherId);
    const response = await axiosAuth.get<TeacherProfileResponse>(url);
    return response.data;
  },

  updateTeacher: async (teacherId: string, payload: UpdateTeacherPayload): Promise<any> => {
    const url = apiEndPoint.UPDATE_TEACHER_INFO(teacherId);
    const response = await axiosAuth.put(url, payload);
    return response.data;
  },

  changeTeacherPassword: async (teacherId: string, payload: ChangeTeacherPasswordPayload): Promise<any> => {
    const url = apiEndPoint.CHANGE_PASS_TEACHER(teacherId);
    const response = await axiosAuth.put(url, payload);
    return response.data;
  },

  getAttendanceById: async (id: string): Promise<IAttendanceDetailResponse> => {
    const response = await axiosAuth.get<IAttendanceDetailResponse>(
      apiEndPoint.GET_ATTENDANCE_BY_ID(id)
    );
    return response.data;
  },

  getAttendanceByClassAndSchoolYear: async (
    classId: string,
    schoolYearId: string
  ): Promise<IAttendanceDetailResponse> => {
    const response = await axiosAuth.get<IAttendanceDetailResponse>(
      apiEndPoint.GET_ATTENDANCE_BY_CLASS_AND_SCHOOLYEAR(classId, schoolYearId)
    );
    return response.data;
  },

  getAttendanceByClassAndDate: async (
    classId: string,
    date: string
  ): Promise<IAttendanceDetailResponse> => {
    const response = await axiosAuth.get<IAttendanceDetailResponse>(
      apiEndPoint.GET_ATTENDANCE_BY_CLASS_AND_DATE(classId, date)
    );
    return response.data;
  },

  createAttendance: async (
    payload: IAttendanceCreatePayload
  ): Promise<IAttendanceDetailResponse> => {
    const response = await axiosAuth.post<IAttendanceDetailResponse>(
      apiEndPoint.CREATE_ATTENDANCE,
      payload
    );
    return response.data;
  },

  updateAttendance: async (
    id: string,
    payload: IAttendanceUpdatePayload
  ): Promise<IAttendanceDetailResponse> => {
    const response = await axiosAuth.put<IAttendanceDetailResponse>(
      apiEndPoint.UPDATE_ATTENDANCE(id),
      payload
    );
    return response.data;
  },

  deleteAttendance: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_ATTENDANCE(id));
  },

  getStudentDetails: async (id: string): Promise<StudentDetailResponse> => {
    const response = await axiosAuth.get<StudentDetailResponse>(
      apiEndPoint.GET_STUDENT_DETAILS(id)
    );
    return response.data;
  },

  getClassList: async (params: {
    year: string;
    page?: number;
    limit?: number;
  }): Promise<ClassListResponse> => {
    const response = await axiosAuth.get<ClassListResponse>(
      apiEndPoint.GET_CLASS_LIST,
      {
        params,
      }
    );
    return response.data;
  },

  getFeedbackByClassAndDate: async (
    classId: string,
    date: string
  ): Promise<IFeedbackListResponse> => {
    const response = await axiosAuth.get<IFeedbackListResponse>(
      apiEndPoint.GET_FEEDBACK_BY_CLASS_AND_DATE,
      {
        params: { classId, date },
      }
    );
    return response.data;
  },

  getFeedbackById: async (id: string): Promise<IFeedbackDetailResponse> => {
    const response = await axiosAuth.get<IFeedbackDetailResponse>(
      apiEndPoint.GET_FEEDBACK_BY_ID(id)
    );
    return response.data;
  },

  createFeedback: async (
    payload: IFeedbackCreatePayload
  ): Promise<IFeedbackDetailResponse[]> => {
    const response = await axiosAuth.post<IFeedbackDetailResponse[]>(
      apiEndPoint.CREATE_FEEDBACK,
      payload
    );
    return response.data;
  },

  updateFeedback: async (
    id: string,
    payload: IFeedbackUpdatePayload
  ): Promise<IFeedbackDetailResponse> => {
    const response = await axiosAuth.put<IFeedbackDetailResponse>(
      apiEndPoint.UPDATE_FEED_BACK(id),
      payload
    );
    return response.data;
  },

  deleteFeedback: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_FEED_BACK(id));
  },

  getListLesson: async (params: {
    teacherId: string;
    schoolYear: string;
    limit: string;
    page: string;
  }): Promise<ILessonListResponse> => {
    const response = await axiosAuth.get<ILessonListResponse>(
      apiEndPoint.GET_LIST_LESSON,
      { params }
    );
    return response.data;
  },

  getScheduleWeek: async (params: {
    teacherId: string;
    month: string;
    week: string;
  }): Promise<IScheduleWeekResponse> => {
    const response = await axiosAuth.get<IScheduleWeekResponse>(
      apiEndPoint.GET_SCHEDULE_WEEK,
      { params }
    );
    return response.data;
  },

  getLessonById: async (id: string): Promise<ILessonDetailResponse> => {
    const response = await axiosAuth.get<ILessonDetailResponse>(
      apiEndPoint.GET_LESSON_BY_ID(id)
    );
    return response.data;
  },

  createLesson: async (
    payload: ILessonPayload
  ): Promise<ILessonDetailResponse> => {
    const response = await axiosAuth.post<ILessonDetailResponse>(
      apiEndPoint.CREATE_LESSON,
      payload
    );
    return response.data;
  },

  updateLesson: async (
    id: string,
    payload: ILessonPayload
  ): Promise<ILessonDetailResponse> => {
    const response = await axiosAuth.put<ILessonDetailResponse>(
      apiEndPoint.UPDATE_LESSON(id),
      payload
    );
    return response.data;
  },

  sendLesson: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.SEND_LESSON(id));
  },

  approveLesson: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.APPROVE_LESSON(id));
  },

  rejectLesson: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.REJECT_LESSON(id));
  },

  getTimetableTeacher: async (params: {
    teacherId: string;
    schoolYear: string;
    month: string;
  }): Promise<IGetTimetableTeacherResponse> => {
    const response = await axiosAuth.get<IGetTimetableTeacherResponse>(
      apiEndPoint.GET_TIMETABLE_TEACHER,
      { params }
    );
    return response.data;
  },
};

export const schoolYearApis = {
  getSchoolYearList: async (params: {
    page: number;
    limit: number;
  }): Promise<SchoolYearsListResponse> => {
    const response = await axiosAuth.get<SchoolYearsListResponse>(
      apiEndPoint.GET_SCHOOLYEARS_LIST,
      { params }
    );
    return response.data;
  },

  getSchoolYearById: async (id: string): Promise<SchoolYearListItem> => {
    const response = await axiosAuth.get<SchoolYearListItem>(
      apiEndPoint.GET_SCHOOLYEAR_BY_ID(id)
    );
    return response.data;
  },

  createSchoolYear: async (body: CreateSchoolYearDto): Promise<void> => {
    await axiosAuth.post(apiEndPoint.CREATE_SCHOOLYEAR, body);
  },

  updateSchoolYear: async (
    id: string,
    body: UpdateSchoolYearDto
  ): Promise<void> => {
    await axiosAuth.put(apiEndPoint.UPDATE_SCHOOLYEAR(id), body);
  },

  deleteSchoolYear: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.DELETE_SCHOOLYEAR(id));
  },

  endSchoolYear: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.END_SCHOOLYEAR(id));
  },

  confirmSchoolYear: async (id: string): Promise<void> => {
    await axiosAuth.post(apiEndPoint.CONFIRM_SCHOOLYEAR(id));
  },

  getStudentGraduatedReport: async (params: {
    year: number;
    page: number;
    limit: number;
  }): Promise<SchoolYearReportResponses> => {
    const response = await axiosAuth.get<SchoolYearReportResponses>(
      apiEndPoint.SCHOOLYEAR_REPORT,
      { params }
    );
    return response.data;
  },
};
