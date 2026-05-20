import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { usePermissions } from "../../shared/hooks/usePermissions";
import { useAuth } from "../../shared/hooks/useAuth";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Shield,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { ConfirmModal } from "../../shared/ui/ConfirmModal";

const menuItems = [
  {
    path: "/dashboard",
    label: "Дашборд",
    icon: LayoutDashboard,
    resource: "dashboard",
    action: "read" as const,
  },
  {
    path: "/transactions",
    label: "Финансы",
    icon: Receipt,
    resource: "transactions",
    action: "read" as const,
  },
  {
    path: "/users",
    label: "Сотрудники",
    icon: Users,
    resource: "staff",
    action: "read" as const,
  },
  {
    path: "/roles",
    label: "Роли и доступ",
    icon: Shield,
    resource: "roles",
    action: "read" as const,
  },
  {
    path: "/audit",
    label: "Журнал действий",
    icon: History,
    resource: "audit",
    action: "read" as const,
  },
  {
    path: "/settings",
    label: "Настройки",
    icon: Settings,
    resource: "settings",
    action: "read" as const,
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const visibleItems = menuItems.filter((item) =>
    can(item.resource, item.action),
  );

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
    }
  };

  return (
    <>
      <aside
        className={clsx(
          "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col transition-all duration-300",
          collapsed ? "w-20" : "w-64",
        )}
      >
        {/* Логотип */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Store className="w-8 h-8 text-primary-600" />
            {!collapsed && (
              <span className="font-bold text-xl text-gray-800 dark:text-gray-100">
                Kontadoo
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors dark:hover:bg-gray-700"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Информация о пользователе */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.role?.name}
            </p>
          </div>
        )}

        {/* Навигация */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/");

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={20} />
                    {!collapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Кнопка выхода */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={clsx(
              "flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full",
              collapsed ? "justify-center px-2 py-2" : "px-3 py-2.5",
            )}
            title={collapsed ? "Выйти" : undefined}
          >
            <LogOut size={20} />
            {!collapsed && <span className="font-medium">Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Модальное окно подтверждения выхода */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Выход из системы"
        message="Вы уверены, что хотите выйти из учётной записи? Все несохранённые данные будут потеряны."
        confirmText="Выйти"
        cancelText="Отмена"
        isLoading={isLoggingOut}
        variant="danger"
      />
    </>
  );
};
