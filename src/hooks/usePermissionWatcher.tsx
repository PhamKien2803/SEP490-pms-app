import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { getCurrentUser, setPermissionsStale } from '../redux/authSlice';

export const usePermissionWatcher = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const previousPermissionsRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user && !user.isAdmin) {
                dispatch(getCurrentUser());
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user, dispatch]);

    useEffect(() => {
        if (user && !user.isAdmin) {
            const currentPermissions = JSON.stringify(user.permissionListAll);

            if (previousPermissionsRef.current !== undefined && previousPermissionsRef.current !== currentPermissions) {
                dispatch(setPermissionsStale(true));
            }

            previousPermissionsRef.current = currentPermissions;
        }
    }, [user, dispatch]);
};