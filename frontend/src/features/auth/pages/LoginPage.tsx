import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setTheme, selectTheme } from "../../../features/theme/themeSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Coffee, Eye, EyeOff, Sun, Moon, Monitor } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  login: z.string().min(1, "Логин обязателен"),
  password: z.string().min(1, "Пароль обязателен"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme);
  const [showPassword, setShowPassword] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate("/dashboard");
    } catch (error) {
      // Ошибка уже обработана в slice
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
          title="Тема оформления"
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

      <div className="w-full max-w-md">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-4">
            <Coffee className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Kontadoo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Вход в систему
          </p>
        </div>

        {/* Форма входа */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
            Вход в систему
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Логин */}
            <div>
              <label
                htmlFor="login"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Логин
              </label>
              <input
                id="login"
                type="text"
                placeholder="Введите логин"
                className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                  errors.login ? "border-red-300" : ""
                }`}
                {...register("login")}
              />
              {errors.login && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.login.message}
                </p>
              )}
            </div>

            {/* Пароль */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  className={`input-field pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                    errors.password ? "border-red-300" : ""
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Запомнить меня */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Запомнить меня
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Забыли пароль?
              </Link>
            </div>

            {/* Кнопка входа */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Вход...
                </span>
              ) : (
                "Войти"
              )}
            </button>
          </form>

          {/* Ссылка на регистрацию */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Нет аккаунта?{" "}
            <Link
              to="/register"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              Зарегистрировать бизнес
            </Link>
          </p>
        </div>

        {/* Демо-доступ */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Демо доступ:{" "}
            <button
              onClick={() => {
                toast.info("Логин: admin, Пароль: admin123");
              }}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Показать
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
