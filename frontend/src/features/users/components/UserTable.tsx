import { useGetUsersQuery } from "../usersApi";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import {
  Pencil,
  QrCode,
  Key,
  Eye,
  UserX,
  UserCheck,
  Search,
  X,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface UserTableProps {
  onEdit: (user: any) => void;
  onQR: (user: any) => void;
  onResetPassword: (user: any) => void;
  onDeactivate: (user: any) => void;
  onReactivate: (user: any) => void;
  onPermanentDelete: (user: any) => void; // ← Добавить
}

export const UserTable = ({
  onEdit,
  onQR,
  onResetPassword,
  onDeactivate,
  onReactivate,
  onPermanentDelete,
}: UserTableProps) => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data, isLoading, isError, error } = useGetUsersQuery({
    page,
    limit: 10,
    search: debouncedSearch,
  });
  const { can } = usePermissions();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  };

  const users = data?.users || [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Поиск */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Поиск по имени, логину или email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {debouncedSearch && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Результаты поиска: {pagination?.total || 0} сотрудников
          </p>
        )}
      </div>

      {/* Загрузка */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Загрузка сотрудников...
            </p>
          </div>
        </div>
      )}

      {/* Ошибка */}
      {isError && !isLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-6 rounded-lg text-center">
          <p className="font-medium">Ошибка загрузки данных</p>
          <p className="text-sm mt-1">
            {error && "data" in error
              ? (error.data as any)?.error ||
                "Не удалось загрузить список сотрудников"
              : "Проверьте подключение к серверу"}
          </p>
        </div>
      )}

      {/* Пустое состояние */}
      {!isLoading && !isError && users.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-1">
            {debouncedSearch ? "Ничего не найдено" : "Нет сотрудников"}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {debouncedSearch
              ? "Попробуйте изменить поисковый запрос"
              : "Добавьте первого сотрудника, нажав кнопку выше"}
          </p>
          {debouncedSearch && (
            <button
              onClick={clearSearch}
              className="mt-3 text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium"
            >
              Сбросить поиск
            </button>
          )}
        </div>
      )}

      {/* Таблица */}
      {!isLoading && !isError && users.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Сотрудник
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Логин
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Последний вход
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            {user.first_name?.[0]}
                            {user.last_name?.[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user.first_name} {user.last_name}
                          </p>
                          {user.position && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.position}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                        {user.login}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {user.role?.name || "Без роли"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          user.is_active
                            ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
                        />
                        {user.is_active ? "Активен" : "Неактивен"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString(
                            "ru-RU",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/users/${user.id}`}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          title="Просмотр"
                        >
                          <Eye
                            size={17}
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                          />
                        </Link>
                        {can("staff", "update") && (
                          <>
                            {user.is_active ? (
                              <button
                                onClick={() => onDeactivate(user)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Деактивировать"
                              >
                                <UserX
                                  size={17}
                                  className="text-red-400 hover:text-red-600"
                                />
                              </button>
                            ) : (
                              <button
                                onClick={() => onReactivate(user)}
                                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Активировать"
                              >
                                <UserCheck
                                  size={17}
                                  className="text-green-400 hover:text-green-600"
                                />
                              </button>
                            )}

                            <button
                              onClick={() => onEdit(user)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              title="Редактировать"
                            >
                              <Pencil
                                size={17}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                              />
                            </button>
                            <button
                              onClick={() => onQR(user)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              title="QR-код"
                            >
                              <QrCode
                                size={17}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                              />
                            </button>
                            <button
                              onClick={() => onResetPassword(user)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              title="Сбросить пароль"
                            >
                              <Key
                                size={17}
                                className="text-red-400 dark:text-red-500 hover:text-gray-600 dark:hover:text-gray-300"
                              />
                            </button>
                            <button
                              onClick={() => onPermanentDelete(user)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Удалить навсегда"
                            >
                              <Trash2
                                size={17}
                                className="text-red-500 hover:text-red-700"
                              />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Всего:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {pagination.total}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                >
                  ← Назад
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                  {page} / {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.pages, p + 1))
                  }
                  disabled={page === pagination.pages}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                >
                  Вперёд →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Иконка для пустого состояния
const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);
