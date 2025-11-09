import { useMemo } from 'react';
import { usePermission } from './usePermission';
import { useCurrentUrlFunction } from '../context/PermissionContext';

export const usePagePermission = () => {
    const { canAction } = usePermission();
    const urlFunction = useCurrentUrlFunction();

    const permissions = useMemo(() => {
        if (!urlFunction) {
            return {
                canView: false,
                canCreate: false,
                canUpdate: false,
                canDelete: false,
                canApprove: false,
                canExportfile: false,
                canImportfile: false,
                canReject: false,
                canApproveAll: false,
                canSyncData: false,
                canLock: false,
                canUnLock: false,
                canConfirm: false
            };
        }

        return {
            canView: canAction(urlFunction, 'view'),
            canCreate: canAction(urlFunction, 'create'),
            canUpdate: canAction(urlFunction, 'update'),
            canDelete: canAction(urlFunction, 'delete'),
            canApprove: canAction(urlFunction, 'approve'),
            canExportfile: canAction(urlFunction, 'export'),
            canImportfile: canAction(urlFunction, 'import'),
            canReject: canAction(urlFunction, 'reject'),
            canApproveAll: canAction(urlFunction, 'approve_all'),
            canSyncData: canAction(urlFunction, 'sync_data'),
            canLock: canAction(urlFunction, 'lock'),
            canUnLock: canAction(urlFunction, 'un_lock'),
            canConfirm: canAction(urlFunction, 'confirm'),
        };
    }, [canAction, urlFunction]);

    return permissions;
};