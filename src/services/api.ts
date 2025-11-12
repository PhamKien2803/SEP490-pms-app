export const apiConfig = {
    // baseURL: import.meta.env.VITE_API_URL_PROD || "https://kingdergarten-api-gmena8b7cug2f4cr.southeastasia-01.azurewebsites.net/api/pms/",
    baseURL: "https://overly-ectodermoidal-brunilda.ngrok-free.dev/api/pms/",
};

export const apiEndPoint = {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    CURRENT_USER: "/auth/getCurrentUser",
    STUDENT_BY_PARENT: "/dashboard-parent/getStudentByParent",
    SC_BY_CLASS_MONTH: "/dashboard-schedules/getSchedulesByClassAndMonth",
    MENU_BY_AGE_DATE: "/dashboard-menus/getMenuByAgeAndDate",
    CLASS_BY_STU_SY: "/dashboard-class/getClassByStuAndSY",
    ATT_BY_STU_DATE: "/dashboard-attendances/getAttByStuAndDate",
    MED_BY_STUDENT: "/dashboard-medicals/getMedicalByStudent",
    FB_BY_STU_DATE: "/dashboard-feedbacks/getFbByStuAndDate",
    SY_LIST: "/dashboard-class/shoolYear/list",
}