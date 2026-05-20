import { useState } from "react";
import { Bell, X } from "lucide-react";
import { useGetAuditLogsQuery } from "../../features/audit/auditApi";

export const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Загружаем последние 5 записей аудита
  const { data } = useGetAuditLogsQuery({ page: 1, limit: 5 });

  const logs = data?.logs || [];

  // Форматируем как уведомления
  const notifications = logs.map((log: any) => {
    const actionLabels: Record<string, string> = {
      CREATE: "создал(а)",
      UPDATE: "изменил(а)",
      DELETE: "удалил(а)",
      LOGIN: "вошёл(ла) в систему",
      LOGOUT: "вышел(ла) из системы",
    };

    const entityLabels: Record<string, string> = {
      User: "сотрудника",
      Role: "роль",
      Transaction: "транзакцию",
      Business: "бизнес",
    };

    const action = actionLabels[log.action] || log.action;
    const entity = entityLabels[log.entity_type] || log.entity_type;
    const user = log.user
      ? `${log.user.first_name} ${log.user.last_name}`
      : "Система";

    return {
      id: log.id,
      text: `${user} ${action} ${entity}`,
      time: formatTimeAgo(log.created_at),
      type: getNotificationType(log.action),
    };
  });

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-gray-800 dark:text-gray-100">
                Уведомления
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                  Нет новых уведомлений
                </p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-50 dark:border-gray-700 last:border-0 cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notif.type === "success"
                            ? "bg-green-500"
                            : notif.type === "warning"
                              ? "bg-yellow-500"
                              : notif.type === "danger"
                                ? "bg-red-500"
                                : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {notif.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Вспомогательные функции
function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  if (days < 7) return `${days} дн назад`;

  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function getNotificationType(
  action: string,
): "success" | "warning" | "danger" | "info" {
  switch (action) {
    case "CREATE":
    case "LOGIN":
      return "success";
    case "UPDATE":
    case "GENERATE_QR":
    case "QR_LOGIN":
      return "info";
    case "DELETE":
    case "LOGIN_FAILED":
      return "danger";
    case "LOGOUT":
    case "EXPORT":
      return "warning";
    default:
      return "info";
  }
}
