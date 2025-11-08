export const apiConfig = {
    // baseURL: import.meta.env.VITE_API_URL_PROD || "https://kingdergarten-api-gmena8b7cug2f4cr.southeastasia-01.azurewebsites.net/api/pms/",
    baseURL: "http://localhost:9999/api/pms/",
};

export const apiEndPoint = {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    CURRENT_USER: "/auth/getCurrentUser",
}