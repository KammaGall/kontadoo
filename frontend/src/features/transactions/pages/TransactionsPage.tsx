import { useState } from "react";
import {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} from "../transactionsApi";
import { usePermissions } from "../../../shared/hooks/usePermissions";
import { Modal } from "../../../shared/ui/Modal";
import { ConfirmModal } from "../../../shared/ui/ConfirmModal";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionFilters } from "../components/TransactionFilters";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

export const TransactionsPage = () => {
  const { can } = usePermissions();

  // Состояния фильтров
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  // Запрос данных
  const { data, isLoading, isError } = useGetTransactionsQuery({
    page,
    limit: 15,
    type: type || undefined,
    category: category || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const [createTransaction, { isLoading: isCreating }] =
    useCreateTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating }] =
    useUpdateTransactionMutation();
  const [deleteTransaction, { isLoading: isDeleting }] =
    useDeleteTransactionMutation();

  // Состояния модальных окон
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<any>(null);

  const transactions = data?.transactions || [];
  const summary = data?.summary || { income: 0, expense: 0, balance: 0 };
  const pagination = data?.pagination;

  const hasActiveFilters = type || category || startDate || endDate || search;

  const resetFilters = () => {
    setType("");
    setCategory("");
    setStartDate("");
    setEndDate("");
    setSearch("");
    setPage(1);
  };

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
      const d = new Date(date);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    try {
      await deleteTransaction(deletingTransaction.id).unwrap();
      toast.success("Транзакция удалена");
      setDeletingTransaction(null);
    } catch (error: any) {
      toast.error(error.data?.error || "Ошибка удаления");
    }
  };

  return (
    <div>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Финансы
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Учёт доходов и расходов
          </p>
        </div>
        {can("transactions", "create") && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Добавить транзакцию
          </button>
        )}
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card dark:bg-gray-800 dark:border-gray-700 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Доходы
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatAmount(summary.income)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="card dark:bg-gray-800 dark:border-gray-700 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Расходы
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatAmount(summary.expense)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="card dark:bg-gray-800 dark:border-gray-700 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Баланс
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}
              >
                {formatAmount(summary.balance)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <TransactionFilters
        type={type}
        setType={setType}
        category={category}
        setCategory={setCategory}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        search={search}
        setSearch={setSearch}
        onReset={resetFilters}
        setPage={setPage}
      />

      {/* Контент */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-6 rounded-lg text-center">
            <p className="font-medium">Ошибка загрузки данных</p>
          </div>
        )}

        {!isLoading && !isError && transactions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-1">
              {hasActiveFilters ? "Ничего не найдено" : "Нет транзакций"}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {hasActiveFilters
                ? "Попробуйте изменить фильтры"
                : "Добавьте первую транзакцию"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-3 text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && transactions.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Дата
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Тип
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Категория
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Сумма
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Описание
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Сотрудник
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {transactions.map((tx: any) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {new Date(tx.transaction_date).toLocaleDateString(
                          "ru-RU",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.type === "income"
                              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <ArrowUpRight size={14} />
                          ) : (
                            <ArrowDownRight size={14} />
                          )}
                          {tx.type === "income" ? "Доход" : "Расход"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                        {tx.category}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-medium text-sm ${tx.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                        >
                          {tx.type === "income" ? "+" : "−"}{" "}
                          {formatAmount(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {tx.description || "—"}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                        {tx.user?.first_name} {tx.user?.last_name?.[0]}.
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/transactions/${tx.id}`}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Просмотр"
                          >
                            <Eye
                              size={16}
                              className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
                            />
                          </Link>
                          {can("transactions", "update") && (
                            <button
                              onClick={() => setEditingTransaction(tx)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              title="Редактировать"
                            >
                              <Pencil
                                size={16}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                              />
                            </button>
                          )}
                          {can("transactions", "delete") && (
                            <button
                              onClick={() => setDeletingTransaction(tx)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              title="Удалить"
                            >
                              <Trash2
                                size={16}
                                className="text-red-400 hover:text-red-600"
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Всего:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {pagination.total}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                  >
                    ← Назад
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
                    {page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    disabled={page === pagination.pages}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                  >
                    Вперёд →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Модальное окно создания */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Добавить транзакцию"
        size="md"
      >
        <TransactionForm
          onSuccess={() => {
            setShowCreateModal(false);
            toast.success("Транзакция добавлена");
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* ✅ Модальное окно редактирования */}
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Редактировать транзакцию"
        size="md"
      >
        {editingTransaction && (
          <TransactionForm
            transaction={editingTransaction}
            onSuccess={() => {
              setEditingTransaction(null);
              toast.success("Транзакция обновлена");
            }}
            onCancel={() => setEditingTransaction(null)}
          />
        )}
      </Modal>

      {/* ✅ Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDelete}
        title="Удалить транзакцию?"
        message="Вы уверены, что хотите удалить эту транзакцию? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
};
