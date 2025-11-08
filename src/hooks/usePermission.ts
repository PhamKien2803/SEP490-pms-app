import { useAppSelector } from '../redux/hooks';

export const usePermission = () => {
    const permissions = useAppSelector((state) => state.auth.permissionsMap);
    const userRoles = useAppSelector((state) => state.auth.user?.roleList);

    const canAction = (urlFunction: string, actionName: string): boolean => {
        return permissions[urlFunction]?.[actionName] ?? false;
    };

    const hasRole = (roleId: string): boolean => {
        return userRoles?.includes(roleId) ?? false;
    };

    const hasFunction = (urlFunction: string): boolean => {
        const actions = permissions[urlFunction];
        if (!actions) return false;
        return Object.values(actions).some(allowed => allowed === true);
    };

    const getAllowedActions = (urlFunction: string): string[] => {
        const actions = permissions[urlFunction];
        if (!actions) return [];

        return Object.entries(actions)
            .filter(([_, isAllowed]) => isAllowed)
            .map(([actionName]) => actionName);
    };

    return {
        canAction,
        hasRole,
        hasFunction,
        getAllowedActions,
    };
};