import AsyncStorage from '@react-native-async-storage/async-storage';

const tokenKey = 'token';

export const useTokenStorage = () => {
    const setToken = async (token: string) => {
        try {
            await AsyncStorage.setItem(tokenKey, token);
        } catch (error) {
            console.error('Failed to set token:', error);
        }
    };

    const getToken = async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(tokenKey);
        } catch (error) {
            console.error('Failed to get token:', error);
            return null;
        }
    };

    const removeToken = async () => {
        try {
            await AsyncStorage.removeItem(tokenKey);
        } catch (error) {
            console.error('Failed to remove token:', error);
        }
    };

    return {
        setToken,
        getToken,
        removeToken,
    };
};
