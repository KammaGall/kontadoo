import { useParams, Link } from "react-router-dom";
import { useGetUserByIdQuery, useGetUserStatsQuery } from "../usersApi";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import { useGenerateQRMutation } from "../usersApi";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  TrendingUp,
  TrendingDown,
  QrCode,
  Clock,
  User,
  Briefcase,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { can } = usePermissions();
  const { data: userData, isLoading } = useGetUserByIdQuery(id!);
  const { data: stats } = useGetUserStatsQuery(id!);
  const [generateQR, { isLoading: isGeneratingQR }] = useGenerateQRMutation();
  const [qrCode, setQrCode] = useState<string | null>(null);

  const user = userData?.user || userData;

  console.log(user);

  // console.log(id);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const handleGenerateQR = async () => {
    if (!id) return;
    try {
      const result = await generateQR(id).unwrap();
      setQrCode(result.qrCode);
      toast.success("QR-код сгенерирован");
    } catch (error: any) {
      toast.error("Ошибка генерации QR");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Сотрудник не найден
        </p>
        <Link
          to="/users"
          className="text-primary-600 hover:text-primary-700 mt-2 inline-block"
        >
          Вернуться к списку
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link
          to="/users"
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <ArrowLeft size={16} />
          Сотрудники
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          {user.first_name} {user.last_name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Профиль */}
        <div className="lg:col-span-1">
          <div className="card dark:bg-gray-800 dark:border-gray-700 text-center">
            {/* Аватар */}
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {user.first_name} {user.last_name}
            </h2>
            {user.position && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {user.position}
              </p>
            )}

            {/* Статус */}
            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active
                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
                />
                {user.is_active ? "Активен" : "Неактивен"}
              </span>
            </div>

            {/* Контакты */}
            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Mail
                  size={16}
                  className="text-gray-400 dark:text-gray-500 flex-shrink-0"
                />
                <span className="text-gray-600 dark:text-gray-300">
                  {user.email || "—"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone
                  size={16}
                  className="text-gray-400 dark:text-gray-500 flex-shrink-0"
                />
                <span className="text-gray-600 dark:text-gray-300">
                  {user.phone || "—"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar
                  size={16}
                  className="text-gray-400 dark:text-gray-500 flex-shrink-0"
                />
                <span className="text-gray-600 dark:text-gray-300">
                  Принят: {formatDate(user.hire_date)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock
                  size={16}
                  className="text-gray-400 dark:text-gray-500 flex-shrink-0"
                />
                <span className="text-gray-600 dark:text-gray-300">
                  Последний вход:{" "}
                  {user.last_login ? formatDate(user.last_login) : "Никогда"}
                </span>
              </div>
            </div>

            {/* QR-код */}
            {can("staff", "update") && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                {qrCode ? (
                  <div>
                    <img src={qrCode} alt="QR" className="mx-auto w-48 h-48" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Действителен 24 часа
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateQR}
                    disabled={isGeneratingQR}
                    className="btn-secondary flex items-center gap-2 mx-auto"
                  >
                    <QrCode size={16} />
                    {isGeneratingQR ? "Генерация..." : "Сгенерировать QR-код"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Статистика и активность */}
        <div className="lg:col-span-2 space-y-6">
          {/* Карточки статистики */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp
                    size={20}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Доходов
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {formatAmount(stats?.stats?.income?.total || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <TrendingDown
                    size={20}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Расходов
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {formatAmount(stats?.stats?.expense?.total || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Activity
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Операций
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {stats?.stats?.income?.count +
                      stats?.stats?.expense?.count || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Роль */}
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-gray-400" />
              Роль и права
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                {user.role?.name}
              </span>
              {user.role?.description && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {user.role?.description}
                </span>
              )}
            </div>
            {user.role?.permissions && (
              <div className="flex flex-wrap gap-1">
                {Object.entries(user.role.permissions).map(
                  ([resource, actions]: [string, any]) => (
                    <span
                      key={resource}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                    >
                      {resource}:{" "}
                      {actions.includes("*")
                        ? "Полный доступ"
                        : actions.join(", ")}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Последние транзакции */}
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-gray-400" />
              Последние операции
            </h3>
            {stats?.recentTransactions?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Дата
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Тип
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Категория
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Сумма
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {stats.recentTransactions.map((tx: any) => (
                      <tr key={tx.id}>
                        <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-300">
                          {new Date(
                            tx.transaction_date || tx.transactionDate,
                          ).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`text-xs font-medium ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}
                          >
                            {tx.type === "income" ? "Доход" : "Расход"}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-300">
                          {tx.category}
                        </td>
                        <td className="py-2 px-3 text-right text-sm font-medium text-gray-800 dark:text-gray-100">
                          {formatAmount(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Нет операций
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
