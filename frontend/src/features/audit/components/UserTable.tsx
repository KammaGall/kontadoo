import { useGetUsersQuery } from "../usersApi";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import { Pencil, Trash2, QrCode, Key, Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface UserTableProps {
  onEdit: (user: any) => void;
  onQR: (user: any) => void;
  onResetPassword: (user: any) => void;
}

export const UserTable = ({
  onEdit,
  onQR,
  onResetPassword,
}: UserTableProps) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useGetUsersQuery({
    page,
    limit: 10,
    search,
  });
  const { can } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Ошибка загрузки данных. Попробуйте позже.
      </div>
    );
  }

  const users = data?.users || [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Поиск */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск по имени, логину или email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md"
        />
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Сотрудник
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Логин
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Роль
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Статус
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Последний вход
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      {user.position && (
                        <p className="text-sm text-gray-500">{user.position}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {user.login}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role?.name || "Без роли"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Активен" : "Неактивен"}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString("ru-RU")
                    : "Никогда"}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/users/${user.id}`}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Просмотр"
                    >
                      <Eye size={18} className="text-gray-500" />
                    </Link>
                    {can("staff", "update") && (
                      <>
                        <button
                          onClick={() => onEdit(user)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Pencil size={18} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => onQR(user)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="QR-код"
                        >
                          <QrCode size={18} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => onResetPassword(user)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Сбросить пароль"
                        >
                          <Key size={18} className="text-gray-500" />
                        </button>
                      </>
                    )}
                    {can("staff", "delete") && (
                      <button
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Деактивировать"
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Всего: {pagination.total} сотрудников
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
            >
              Назад
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              {page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
            >
              Вперёд
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
