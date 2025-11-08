import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiUserResponse, initialState, LoginRequest, LoginResponse, ModuleMenu, PermissionModule, PermissionsMap, User } from "../types/auth";
import axiosAuth from "../services/axiosAuth";
import { apiEndPoint } from "../services/api";

const tokenKey = 'token';

export const login = createAsyncThunk<string, LoginRequest, { rejectValue: LoginResponse["error"] }>(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const res = await axiosAuth.post<LoginResponse>(apiEndPoint.LOGIN, credentials);
            const { token, error } = res.data;
            if (error || !token) {
                return rejectWithValue(error || { message: "Đăng nhập thất bại" });
            }
            await AsyncStorage.setItem(tokenKey, token);
            return token;
        } catch (err: any) {
            return rejectWithValue(err || { message: "Lỗi kết nối server" });
        }
    }
);

const fetchUserData = async () => {
    const res = await axiosAuth.get<ApiUserResponse>(apiEndPoint.CURRENT_USER);
    const { userProfile, permissionListAll } = res.data;
    const user: User = { ...userProfile, permissionListAll };
    return user;
};

export const getCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
    "auth/getCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            return await fetchUserData();
        } catch (err: any) {
            return rejectWithValue("Không thể tải thông tin người dùng");
        }
    }
);

export const forceRefetchUser = createAsyncThunk<User, void, { rejectValue: string }>(
    "auth/forceRefetchUser",
    async (_, { rejectWithValue }) => {
        try {
            return await fetchUserData();
        } catch (err: any) {
            return rejectWithValue("Không thể tải thông tin người dùng");
        }
    }
);

function buildPermissionsMap(permissionListAll: PermissionModule[]): PermissionsMap {
    const map: PermissionsMap = {};
    if (!permissionListAll) return map;

    for (const module of permissionListAll) {
        if (!module || !Array.isArray(module.functions)) continue;
        for (const func of module.functions) {
            if (!func || !func.urlFunction) continue;
            const url = func.urlFunction;
            if (!map[url]) map[url] = {};
            if (!Array.isArray(func.actions)) continue;
            for (const act of func.actions) {
                if (act) map[url][act.name] = act.allowed;
            }
        }
    }
    return map;
}

function buildModuleMenu(permissionListAll: PermissionModule[]): ModuleMenu[] {
    if (!permissionListAll) return [];

    return permissionListAll
        .map(module => {
            if (!module || !Array.isArray(module.functions)) return null;
            const visibleFunctions = module.functions
                .filter(func =>
                    func && Array.isArray(func.actions) &&
                    func.actions.some(a => a.name === 'view' && a.allowed)
                )
                .map(func => ({
                    name: func.functionName,
                    url: func.urlFunction
                }));

            if (visibleFunctions.length > 0) {
                return {
                    moduleName: module.moduleName,
                    functions: visibleFunctions
                };
            }
            return null;
        })
        .filter((menuModule): menuModule is ModuleMenu => menuModule !== null);
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            AsyncStorage.removeItem(tokenKey);
            state.user = null;
            state.moduleMenu = [];
            state.permissionsMap = {};
            state.permissionsStale = false;
        },
        setPermissionsStale: (state, action: PayloadAction<boolean>) => {
            state.permissionsStale = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoginPending = true;
                state.loginError = undefined;
            })
            .addCase(login.fulfilled, (state) => {
                state.isLoginPending = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoginPending = false;
                state.loginError = action.payload || { message: "Đăng nhập thất bại" };
            })
            .addCase(getCurrentUser.pending, (state) => {
                if (!state.user) state.isInitializing = true;
            })
            .addCase(forceRefetchUser.pending, (state) => {
                state.isInitializing = true;
            })
            .addMatcher(
                (action) => action.type === getCurrentUser.fulfilled.type || action.type === forceRefetchUser.fulfilled.type,
                (state, action: { payload: User }) => {
                    state.user = action.payload;
                    state.permissionsMap = buildPermissionsMap(action.payload.permissionListAll);
                    state.moduleMenu = buildModuleMenu(action.payload.permissionListAll);
                    state.isInitializing = false;
                }
            )
            .addMatcher(
                (action) => action.type === getCurrentUser.rejected.type || action.type === forceRefetchUser.rejected.type,
                (state) => {
                    state.user = null;
                    state.moduleMenu = [];
                    state.permissionsMap = {};
                    state.isInitializing = false;
                    AsyncStorage.removeItem(tokenKey);
                }
            );
    },
});

export const { logout, setPermissionsStale } = authSlice.actions;
export default authSlice.reducer;
