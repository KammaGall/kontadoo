import { Search, X, Filter } from "lucide-react";

interface TransactionFiltersProps {
  type: string;
  setType: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  onReset: () => void;
  setPage: (page: number) => void;
}

const CATEGORIES = [
  "Продажи",
  "Услуги",
  "Аренда",
  "Зарплата",
  "Налоги",
  "Маркетинг",
  "Оборудование",
  "Транспорт",
  "Прочее",
];

export const TransactionFilters = ({
  type,
  setType,
  category,
  setCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  search,
  setSearch,
  onReset,
  setPage,
}: TransactionFiltersProps) => {
  const handleChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const hasActiveFilters = type || category || startDate || endDate || search;

  return (
    <div className="card dark:bg-gray-800 dark:border-gray-700 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={16} className="text-gray-400 dark:text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Фильтры
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
          >
            <X size={14} />
            Сбросить
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Тип */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Тип
          </label>
          <select
            value={type}
            onChange={(e) => handleChange(setType, e.target.value)}
            className="input-field text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="">Все</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </select>
        </div>

        {/* Категория */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Категория
          </label>
          <select
            value={category}
            onChange={(e) => handleChange(setCategory, e.target.value)}
            className="input-field text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            <option value="">Все категории</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Дата с */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Дата с
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleChange(setStartDate, e.target.value)}
            className="input-field text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {/* Дата по */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Дата по
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleChange(setEndDate, e.target.value)}
            className="input-field text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {/* Поиск */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Поиск
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleChange(setSearch, e.target.value)}
              placeholder="Описание..."
              className="input-field text-sm pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
