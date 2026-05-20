import { useGetStatisticsQuery } from "../../transactions/transactionsApi";
import { useGetUsersQuery } from "../../users/usersApi";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Receipt,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

export const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useGetStatisticsQuery({
    period: "month",
  });
  const { data: usersData } = useGetUsersQuery({ page: 1, limit: 100 });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // ✅ Суммарные показатели
  const income = Number(stats?.summary?.income?.total) || 0;
  const expense = Number(stats?.summary?.expense?.total) || 0;
  const balance = income - expense;
  const incomeCount = Number(stats?.summary?.income?.count) || 0;
  const expenseCount = Number(stats?.summary?.expense?.count) || 0;
  const transactionsCount = incomeCount + expenseCount;
  const employeesCount = usersData?.pagination?.total || 0;

  // ✅ Данные для графика (группируем доходы и расходы по датам)
  const chartData = (() => {
    const grouped: Record<
      string,
      { date: string; income: number; expense: number }
    > = {};

    stats?.byDay?.forEach((day: any) => {
      const dateKey = day.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: new Date(dateKey).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
          }),
          income: 0,
          expense: 0,
        };
      }
      if (day.type === "income") {
        grouped[dateKey].income += Number(day.total);
      } else {
        grouped[dateKey].expense += Number(day.total);
      }
    });

    return Object.values(grouped);
  })();

  // ✅ Данные для круговой диаграммы расходов
  const categoryData = (stats?.byCategory || [])
    .filter((cat: any) => cat.type === "expense")
    .map((cat: any) => ({
      name: cat.category,
      value: Number(cat.total),
    }));

  // ✅ Топ сотрудников
  const topUsers = (stats?.byUser || [])
    .map((user: any) => ({
      ...user,
      count: Number(user.count),
      total: Number(user.total),
    }))
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Дашборд
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Обзор вашего бизнеса за последний месяц
        </p>
      </div>

      {/* Карточки KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Доходы */}
        <div className="card dark:bg-gray-800 dark:border-gray-700 border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Доходы
            </p>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp
                size={16}
                className="text-green-600 dark:text-green-400"
              />
            </div>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatAmount(income)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight size={14} className="text-green-500" />
            <span className="text-xs text-green-600 dark:text-green-400">
              +{incomeCount} операций
            </span>
          </div>
        </div>

        {/* Расходы */}
        <div className="card dark:bg-gray-800 dark:border-gray-700 border-l-4 border-red-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Расходы
            </p>
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <TrendingDown
                size={16}
                className="text-red-600 dark:text-red-400"
              />
            </div>
          </div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {formatAmount(expense)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowDownRight size={14} className="text-red-500" />
            <span className="text-xs text-red-600 dark:text-red-400">
              {expenseCount} операций
            </span>
          </div>
        </div>

        {/* Баланс */}
        <div className="card dark:bg-gray-800 dark:border-gray-700 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Баланс
            </p>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <DollarSign
                size={16}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
          </div>
          <p
            className={`text-xl font-bold ${balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}
          >
            {formatAmount(balance)}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {balance >= 0 ? "Положительный" : "Отрицательный"}
          </span>
        </div>

        {/* Сотрудники */}
        <div className="card dark:bg-gray-800 dark:border-gray-700 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Сотрудники
            </p>
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users
                size={16}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {employeesCount}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Активных
          </span>
        </div>

        {/* Транзакции */}
        <div className="card dark:bg-gray-800 dark:border-gray-700 border-l-4 border-amber-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Операций
            </p>
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Receipt
                size={16}
                className="text-amber-600 dark:text-amber-400"
              />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {transactionsCount}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            За месяц
          </span>
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* График доходов/расходов */}
        <div className="card dark:bg-gray-800 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Динамика доходов и расходов
          </h3>
          {statsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="incomeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="expenseGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #4b5563",
                    backgroundColor: "#1f2937",
                    color: "#f9fafb",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
                  }}
                  formatter={(value: number) => formatAmount(value)}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fill="url(#incomeGradient)"
                  name="Доходы"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#dc2626"
                  strokeWidth={2}
                  fill="url(#expenseGradient)"
                  name="Расходы"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <Activity size={48} className="mx-auto mb-2 opacity-50" />
                <p>Нет данных для отображения</p>
              </div>
            </div>
          )}
        </div>

        {/* Круговая диаграмма расходов */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Расходы по категориям
          </h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatAmount(value)}
                    contentStyle={{
                      borderRadius: "8px",
                      backgroundColor: "#1f2937",
                      border: "1px solid #4b5563",
                      color: "#f9fafb",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {categoryData.slice(0, 5).map((cat: any, index: number) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        {cat.name}
                      </span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {formatAmount(cat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
              <p>Нет данных</p>
            </div>
          )}
        </div>
      </div>

      {/* Топ сотрудников */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Топ сотрудников
        </h3>
        {topUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Сотрудник
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Операций
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Сумма
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {topUsers.map((user: any) => (
                  <tr
                    key={user.user_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                            {user.user?.first_name?.[0]}
                            {user.user?.last_name?.[0]}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {user.user?.first_name} {user.user?.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-300">
                      {user.count}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-800 dark:text-gray-100">
                      {formatAmount(user.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">
            <p>Нет данных о сотрудниках</p>
          </div>
        )}
      </div>
    </div>
  );
};
