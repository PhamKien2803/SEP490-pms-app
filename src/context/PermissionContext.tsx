import { createContext, useContext } from 'react';

const PagePermissionContext = createContext<string | null>(null);
export const PagePermissionProvider = PagePermissionContext.Provider;
export const useCurrentUrlFunction = () => {
    const urlFunction = useContext(PagePermissionContext);
    if (urlFunction === null) {
        console.warn('useCurrentUrlFunction must be used within a PagePermissionProvider');
    }
    return urlFunction;
};