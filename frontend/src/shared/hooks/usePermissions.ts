import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../features/auth/authSlice';

export const usePermissions = () => {
  const user = useAppSelector(selectUser);
  const permissions = user?.role?.permissions || {};

  const can = (resource: string, action: string): boolean => {
    if (!user) return false;
    const perms = permissions;
    if (perms['*']?.includes('*')) return true;
    const resourcePerms = perms[resource];
    if (!resourcePerms) return false;
    return resourcePerms.includes('*') || resourcePerms.includes(action);
  };

  return { can, permissions };
};
