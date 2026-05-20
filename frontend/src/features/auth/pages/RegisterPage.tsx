import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setTheme, selectTheme } from "../../../features/theme/themeSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Coffee,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

// Схема валидации
const registerSchema = z.object({
  businessName: z.string().min(2, "Название бизнеса обязательно"),
  businessEmail: z.string().email("Неверный email"),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  adminFirstName: z.string().min(2, "Имя обязательно"),
  adminLastName: z.string().min(2, "Фамилия обязательна"),
  adminLogin: z
    .string()
    .min(3, "Минимум 3 символа")
    .regex(/^[a-zA-Z0-9_]+$/, "Только буквы, цифры и _"),
  adminPassword: z.string().min(6, "Минимум 6 символов"),
  adminEmail: z.string().email("Неверный email").optional().or(z.literal("")),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme);
  const [showPassword, setShowPassword] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [step, setStep] = useState(1); // 1 - бизнес, 2 - админ

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const watchBusinessName = watch("businessName");
  const watchBusinessEmail = watch("businessEmail");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        businessName: data.businessName,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone || undefined,
        businessAddress: data.businessAddress || undefined,
        adminFirstName: data.adminFirstName,
        adminLastName: data.adminLastName,
        adminLogin: data.adminLogin,
        adminPassword: data.adminPassword,
        adminEmail: data.adminEmail || undefined,
      });
      navigate("/dashboard");
    } catch (error) {
      // Ошибка уже обработана в slice
    }
  };

  const handleNextStep = async () => {
    const fields: (keyof RegisterFormData)[] =
      step === 1
        ? ["businessName", "businessEmail"]
        : ["adminFirstName", "adminLastName", "adminLogin", "adminPassword"];

    const isValid = await trigger(fields);
    if (isValid) {
      setStep(2);
    }
  };

  const themes = [
    { value: "light" as const, icon: Sun, label: "Светлая" },
    { value: "dark" as const, icon: Moon, label: "Тёмная" },
    { value: "system" as const, icon: Monitor, label: "Системная" },
  ];

  const currentThemeInfo =
    themes.find((t) => t.value === currentTheme) || themes[0];
  const CurrentThemeIcon = currentThemeInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Переключатель темы */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowThemeMenu(!showThemeMenu)}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-300"
        >
          <CurrentThemeIcon size={20} />
        </button>

        {showThemeMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowThemeMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
              {themes.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    dispatch(setTheme(value));
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    currentTheme === value
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  {currentTheme === value && (
                    <span className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="w-full max-w-lg">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-4">
            <Coffee className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Kontadoo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Регистрация нового бизнеса
          </p>
        </div>

        {/* Шаги */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              step === 1
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            <Building2 size={16} />
            Бизнес
          </div>
          <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600" />
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              step === 2
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            <User size={16} />
            Администратор
          </div>
        </div>

        {/* Форма */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Информация о бизнесе
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
                  Эти данные будут использоваться в системе учёта
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Название бизнеса *
                  </label>
                  <div className="relative">
                    <Building2
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      size={18}
                    />
                    <input
                      type="text"
                      {...register("businessName")}
                      className={`input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${errors.businessName ? "border-red-300" : ""}`}
                      placeholder='Например, Кофейня "Аромат"'
                    />
                  </div>
                  {errors.businessName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email бизнеса *
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      size={18}
                    />
                    <input
                      type="email"
                      {...register("businessEmail")}
                      className={`input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${errors.businessEmail ? "border-red-300" : ""}`}
                      placeholder="contact@business.ru"
                    />
                  </div>
                  {errors.businessEmail && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.businessEmail.message}
                    </p>
                  )}
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
                      {...register("businessPhone")}
                      className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      placeholder="+7 (999) 123-45-67"
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
                      {...register("businessAddress")}
                      className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      rows={2}
                      placeholder="г. Москва, ул. Тверская, д. 15"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary w-full mt-2"
                >
                  Далее
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Администратор
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
                  Создайте учётную запись для входа в систему
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Имя *
                    </label>
                    <input
                      type="text"
                      {...register("adminFirstName")}
                      className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${errors.adminFirstName ? "border-red-300" : ""}`}
                      placeholder="Иван"
                    />
                    {errors.adminFirstName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.adminFirstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      {...register("adminLastName")}
                      className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${errors.adminLastName ? "border-red-300" : ""}`}
                      placeholder="Иванов"
                    />
                    {errors.adminLastName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.adminLastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Логин *
                  </label>
                  <input
                    type="text"
                    {...register("adminLogin")}
                    className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${errors.adminLogin ? "border-red-300" : ""}`}
                    placeholder="ivanov"
                  />
                  {errors.adminLogin && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.adminLogin.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Пароль *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("adminPassword")}
                      className={`input-field pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${errors.adminPassword ? "border-red-300" : ""}`}
                      placeholder="Минимум 6 символов"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.adminPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.adminPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email (необязательно)
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      size={18}
                    />
                    <input
                      type="email"
                      {...register("adminEmail")}
                      className="input-field pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      placeholder="admin@business.ru"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1"
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex-1"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Регистрация...
                      </span>
                    ) : (
                      "Зарегистрировать"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Ссылка на вход */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Уже есть аккаунт?{" "}
          <Link
            to="/login"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};
