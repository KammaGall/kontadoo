import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { usePermissions } from "../shared/hooks/usePermissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  resource?: string;
  action?: "create" | "read" | "update" | "delete";
}

export const ProtectedRoute = ({
  children,
  resource,
  action,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { can } = usePermissions();
  const location = useLocation();
  const hasToken = !!localStorage.getItem("kontadoo_access_token");

  // Загрузка
  if (isLoading && hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Не авторизован
  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверка прав
  if (resource && action && !can(resource, action)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Доступ запрещён
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            У вас нет прав для доступа к этой странице
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
