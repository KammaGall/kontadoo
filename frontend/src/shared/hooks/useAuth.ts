import { useAppSelector, useAppDispatch } from "../../app/hooks";
import {
  login,
  register,
  logout,
  getCurrentUser,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
} from "../../features/auth/authSlice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);

  return {
    user,
    isAuthenticated,
    isLoading,
    login: (credentials: any) => dispatch(login(credentials)).unwrap(),
    register: (data: any) => dispatch(register(data)).unwrap(), // ← Убедись, что это есть
    logout: () => dispatch(logout()),
    fetchCurrentUser: () => dispatch(getCurrentUser()).unwrap(),
  };
};
