// =================================================================
// SECTION: Authentication & User Types
// =================================================================

export type LoginErrorField = "email" | "password";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token?: string;
  error?: {
    errorField?: LoginErrorField;
    message: string;
  };
};

export type getStudentResponse = {
  success?: string;
  parent?: {
    _id?: string;
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  students?: {
    fullName: string;
  };
};

export interface UserProfile {
  _id: string;
  email: string;
  roleList: string[];
  active: boolean;
  staff?: string;
  isAdmin: boolean;
  isTeacher: boolean;
  parent?: string;
  id: string;
  fullName: string;
  name: string;
  status: AccountStatus;
  branch: string;
  permissions: string[];
  role: Role;
  students: {
    _id: string;
    studentCode: string;
    fullName: string;
    dob: string;
    idCard: string;
    gender: string;
    nation: string;
    religion: string;
  }[];
}

export enum Role {
  Administrator = "Administrator",
  Accountant = "Accountant",
  Teacher = "Teacher",
  Parent = "Parent",
  Administrative_staff = "Administrative staff",
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface StuParents {
  parent: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  students: {
    _id: string;
    studentCode: string;
    fullName: string;
    dob: string;
    idCard: string;
    gender: string;
    nation: string;
    religion: string;
  }[];
  success?: boolean;
}

export type Activity = {
  _id: string;
  startTime: number; // Số phút từ 00:00
  endTime: number;
  activityCode: string;
  activityName: string;
  type: string;
  tittle?: string; // Tiêu đề cụ thể (không bắt buộc)
  category?: string; // Danh mục (không bắt buộc)
};

// Thông tin ngày trong tháng
export interface ScheduleDay {
  _id: string;
  date: string; // ISO string
  dayName: string;
  activities: Activity[];
  isHoliday: boolean;
  notes: string;
}

// Thông tin lớp
export interface ClassInfo {
  _id: string;
  classCode: string;
  className: string;
}

// Bản ghi lịch tháng
export interface MonthlySchedule {
  _id: string;
  schoolYear: string;
  class: ClassInfo;
  month: number;
  scheduleDays: ScheduleDay[];
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

type TeacherInfo = {
  _id: string;
  fullName: string;
  phoneNumber: string;
};

type StudentInfo = {
  _id: string;
  studentCode: string;
  fullName: string;
  gender: string;
};

// Kiểu dữ liệu cho trường 'student' trong response
// API trả về document con của Mongoose, dữ liệu sạch nằm trong _doc
type StudentAttendanceRecord = {
  status: string;
  note?: string;
  student: StudentInfo;
  timeCheckIn: string | null; // Thêm trường này
  timeCheckOut: string | null; // Thêm trường này
  guardian: string | null;
};

// Kiểu dữ liệu cho toàn bộ API response
export type AttendanceResponse = {
  success: boolean;
  class: ClassInfo;
  teacher: TeacherInfo;
  date: string;
  generalNote: string;
  student: StudentAttendanceRecord; // Cập nhật type ở đây
};

export interface User extends UserProfile {
  permissionListAll: PermissionModule[];
}

export interface StuParent extends StuParents {
  permissionListAll: PermissionModule[];
}

export interface MedicalRecord {
  _id: string;
  student: {
    _id: string;
    studentCode: string;
    fullName: string;
    dob: string;
    gender: string;
    address: string;
    healthCertId: string;
  };
  physicalDevelopment: {
    height: number;
    weight: number;
    bodyMassIndex: number;
    evaluation: string;
  };
  comprehensiveExamination: {
    mentalDevelopment: string;
    motorDevelopment: string;
    diseasesDetected: string[];
    abnormalSigns: string[];
    diseaseRisk: string[];
    notes: string;
  };
  conclusion: {
    healthStatus: string;
    advice: string;
  };
  class: {
    _id: string;
    classCode: string;
    className: string;
  };
  schoolYear: {
    _id: string;
    schoolYear: string;
  };
  healthCertFiles: {
    _id: string;
    length: number;
    chunkSize: number;
    uploadDate: string;
    filename: string;
  };
  createdBy: string;
  updatedBy: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface MedicalResponse {
  data: MedicalRecord[];
  page: {
    totalCount: number;
    limit: number;
    page: number;
  };
}


export interface Ingredient {
  name: string;
  gram: number;
  unit: string;
  calories: number;
  protein: number;
  lipid: number;
  carb: number;
}

export interface Food {
  _id: string;
  foodName: string;
  totalCalories: number;
  ingredients: Ingredient[];
}

export interface Meal {
  mealType: string;
  foods: { food: Food }[];
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
}

export interface DayMenu {
  date: string;
  meals: Meal[];
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
}

export interface Menu {
  _id: string;
  weekStart: string;
  weekEnd: string;
  ageGroup: string;
  days: DayMenu[];
  totalCalo: number;
  totalProtein: number;
  totalLipid: number;
  totalCarb: number;
  state: string;
  active: boolean;
  notes: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

type EatingFeedback = {
  breakfast: string;
  lunch: string;
  snack: string;
  note: string;
};

type SleepingFeedback = {
  duration: string;
  quality: string;
  note: string;
};

type HygieneFeedback = {
  toilet: string;
  handwash: string;
  note: string;
};

type LearningFeedback = {
  focus: string;
  participation: string;
  note: string;
};

type SocialFeedback = {
  friendInteraction: string;
  emotionalState: string;
  behavior: string;
  note: string;
};

type HealthFeedback = {
  note: string;
};

type FeedbackRecord = {
  _id: string;
  studentId: StudentInfo;
  classId: ClassInfo;
  teacherId: TeacherInfo;
  date: string;
  eating: EatingFeedback;
  sleeping: SleepingFeedback;
  hygiene: HygieneFeedback;
  learning: LearningFeedback;
  social: SocialFeedback;
  health: HealthFeedback;
  dailyHighlight: string;
  teacherNote: string;
  reminders: string[];
  createdAt: string;
};

export type FeedbackApiResponse = {
  message: string;
  data: FeedbackRecord; 
};

export interface ConfirmTuitionPayload {
    enrollementId: any;
    parentId: any;
    totalAmount: number;
}

export interface ConfirmTuitionResponse {
    success: boolean;
    message: string;
    data: {
        paymentUrl: string;
        transactionCode: number;
        qrCode: string;
    };
}

export interface ActionPermission {
  name: string;
  allowed: boolean;
}

// Type cho một function trong mảng "functions"
export interface PermissionFunction {
  functionId: string;
  urlFunction: string;
  functionName: string;
  actions: ActionPermission[];
}

// Type cho mỗi phần tử trong mảng "permissionListAll"
export interface PermissionModule {
  moduleId: string;
  moduleName: string;
  functions: PermissionFunction[];
}

// Type cho cấu trúc map quyền đã được làm phẳng
export type PermissionsMap = {
  [urlFunction: string]: {
    [actionName: string]: boolean;
  };
};

// =================================================================
// SECTION: API-Specific Types
// =================================================================

// Cấu trúc response của API /getCurrentUser
export interface ApiUserResponse {
  message: string;
  userProfile: UserProfile;
  permissionListAll: PermissionModule[];
}

// Types cho việc quản lý chức năng (Functions)
export interface Functions {
  _id: string;
  functionCode: string;
  functionName: string;
  urlFunction: string;
  active?: boolean;
  createdBy: string;
  updateBy?: string;
}

export interface PaginationInfo {
  totalCount: number;
  limit: number;
  page: number;
}

export interface FunctionsResponse {
  data: Functions[];
  page: PaginationInfo;
}

export interface ParentsResponse {
  data: Parent[];
  page: PaginationInfo;
}

export interface CreateFunctionDto {
  functionName: string;
  urlFunction: string;
  createdBy: string;
}

export interface UpdateFunctionDto {
  functionName?: string;
  urlFunction?: string;
  updatedBy: string;
}

export interface Parent {
  _id: string;
  parentCode: string;
  fullName: string;
  dob: string; // ISO date string
  phoneNumber?: string;
  email?: string;
  IDCard: string;
  gender: "Nam" | "Nữ" | "Khác";
  students: string[]; // mảng id của student
  address?: string;
  nation?: string;
  religion?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Parent2 {
  fullName?: string;
  dob?: string; // ISO date string
  phoneNumber?: string;
  email?: string;
  gender?: "Nam" | "Nữ" | "Khác";
  students?: string[]; // mảng id của student
  address?: string;
  nation?: string;
  religion?: string;
  updatedBy: string;
}

export interface UpdateParentDto {
  fullName?: string;
  dob?: string; // ISO date string
  phoneNumber?: string;
  email?: string;
  gender?: "Nam" | "Nữ" | "Khác";
  students?: string[]; // mảng id của student
  address?: string;
  nation?: string;
  religion?: string;
  updatedBy: string;
}

export interface CreateParentDto {
  fullName: string;
  dob: string;
  phoneNumber?: string;
  email?: string;
  IDCard: string;
  gender: "Nam" | "Nữ" | "Khác";
  students?: string[];
  address?: string;
  nation?: string;
  religion?: string;
}
// =================================================================
// SECTION: Redux State & UI-Related Types
// =================================================================

// Cấu trúc cho menu sidebar
export interface ModuleMenu {
  moduleName: string;
  functions: {
    name: string;
    url: string;
  }[];
}

// Cấu trúc state chính của auth slice
export interface AuthState {
  user: User | null;
  isLoginPending: boolean;
  isLogoutPending: boolean;
  loginError?: { errorField?: "email" | "password"; message: string };
  isInitializing: boolean;
  moduleMenu: ModuleMenu[];
  permissionsMap: PermissionsMap;
  permissionsStale: boolean;
  token: string;
}

// Giá trị khởi tạo cho state
export const initialState: AuthState = {
  user: null,
  isLoginPending: false,
  isLogoutPending: false,
  loginError: undefined,
  isInitializing: true,
  moduleMenu: [],
  permissionsMap: {},
  permissionsStale: false,
  token: "",
};

export interface UserProfile {
  _id: string;
  email: string;
  roleList: string[];
  active: boolean;
  staff?: string;
  isAdmin: boolean;
  isTeacher: boolean;
  parent?: string;
}

export interface User extends UserProfile {
  permissionListAll: PermissionModule[];
}
