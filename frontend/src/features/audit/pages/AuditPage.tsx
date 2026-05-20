import { useState } from "react";
import { useGetAuditLogsQuery } from "../auditApi";
import {
  History,
  ChevronDown,
  ChevronUp,
  User,
  FileText,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

const ACTION_ICONS: Record<string, any> = {
  CREATE: {
    icon: Plus,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    label: "Создание",
  },
  UPDATE: {
    icon: Edit,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    label: "Изменение",
  },
  DELETE: {
    icon: Trash2,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    label: "Удаление",
  },
  LOGIN: {
    icon: LogIn,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    label: "Вход",
  },
  LOGOUT: {
    icon: LogOut,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    label: "Выход",
  },
  EXPORT: {
    icon: FileText,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    label: "Экспорт",
  },
  GENERATE_QR: {
    icon: RefreshCw,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/20",
    label: "QR-код",
  },
  LOGIN_FAILED: {
    icon: LogIn,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    label: "Ошибка входа",
  },
  QR_LOGIN: {
    icon: RefreshCw,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/20",
    label: "Вход по QR",
  },
};

export const AuditPage = () => {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [userId, setUserId] = useState("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const { data, isLoading, isError } = useGetAuditLogsQuery({
    page,
    limit: 20,
    action: action || undefined,
    entityType: entityType || undefined,
    userId: userId || undefined,
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination;
  const hasActiveFilters = action || entityType || userId;

  const resetFilters = () => {
    setAction("");
    setEntityType("");
    setUserId("");
    setPage(1);
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const getActionInfo = (actionName: string) => {
    return (
      ACTION_ICONS[actionName] || {
        icon: FileText,
        color: "text-gray-600 dark:text-gray-400",
        bg: "bg-gray-50 dark:bg-gray-800",
        label: actionName,
      }
    );
  };

  return (
    <div>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Журнал действий
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            История всех операций в системе
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <History size={16} />
          <span>Последние записи</span>
        </div>
      </div>

      {/* Фильтры */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Действие
            </label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className="input-field text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="">Все действия</option>
              {Object.entries(ACTION_ICONS).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Тип сущности
            </label>
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
              className="input-field text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="">Все типы</option>
              <option value="User">Пользователи</option>
              <option value="Role">Роли</option>
              <option value="Transaction">Транзакции</option>
              <option value="Business">Бизнес</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Пользователь
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={16}
              />
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setPage(1);
                }}
                placeholder="ID пользователя..."
                className="input-field text-sm pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <X size={14} />
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Загрузка журнала...
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-6 rounded-lg text-center">
            <p className="font-medium">Ошибка загрузки</p>
            <p className="text-sm mt-1">Проверьте подключение к серверу</p>
          </div>
        )}

        {!isLoading && !isError && logs.length === 0 && (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-1">
              {hasActiveFilters ? "Ничего не найдено" : "Журнал пуст"}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {hasActiveFilters
                ? "Попробуйте изменить фильтры"
                : "Здесь будут отображаться все действия"}
            </p>
          </div>
        )}

        {!isLoading && !isError && logs.length > 0 && (
          <>
            <div className="space-y-3">
              {logs.map((log: any) => {
                const actionInfo = getActionInfo(log.action);
                const ActionIcon = actionInfo.icon;
                const isExpanded = expandedLog === log.id;

                return (
                  <div
                    key={log.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer"
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    >
                      <div
                        className={`w-9 h-9 ${actionInfo.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <ActionIcon size={18} className={actionInfo.color} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800 dark:text-gray-100">
                            {actionInfo.label}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            •
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {log.entity_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {log.user
                              ? `${log.user.first_name} ${log.user.last_name}`
                              : "Система"}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      </div>

                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                ID записи
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                {log.id}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Тип сущности
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {log.entity_type}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                ID сущности
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                {log.entity_id || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                IP адрес
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                {log.ip_address || "—"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Пользователь
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {log.user
                                  ? `${log.user.first_name} ${log.user.last_name} (${log.user.login})`
                                  : "Система"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Дата и время
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {formatDate(log.created_at)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                User Agent
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {log.user_agent || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Метаданные
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {log.metadata
                                  ? JSON.stringify(log.metadata)
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                              Изменения:
                            </p>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-2">
                              {Object.entries(log.changes).map(
                                ([field, change]: [string, any]) => (
                                  <div key={field} className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      {field}:
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-mono">
                                        {JSON.stringify(change.from)}
                                      </span>
                                      <span className="text-gray-400">→</span>
                                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-mono">
                                        {JSON.stringify(change.to)}
                                      </span>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Пагинация */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Всего записей:{" "}
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
    </div>
  );
};
