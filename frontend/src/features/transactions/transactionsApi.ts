import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, TOKEN_KEY } from "../../shared/lib/constants";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  payment_method?: string;
  receipt_number?: string;
  transaction_date: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    login?: string;
  };
}

export interface TransactionsResponse {
  transactions: Transaction[];
  summary: {
    income: number;
    expense: number;
    balance: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const transactionsApi = createApi({
  reducerPath: "transactionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Transactions"],
  endpoints: (builder) => ({
    getTransactions: builder.query<
      TransactionsResponse,
      {
        page?: number;
        limit?: number;
        type?: string;
        category?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({
        url: "/transactions",
        params,
      }),
      providesTags: ["Transactions"],
    }),

    getStatistics: builder.query<any, { period?: string }>({
      query: (params) => ({
        url: "/transactions/statistics",
        params,
      }),
    }),

    createTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      query: (body) => ({
        url: "/transactions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transactions"],
    }),

    // ✅ Добавляем обновление
    updateTransaction: builder.mutation<
      Transaction,
      { id: string; data: Partial<Transaction> }
    >({
      query: ({ id, data }) => ({
        url: `/transactions/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Transactions"],
    }),

    // ✅ Добавляем удаление
    deleteTransaction: builder.mutation<void, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transactions"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetStatisticsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionsApi;
