import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
} from "../transactionsApi";
import { toast } from "sonner";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"], { required_error: "Выберите тип" }),
  amount: z
    .string()
    .min(1, "Введите сумму")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Сумма должна быть больше 0",
    ),
  category: z.string().min(1, "Выберите категорию"),
  description: z.string().optional(),
  paymentMethod: z.enum(["cash", "card", "transfer", "other"]).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = {
  income: ["Продажи", "Услуги", "Инвестиции", "Прочее"],
  expense: [
    "Аренда",
    "Зарплата",
    "Налоги",
    "Маркетинг",
    "Оборудование",
    "Транспорт",
    "Прочее",
  ],
};

export const TransactionForm = ({
  transaction,
  onSuccess,
  onCancel,
}: TransactionFormProps) => {
  const [createTransaction, { isLoading: isCreating }] =
    useCreateTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating }] =
    useUpdateTransactionMutation();
  const isLoading = isCreating || isUpdating;
  const isEditing = !!transaction;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || "expense",
      amount: transaction?.amount?.toString() || "",
      category: transaction?.category || "",
      description: transaction?.description || "",
      paymentMethod: transaction?.payment_method || "cash",
    },
  });

  const selectedType = watch("type") || "expense";
  const categories = CATEGORIES[selectedType as keyof typeof CATEGORIES] || [];

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (isEditing) {
        await updateTransaction({
          id: transaction.id,
          data: {
            type: data.type,
            amount: Number(data.amount),
            category: data.category,
            description: data.description || undefined,
            paymentMethod: data.paymentMethod || "cash",
          } as any,
        }).unwrap();
        toast.success("Транзакция обновлена");
      } else {
        await createTransaction({
          type: data.type,
          amount: Number(data.amount),
          category: data.category,
          description: data.description || undefined,
          paymentMethod: data.paymentMethod || "cash",
        } as any).unwrap();
        toast.success("Транзакция создана");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.data?.error || "Ошибка");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Тип */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Тип *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedType === "income"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <input
              type="radio"
              value="income"
              {...register("type")}
              className="sr-only"
            />
            <span
              className={`text-sm font-medium ${selectedType === "income" ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}
            >
              Доход
            </span>
          </label>
          <label
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedType === "expense"
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <input
              type="radio"
              value="expense"
              {...register("type")}
              className="sr-only"
            />
            <span
              className={`text-sm font-medium ${selectedType === "expense" ? "text-red-700 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}
            >
              Расход
            </span>
          </label>
        </div>
      </div>

      {/* Сумма */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Сумма *
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            {...register("amount")}
            className={`input-field pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${errors.amount ? "border-red-300" : ""}`}
            placeholder="0.00"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            ₽
          </span>
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Категория */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Категория *
        </label>
        <select
          {...register("category")}
          className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${errors.category ? "border-red-300" : ""}`}
        >
          <option value="">Выберите категорию</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Описание */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Описание
        </label>
        <textarea
          {...register("description")}
          className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          rows={3}
          placeholder="Добавьте комментарий..."
        />
      </div>

      {/* Способ оплаты */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Способ оплаты
        </label>
        <select
          {...register("paymentMethod")}
          className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          <option value="cash">Наличные</option>
          <option value="card">Карта</option>
          <option value="transfer">Перевод</option>
          <option value="other">Другое</option>
        </select>
      </div>

      {/* Кнопки */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="btn-secondary">
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
          {isEditing ? "Сохранить" : "Добавить"}
        </button>
      </div>
    </form>
  );
};
