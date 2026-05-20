import { useAuth } from "../../shared/hooks/useAuth";
import { Bell, Search, UserCircle } from "lucide-react";
import { useState } from "react";
import { data, useNavigate } from "react-router-dom";
import { ConfirmModal } from "../../shared/ui/ConfirmModal";
import { Notifications } from "./Notifications";
import { ThemeToggle } from "../../shared/ui/ThemeToggle";
import { useGetUserByIdQuery } from "@/features/users/usersApi";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      setShowUserMenu(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
        {/* Левая часть */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Kontadoo
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
              weekday: "long",
            })}
          </span>
        </div>

        {/* Правая часть */}
        <div className="flex items-center gap-4">
          {/* Поиск */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Поиск..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Уведомления */}
          <Notifications />

          <ThemeToggle />

          {/* Профиль пользователя */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.firstName || "Пользователь"}
              </span>
            </button>

            {/* Выпадающее меню */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role?.name || "Пользователь"}
                    </p>
                  </div>
                  {/* <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Профиль
                  </button> */}
                  <Link to={`/users/${user?.id}`}>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      Профиль
                    </button>
                  </Link>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Настройки
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowLogoutConfirm(true);
                    }}
                  >
                    Выйти
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Модальное окно подтверждения выхода */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Выход из системы"
        message="Вы уверены, что хотите выйти из учётной записи?"
        confirmText="Выйти"
        cancelText="Отмена"
        isLoading={isLoggingOut}
        variant="danger"
      />
    </>
  );
};
