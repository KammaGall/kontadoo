import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateUserMutation, useUpdateUserMutation } from "../usersApi";
import { useGetRolesQuery } from "../../roles/rolesApi";
import { toast } from "sonner";

const userSchema = z.object({
  firstName: z.string().min(2, "Минимум 2 символа"),
  lastName: z.string().min(2, "Минимум 2 символа"),
  login: z
    .string()
    .min(3, "Минимум 3 символа")
    .regex(/^[a-zA-Z0-9_]+$/, "Только буквы, цифры и _"),
  password: z.string().min(6, "Минимум 6 символов").optional(),
  email: z.string().email("Неверный email").optional().or(z.literal("")),
  phone: z.string().optional(),
  roleId: z.string().min(1, "Выберите роль"),
  position: z.string().optional(),
  hire_date: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserForm = ({ user, onSuccess, onCancel }: UserFormProps) => {
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const { data: roles, isLoading: rolesLoading } = useGetRolesQuery();

  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          login: user.login || "",
          email: user.email || "",
          phone: user.phone || "",
          roleId: user.role?.id || "",
          position: user.position || "",
        }
      : {
          firstName: "",
          lastName: "",
          login: "",
          password: "",
          email: "",
          phone: "",
          roleId: "",
          position: "",
        },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      if (user) {
        await updateUser({
          id: user.id,
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || undefined,
            phone: data.phone || undefined,
            roleId: data.roleId,
            position: data.position || undefined,
          },
        }).unwrap();
        toast.success("Сотрудник обновлён");
      } else {
        await createUser({
          firstName: data.firstName,
          lastName: data.lastName,
          login: data.login,
          password: data.password!,
          email: data.email || undefined,
          phone: data.phone || undefined,
          roleId: data.roleId,
          position: data.position || undefined,
        } as any).unwrap();
        toast.success("Сотрудник создан");
      }
      onSuccess();
    } catch (error: any) {
      const message =
        error?.data?.error || error?.data?.details?.[0]?.message || "Ошибка";
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Имя *
          </label>
          <input
            type="text"
            {...register("firstName")}
            className={`input-field ${errors.first_name ? "border-red-300 focus:ring-red-500" : ""} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
            placeholder="Иван"
            value={user?.first_name}
          />
          {errors.first_name && (
            <p className="mt-1 text-xs text-red-600">
              {errors.first_name.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Фамилия *
          </label>
          <input
            type="text"
            {...register("lastName")}
            className={`input-field ${errors.lastName ? "border-red-300 focus:ring-red-500" : ""} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
            placeholder="Иванов"
            value={user?.last_name}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Логин *
          </label>
          <input
            type="text"
            {...register("login")}
            disabled={!!user}
            className={`input-field ${errors.login ? "border-red-300" : ""} ${user ? "bg-gray-100 cursor-not-allowed" : ""} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
            placeholder="ivanov"
          />
          {errors.login && (
            <p className="mt-1 text-xs text-red-600">{errors.login.message}</p>
          )}
          {user && (
            <p className="mt-1 text-xs text-gray-400">Логин нельзя изменить</p>
          )}
        </div>
        {!user && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Пароль *
            </label>
            <input
              type="password"
              {...register("password")}
              className={`input-field ${errors.password ? "border-red-300" : ""} dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
              placeholder="Минимум 6 символов"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            placeholder="ivan@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Телефон
          </label>
          <input
            type="tel"
            {...register("phone")}
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            placeholder="+7 (999) 123-45-67"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Роль *
          </label>
          <select
            {...register("roleId")}
            className={`input-field ${errors.roleId ? "border-red-300" : ""} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
            disabled={rolesLoading}
          >
            <option value="">
              {rolesLoading ? "Загрузка..." : "Выберите роль"}
            </option>
            {roles?.map((role: any) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.roleId && (
            <p className="mt-1 text-xs text-red-600 ">
              {errors.roleId.message}{" "}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Должность
          </label>
          <input
            type="text"
            {...register("position")}
            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            placeholder="Менеджер"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isLoading}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex items-center gap-2"
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {user ? "Сохранить" : "Создать"}
        </button>
      </div>
    </form>
  );
};
