import { useState, useEffect } from "react";
import { useAuth } from "../../../shared/hooks/useAuth";
import { useAppDispatch } from "../../../app/hooks";
import { setUser } from "../../auth/authSlice";
import { apiClient } from "../../../shared/lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Save,
  Globe,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  firstName: z.string().min(2, "Минимум 2 символа"),
  lastName: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Неверный email").optional().or(z.literal("")),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const SettingsPage = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"profile" | "business">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const response = await apiClient.get("/settings/business");
        setBusiness(response.data);
      } catch (error) {
        console.error("Failed to load business settings");
      }
    };
    loadBusiness();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const response = await apiClient.put("/settings/profile", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
      });

      dispatch(
        setUser({
          ...user,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          phone: response.data.user.phone,
        }),
      );

      toast.success("Профиль обновлён");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Настройки
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Управление профилем и бизнесом
        </p>
      </div>

      {/* Табы */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "profile"
              ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <User size={16} className="inline-block mr-2" />
          Мой профиль
        </button>
        <button
          onClick={() => setActiveTab("business")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "business"
              ? "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
        >
          <Building2 size={16} className="inline-block mr-2" />
          Бизнес
        </button>
      </div>

      {/* Вкладка "Мой профиль" */}
      {activeTab === "profile" && (
        <div className="max-w-2xl">
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {user?.role?.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Имя
                  </label>
                  <input
                    type="text"
                    {...register("firstName")}
                    className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${errors.firstName ? "border-red-300" : ""}`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    {...register("lastName")}
                    className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${errors.lastName ? "border-red-300" : ""}`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    type="email"
                    {...register("email")}
                    className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Телефон
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    type="tel"
                    {...register("phone")}
                    className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={!isDirty || isSaving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Сохранить
                </button>
              </div>
            </form>
          </div>

          {/* Информация о роли */}
          <div className="card dark:bg-gray-800 dark:border-gray-700 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-gray-500 dark:text-gray-400" />
              <h3 className="font-medium text-gray-800 dark:text-gray-100">
                Моя роль
              </h3>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {user?.role?.name}
                </p>
                {user?.role?.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.role?.description}
                  </p>
                )}
              </div>
              <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">
                Посмотреть права
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Вкладка "Бизнес" */}
      {activeTab === "business" && (
        <div className="max-w-2xl">
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Building2
                  size={32}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {business?.name || "Загрузка..."}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Тариф: Бесплатный
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Название бизнеса
                </label>
                <div className="relative">
                  <Building2
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    defaultValue={business?.name || ""}
                    className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email бизнеса
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    type="email"
                    defaultValue={business?.email || ""}
                    className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Телефон
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    type="tel"
                    defaultValue={business?.phone || ""}
                    className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Адрес
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <textarea
                    defaultValue={business?.address || ""}
                    className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="btn-primary flex items-center gap-2">
                  <Save size={18} />
                  Сохранить
                </button>
              </div>
            </div>
          </div>

          {/* Региональные настройки */}
          <div className="card dark:bg-gray-800 dark:border-gray-700 mt-6">
            <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-4">
              Региональные настройки
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Globe size={16} className="inline mr-1" />
                  Часовой пояс
                </label>
                <select
                  defaultValue="Europe/Moscow"
                  className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                >
                  <option value="Europe/Moscow">Москва (GMT+3)</option>
                  <option value="Europe/Kaliningrad">
                    Калининград (GMT+2)
                  </option>
                  <option value="Asia/Yekaterinburg">
                    Екатеринбург (GMT+5)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Clock size={16} className="inline mr-1" />
                  Формат даты
                </label>
                <select
                  defaultValue="DD.MM.YYYY"
                  className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                >
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
