import { Check, Minus } from "lucide-react";

interface PermissionsMatrixProps {
  permissions: Record<string, string[]>;
  onToggle: (resource: string, action: string) => void;
  onSetFullAccess: (resource: string) => void;
  onSetReadOnly: (resource: string) => void;
  onRemoveResource: (resource: string) => void;
}

const RESOURCES = [
  {
    key: "dashboard",
    label: "Дашборд",
    description: "Главная страница и виджеты",
  },
  {
    key: "transactions",
    label: "Финансы",
    description: "Доходы, расходы, транзакции",
  },
  { key: "staff", label: "Сотрудники", description: "Управление персоналом" },
  { key: "roles", label: "Роли и доступ", description: "Настройка прав" },
  { key: "reports", label: "Отчёты", description: "Статистика и экспорт" },
  { key: "audit", label: "Аудит", description: "Журнал действий" },
  { key: "settings", label: "Настройки", description: "Параметры бизнеса" },
];

const ACTIONS = [
  {
    key: "create",
    label: "Создание",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    key: "read",
    label: "Чтение",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    key: "update",
    label: "Обновление",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  {
    key: "delete",
    label: "Удаление",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
];

export const PermissionsMatrix = ({
  permissions,
  onToggle,
  onSetFullAccess,
  onSetReadOnly,
  onRemoveResource,
}: PermissionsMatrixProps) => {
  const hasAction = (resource: string, action: string): boolean => {
    const actions = permissions[resource];
    if (!actions) return false;
    return actions.includes("*") || actions.includes(action);
  };

  const hasFullAccess = (resource: string): boolean => {
    const actions = permissions[resource];
    if (!actions) return false;
    return actions.includes("*");
  };

  const getResourceActions = (resource: string): string[] => {
    return permissions[resource] || [];
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Заголовок таблицы */}
      <div className="grid grid-cols-[200px_repeat(4,1fr)_100px_100px] bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
          Ресурс
        </div>
        {ACTIONS.map((action) => (
          <div
            key={action.key}
            className={`p-3 text-xs font-medium uppercase text-center dark:opacity-80 ${action.color}`}
          >
            {action.label}
          </div>
        ))}
        <div className="p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-center">
          Полный
        </div>
        <div className="p-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-center">
          Удалить
        </div>
      </div>

      {/* Строки ресурсов */}
      {RESOURCES.map((resource) => {
        const isFull = hasFullAccess(resource.key);
        const actions = getResourceActions(resource.key);
        const hasAny = actions.length > 0;

        return (
          <div
            key={resource.key}
            className={`grid grid-cols-[200px_repeat(4,1fr)_100px_100px] border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors ${
              hasAny ? "" : "opacity-50"
            }`}
          >
            {/* Название ресурса */}
            <div className="p-3 flex flex-col justify-center">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {resource.label}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {resource.description}
              </span>
            </div>

            {/* Чекбоксы действий */}
            {ACTIONS.map((action) => {
              const isChecked = hasAction(resource.key, action.key);
              const isDisabled = isFull;

              return (
                <div
                  key={action.key}
                  className="p-3 flex items-center justify-center"
                >
                  <button
                    onClick={() => onToggle(resource.key, action.key)}
                    className={`
                      w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all
                      ${
                        isChecked
                          ? `${action.bg} ${action.border} ${action.color} dark:bg-opacity-20`
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-transparent hover:border-gray-400 dark:hover:border-gray-500"
                      }
                    `}
                    title={`${action.label}: ${resource.label}`}
                  >
                    {isChecked && <Check size={16} />}
                  </button>
                </div>
              );
            })}

            {/* Кнопка "Полный доступ" */}
            <div className="p-3 flex items-center justify-center">
              <button
                onClick={() => onSetFullAccess(resource.key)}
                className={`
                  px-3 py-1 rounded-lg text-xs font-medium transition-all
                  ${
                    isFull
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                      : "border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-600 dark:hover:text-purple-400"
                  }
                `}
              >
                {isFull ? "Полный" : "Всё"}
              </button>
            </div>

            {/* Кнопка удаления ресурса */}
            <div className="p-3 flex items-center justify-center">
              {isFull ? (
                <button
                  onClick={() => onSetReadOnly(resource.key)}
                  className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-all"
                  title="Оставить только чтение"
                >
                  <Minus size={14} />
                </button>
              ) : (
                <button
                  onClick={() => onRemoveResource(resource.key)}
                  className="px-3 py-1 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-red-300 hover:text-red-500 transition-all"
                  title="Удалить все права"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Подсказка */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400">
        <p>
          💡 <strong>Подсказка:</strong> Нажмите на цветные ячейки чтобы
          добавить/убрать права. Кнопка "Всё" дает полный доступ к ресурсу.
        </p>
      </div>

      {/* JSON превью */}
      <div className="p-3 bg-gray-900 dark:bg-black text-gray-300 text-xs font-mono max-h-32 overflow-y-auto custom-scrollbar">
        <pre>{JSON.stringify(permissions, null, 2)}</pre>
      </div>
    </div>
  );
};
