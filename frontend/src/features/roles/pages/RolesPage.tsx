import { useState } from "react";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useCopyRoleMutation,
} from "../rolesApi";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import { Modal } from "../../../shared/ui/Modal";
import { ConfirmModal } from "../../../shared/ui/ConfirmModal";
import { PermissionsMatrix } from "../components/PermissionsMatrix";
import { Shield, Copy, Trash2, Edit3, Users } from "lucide-react";
import { toast } from "sonner";

export const RolesPage = () => {
  const { can } = usePermissions();
  const { data: roles, isLoading, isError } = useGetRolesQuery();

  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [copyRole] = useCopyRoleMutation();

  // Состояния модальных окон
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [deletingRole, setDeletingRole] = useState<any>(null);
  const [copyingRole, setCopyingRole] = useState<any>(null);

  // Состояние формы
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [copyName, setCopyName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Открытие создания
  const handleOpenCreate = () => {
    setRoleName("");
    setRoleDescription("");
    setPermissions({
      dashboard: ["read"],
    });
    setShowCreateModal(true);
  };

  // Открытие редактирования
  const handleOpenEdit = (role: any) => {
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setPermissions({ ...role.permissions });
    setEditingRole(role);
  };

  // Сохранение (создание или обновление)
  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error("Название роли обязательно");
      return;
    }

    setIsSaving(true);
    try {
      if (editingRole) {
        await updateRole({
          id: editingRole.id,
          data: {
            name: roleName,
            description: roleDescription,
            permissions,
          },
        }).unwrap();
        toast.success("Роль обновлена");
        setEditingRole(null);
      } else {
        await createRole({
          name: roleName,
          description: roleDescription,
          permissions,
        }).unwrap();
        toast.success("Роль создана");
        setShowCreateModal(false);
      }
    } catch (error: any) {
      toast.error(error.data?.error || "Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  // Удаление роли
  const handleDelete = async () => {
    if (!deletingRole) return;
    setIsDeleting(true);
    try {
      await deleteRole(deletingRole.id).unwrap();
      toast.success("Роль удалена");
      setDeletingRole(null);
    } catch (error: any) {
      toast.error(error.data?.error || "Ошибка удаления");
    } finally {
      setIsDeleting(false);
    }
  };

  // Копирование роли
  const handleCopy = async () => {
    if (!copyName.trim() || !copyingRole) {
      toast.error("Введите название новой роли");
      return;
    }
    setIsCopying(true);
    try {
      await copyRole({
        id: copyingRole.id,
        newName: copyName,
      }).unwrap();
      toast.success("Роль скопирована");
      setCopyingRole(null);
      setCopyName("");
    } catch (error: any) {
      toast.error(error.data?.error || "Ошибка копирования");
    } finally {
      setIsCopying(false);
    }
  };

  // Переключение права в матрице
  const togglePermission = (resource: string, action: string) => {
    setPermissions((prev) => {
      const current = { ...prev };
      if (!current[resource]) {
        current[resource] = [];
      }

      if (current[resource].includes(action)) {
        current[resource] = current[resource].filter((a) => a !== action);
        if (current[resource].length === 0) {
          delete current[resource];
        }
      } else {
        current[resource] = [...current[resource], action];
        // Если выбрали все действия — добавляем *
        const allActions = ["create", "read", "update", "delete"];
        if (allActions.every((a) => current[resource].includes(a))) {
          current[resource] = ["*"];
        }
      }

      return current;
    });
  };

  // Установка полного доступа для ресурса
  const setFullAccess = (resource: string) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: ["*"],
    }));
  };

  // Установка только чтения для ресурса
  const setReadOnly = (resource: string) => {
    setPermissions((prev) => ({
      ...prev,
      [resource]: ["read"],
    }));
  };

  // Удаление ресурса из прав
  const removeResource = (resource: string) => {
    setPermissions((prev) => {
      const current = { ...prev };
      delete current[resource];
      return current;
    });
  };

  return (
    <div>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Роли и доступ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Настройка прав для каждой роли в системе
          </p>
        </div>
        {can("roles", "create") && (
          <button
            onClick={handleOpenCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Shield size={18} />
            Создать роль
          </button>
        )}
      </div>

      {/* Загрузка */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Загрузка ролей...
            </p>
          </div>
        </div>
      )}

      {/* Ошибка */}
      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-6 rounded-lg text-center">
          <p className="font-medium">Ошибка загрузки ролей</p>
          <p className="text-sm mt-1">Проверьте подключение к серверу</p>
        </div>
      )}

      {/* Таблица ролей */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles?.map((role: any) => (
            <div
              key={role.id}
              className="card dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      role.is_system ? "bg-purple-900/10" : "bg-primary-900/10"
                    }`}
                  >
                    <Shield
                      className={`w-5 h-5 ${
                        role.is_system ? "text-purple-600" : "text-primary-600"
                      } `}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {role.name}
                    </h3>
                    {role.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>
                {role.is_system && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                    Системная
                  </span>
                )}
              </div>

              {/* Список прав (кратко) */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Права доступа:
                </p>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(role.permissions).length === 0 ? (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                      Нет прав
                    </span>
                  ) : (
                    Object.entries(role.permissions).map(
                      ([resource, actions]: [string, any]) => (
                        <span
                          key={resource}
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                          title={`${resource}: ${actions.join(", ")}`}
                        >
                          {resource}
                          {actions.includes("*")
                            ? " *"
                            : ` (${actions.length})`}
                        </span>
                      ),
                    )
                  )}
                </div>
              </div>

              {/* Количество пользователей и действия */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Users size={14} />
                  {role.usersCount || 0}
                </span>
                <div className="flex gap-1">
                  {can("roles", "update") && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(role)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        <Edit3
                          size={16}
                          className="text-gray-400 hover:text-gray-600"
                        />
                      </button>
                      <button
                        onClick={() => {
                          setCopyingRole(role);
                          setCopyName(`Копия ${role.name}`);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Копировать"
                      >
                        <Copy
                          size={16}
                          className="text-gray-400 hover:text-gray-600"
                        />
                      </button>
                    </>
                  )}
                  {can("roles", "delete") && !role.isSystem && (
                    <button
                      onClick={() => setDeletingRole(role)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2
                        size={16}
                        className="text-red-400 hover:text-red-600"
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания/редактирования роли */}
      <Modal
        isOpen={showCreateModal || !!editingRole}
        onClose={() => {
          setShowCreateModal(false);
          setEditingRole(null);
        }}
        title={editingRole ? "Редактировать роль" : "Создать роль"}
        size="xl"
      >
        <div className="space-y-4">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Название роли *
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              placeholder="Например: Старший кассир"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Описание
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              placeholder="Например: Старший кассир"
            />
          </div>

          {/* Матрица прав */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Права доступа
            </label>
            <PermissionsMatrix
              permissions={permissions}
              onToggle={togglePermission}
              onSetFullAccess={setFullAccess}
              onSetReadOnly={setReadOnly}
              onRemoveResource={removeResource}
            />
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setEditingRole(null);
              }}
              className="btn-secondary"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              {isSaving && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {editingRole ? "Сохранить" : "Создать"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно копирования */}
      <Modal
        isOpen={!!copyingRole}
        onClose={() => {
          setCopyingRole(null);
          setCopyName("");
        }}
        title="Копировать роль"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Копирование роли <strong>{copyingRole?.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Новое название *
            </label>
            <input
              type="text"
              value={copyName}
              onChange={(e) => setCopyName(e.target.value)}
              className="input-field"
              placeholder="Название новой роли"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setCopyingRole(null);
                setCopyName("");
              }}
              className="btn-secondary"
            >
              Отмена
            </button>
            <button
              onClick={handleCopy}
              disabled={isCopying}
              className="btn-primary"
            >
              {isCopying ? "Копирование..." : "Копировать"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Подтверждение удаления */}
      <ConfirmModal
        isOpen={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        onConfirm={handleDelete}
        title="Удалить роль?"
        message={`Вы уверены, что хотите удалить роль "${deletingRole?.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
};
