import { useState } from "react";
import { UserTable } from "../components/UserTable";
import { UserForm } from "../components/UserForm";
import { UserQRModal } from "../components/UserQRModal";
import { Modal } from "../../../shared/ui/Modal";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import { useResetPasswordMutation } from "../usersApi";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Users } from "lucide-react";

import {
  useDeactivateUserMutation,
  useReactivateUserMutation,
  usePermanentDeleteUserMutation,
} from "../usersApi";
import { ConfirmModal } from "../../../shared/ui/ConfirmModal";

export const UsersPage = () => {
  const { can } = usePermissions();

  // Состояния для модальных окон
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [qrUser, setQrUser] = useState<any>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<any>(null);

  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    reset: resetForm,
  } = useForm<{ newPassword: string }>();

  const handleResetPassword = async (data: { newPassword: string }) => {
    if (!resetPasswordUser) return;
    try {
      await resetPassword({
        userId: resetPasswordUser.id,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success("Пароль сброшен");
      setResetPasswordUser(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.data?.error || "Ошибка сброса пароля");
    }
  };

  const [deactivateUser, { isLoading: isDeactivating }] =
    useDeactivateUserMutation();
  const [reactivateUser, { isLoading: isReactivating }] =
    useReactivateUserMutation();

  const [deactivatingUser, setDeactivatingUser] = useState<any>(null);
  const [reactivatingUser, setReactivatingUser] = useState<any>(null);

  const handleDeactivate = async () => {
    if (!deactivatingUser) return;
    try {
      await deactivateUser(deactivatingUser.id).unwrap();
      toast.success("Сотрудник деактивирован");
      setDeactivatingUser(null);
    } catch (error: any) {
      toast.error(error.data?.error || "Ошибка деактивации");
    }
  };

  const [permanentDeleteUser, { isLoading: isDeleting }] =
    usePermanentDeleteUserMutation();
  const [permanentDeletingUser, setPermanentDeletingUser] = useState<any>(null);

  const handlePermanentDelete = async () => {
    if (!permanentDeletingUser) return;
    try {
      await permanentDeleteUser(permanentDeletingUser.id).unwrap();
      toast.success("Сотрудник удалён навсегда");
      setPermanentDeletingUser(null);
    } catch (error: any) {
      toast.error(error.data?.error || "Ошибка удаления");
    }
  };

  const handleReactivate = async () => {
    if (!reactivatingUser) return;
    try {
      await reactivateUser(reactivatingUser.id).unwrap();
      toast.success("Сотрудник активирован");
      setReactivatingUser(null);
    } catch (error: any) {
      toast.error(error.data?.error || "Ошибка активации");
    }
  };

  return (
    <div>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Сотрудники
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Управление персоналом и доступом
          </p>
        </div>
        {can("staff", "create") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Users size={18} />
            Добавить сотрудника
          </button>
        )}
      </div>

      {/* Таблица */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <UserTable
          onEdit={setEditingUser}
          onQR={setQrUser}
          onResetPassword={setResetPasswordUser}
          onDeactivate={setDeactivatingUser} // ✅
          onReactivate={setReactivatingUser}
          onPermanentDelete={setPermanentDeletingUser}
        />
      </div>

      {/* Подтверждение полного удаления */}
      <ConfirmModal
        isOpen={!!permanentDeletingUser}
        onClose={() => setPermanentDeletingUser(null)}
        onConfirm={handlePermanentDelete}
        title="Удалить сотрудника навсегда?"
        message={`Все данные сотрудника ${permanentDeletingUser?.first_name} ${permanentDeletingUser?.last_name} будут безвозвратно удалены. Это действие нельзя отменить.`}
        confirmText="Удалить навсегда"
        cancelText="Отмена"
        isLoading={isDeleting}
        variant="danger"
      />

      <ConfirmModal
        isOpen={!!deactivatingUser}
        onClose={() => setDeactivatingUser(null)}
        onConfirm={handleDeactivate}
        title="Деактивировать сотрудника?"
        message={`Сотрудник ${deactivatingUser?.first_name} ${deactivatingUser?.last_name} больше не сможет войти в систему.`}
        confirmText="Деактивировать"
        cancelText="Отмена"
        isLoading={isDeactivating}
        variant="warning"
      />

      <ConfirmModal
        isOpen={!!reactivatingUser}
        onClose={() => setReactivatingUser(null)}
        onConfirm={handleReactivate}
        title="Активировать сотрудника?"
        message={`Сотрудник ${reactivatingUser?.first_name} ${reactivatingUser?.last_name} снова получит доступ к системе.`}
        confirmText="Активировать"
        cancelText="Отмена"
        isLoading={isReactivating}
        variant="info"
      />

      {/* Модальное окно создания */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Добавить сотрудника"
        size="lg"
      >
        <UserForm
          onSuccess={() => {
            setShowCreateModal(false);
            toast.success("Сотрудник создан");
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Модальное окно редактирования */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Редактировать сотрудника"
        size="lg"
      >
        {editingUser && (
          <UserForm
            user={editingUser}
            onSuccess={() => {
              setEditingUser(null);
              toast.success("Сотрудник обновлён");
            }}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </Modal>

      {/* Модальное окно QR-кода */}
      <UserQRModal
        user={qrUser}
        isOpen={!!qrUser}
        onClose={() => setQrUser(null)}
      />

      {/* Модальное окно сброса пароля */}
      <Modal
        isOpen={!!resetPasswordUser}
        onClose={() => {
          setResetPasswordUser(null);
          resetForm();
        }}
        title="Сброс пароля"
      >
        <form
          onSubmit={handleSubmit(handleResetPassword)}
          className="space-y-4"
        >
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Новый пароль для сотрудника:
            </p>
            <p className="font-medium text-gray-800 mb-4">
              {resetPasswordUser?.firstName} {resetPasswordUser?.lastName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Новый пароль *
            </label>
            <input
              type="password"
              {...register("newPassword", {
                required: "Обязательное поле",
                minLength: { value: 6, message: "Минимум 6 символов" },
              })}
              placeholder="Минимум 6 символов"
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setResetPasswordUser(null);
                resetForm();
              }}
              className="btn-secondary"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isResetting}
              className="btn-primary"
            >
              {isResetting ? "Сброс..." : "Сбросить пароль"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
