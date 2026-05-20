import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, TOKEN_KEY } from "../../shared/lib/constants";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  isSystem: boolean;
  usersCount?: number;
  createdAt: string;
}

export const rolesApi = createApi({
  reducerPath: "rolesApi",
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
  tagTypes: ["Roles"],
  endpoints: (builder) => ({
    // Получение всех ролей
    getRoles: builder.query<Role[], void>({
      query: () => "/roles",
      providesTags: ["Roles"],
    }),

    // Получение роли по ID
    getRoleById: builder.query<Role, string>({
      query: (id) => `/roles/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Roles", id }],
    }),

    // Создание роли
    createRole: builder.mutation<Role, Partial<Role>>({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Roles"],
    }),

    // Обновление роли
    updateRole: builder.mutation<Role, { id: string; data: Partial<Role> }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Roles"],
    }),

    // Удаление роли
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
    }),

    // Копирование роли
    copyRole: builder.mutation<Role, { id: string; newName: string }>({
      query: ({ id, newName }) => ({
        url: `/roles/${id}/copy`,
        method: "POST",
        body: { newName },
      }),
      invalidatesTags: ["Roles"],
    }),

    // Получение шаблонов прав
    getPermissionTemplates: builder.query<any, void>({
      query: () => "/roles/templates",
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useCopyRoleMutation,
  useGetPermissionTemplatesQuery,
} = rolesApi;
