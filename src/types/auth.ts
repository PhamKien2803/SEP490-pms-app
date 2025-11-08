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

// =================================================================
// SECTION: Permissions & Roles Types
// =================================================================

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
};
