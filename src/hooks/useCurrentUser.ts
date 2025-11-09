import { useAppSelector } from '../redux/hooks';

export function useCurrentUser() {
    const user = useAppSelector((state) => state.auth.user);

    if (!user) {
        throw new Error('useCurrentUser must be used when user is authenticated');
    }

    return user;
}
