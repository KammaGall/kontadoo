import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, TOKEN_KEY } from "../../shared/lib/constants";

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data?: any;
  new_data?: any;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    login: string;
  };
  created_at: string;
  metadata?: any;
}

export interface AuditResponse {
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const auditApi = createApi({
  reducerPath: "auditApi",
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
  tagTypes: ["Audit"],
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      AuditResponse,
      {
        page?: number;
        limit?: number;
        action?: string;
        entityType?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({
        url: "/audit",
        params,
      }),
      providesTags: ["Audit"],
    }),

    getUserAuditLogs: builder.query<
      any,
      { userId: string; page?: number; limit?: number }
    >({
      query: ({ userId, ...params }) => ({
        url: `/audit/user/${userId}`,
        params,
      }),
    }),

    getEntityAuditLogs: builder.query<
      any,
      { entityType: string; entityId: string }
    >({
      query: ({ entityType, entityId }) =>
        `/audit/entity/${entityType}/${entityId}`,
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetUserAuditLogsQuery,
  useGetEntityAuditLogsQuery,
} = auditApi;
