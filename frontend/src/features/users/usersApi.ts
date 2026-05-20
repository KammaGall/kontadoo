import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, TOKEN_KEY } from "../../shared/lib/constants";

export interface User {
  id: string;
  login: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  role: {
    id: string;
    name: string;
    permissions: Record<string, string[]>;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  // hireDate: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const usersApi = createApi({
  reducerPath: "usersApi",
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
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query<
      UsersResponse,
      { page?: number; limit?: number; search?: string; role?: string }
    >({
      query: (params) => ({
        url: "/users",
        params,
      }),
      providesTags: ["Users"],
    }),

    getUserById: builder.query<{ user: User }, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),

    createUser: builder.mutation<User, Partial<User> & { password: string }>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Users", id }],
    }),

    // ✅ Деактивация пользователя
    deactivateUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    // ✅ Реактивация пользователя
    reactivateUser: builder.mutation<User, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: { isActive: true },
      }),
      invalidatesTags: ["Users"],
    }),

    generateQR: builder.mutation<
      { qrCode: string; token: string; expiresAt: string },
      string
    >({
      query: (userId) => ({
        url: `/users/${userId}/qr`,
        method: "POST",
      }),
    }),

    // Полное удаление пользователя
    permanentDeleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}/permanent`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    getUserStats: builder.query<any, string>({
      query: (id) => `/users/${id}/stats`,
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),

    resetPassword: builder.mutation<
      void,
      { userId: string; newPassword: string }
    >({
      query: ({ userId, newPassword }) => ({
        url: `/users/${userId}/reset-password`,
        method: "POST",
        body: { newPassword },
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useReactivateUserMutation,
  usePermanentDeleteUserMutation, // ← Добавить
  useGenerateQRMutation,
  useResetPasswordMutation,
  useGetUserStatsQuery,
} = usersApi;
