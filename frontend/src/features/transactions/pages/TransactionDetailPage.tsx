import { useNavigate, Link, useParams } from "react-router-dom";
import { useGetTransactionsQuery } from "../transactionsApi";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  CreditCard,
  Hash,
  FileText,
  Clock,
} from "lucide-react";

export const TransactionDetailPage = () => {
  const { id } = useParams();

  // Загружаем все транзакции и ищем нужную
  const { data, isLoading } = useGetTransactionsQuery({ page: 1, limit: 1000 });
  const transaction = data?.transactions?.find((tx: any) => tx.id === id);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const paymentMethodLabels: Record<string, string> = {
    cash: "Наличные",
    card: "Карта",
    transfer: "Перевод",
    other: "Другое",
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Транзакция не найдена
        </p>
        <Link
          to="/transactions"
          className="text-primary-600 hover:text-primary-700 mt-2 inline-block"
        >
          Вернуться к списку
        </Link>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Транзакция не найдена</p>
        <Link to="/transactions" className="text-primary-600">
          Вернуться
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link
          to="/transactions"
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <ArrowLeft size={16} />
          Финансы
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          Транзакция #
          {transaction.receipt_number || transaction.id?.slice(0, 8)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2">
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            {/* Тип и сумма */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    transaction.type === "income"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {transaction.type === "income" ? (
                    <TrendingUp
                      size={24}
                      className="text-green-600 dark:text-green-400"
                    />
                  ) : (
                    <TrendingDown
                      size={24}
                      className="text-red-600 dark:text-red-400"
                    />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {transaction.type === "income" ? "Доход" : "Расход"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.category}
                  </p>
                </div>
              </div>
              <p
                className={`text-3xl font-bold ${
                  transaction.type === "income"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {transaction.type === "income" ? "+" : "−"}{" "}
                {formatAmount(transaction.amount)}
              </p>
            </div>

            {/* Детали */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Дата
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {formatDate(transaction.transaction_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Способ оплаты
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {paymentMethodLabels[transaction.payment_method] ||
                      transaction.payment_method ||
                      "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Hash size={18} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Номер чека
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 font-mono">
                    {transaction.receipt_number || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Сотрудник
                  </p>
                  <Link
                    to={`/users/${transaction.user?.id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    {transaction.user?.first_name} {transaction.user?.last_name}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={18} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Создано
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={18} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Обновлено
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {formatDate(transaction.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Описание */}
            {transaction.description && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={18} className="text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                    Описание
                  </p>
                </div>
                <p className="text-gray-800 dark:text-gray-200">
                  {transaction.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Боковая панель */}
        <div className="lg:col-span-1 space-y-6">
          {/* Карточка сотрудника */}
          {transaction.user && (
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase">
                Сотрудник
              </h3>
              <Link
                to={`/users/${transaction.user.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    {transaction.user.first_name?.[0]}
                    {transaction.user.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {transaction.user.first_name} {transaction.user.last_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.user.login}
                  </p>
                </div>
              </Link>
            </div>
          )}

          {/* ID транзакции */}
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase">
              ID транзакции
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all">
              {transaction.id}
            </p>
          </div>

          {/* Метаданные */}
          {transaction.metadata &&
            Object.keys(transaction.metadata).length > 0 && (
              <div className="card dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">
                  Метаданные
                </h3>
                <pre className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(transaction.metadata, null, 2)}
                </pre>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
