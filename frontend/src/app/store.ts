import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "@/features/auth/authSlice";
import usersReducer from "@/features/users/usersSlice";
import rolesReducer from "@/features/roles/rolesSlice";
import transactionsReducer from "@/features/transactions/transactionsSlice";
import dashboardReducer from "@/features/dashboard/dashboardSlice";

// RTK Query API slices (будут добавлены позже)
import { usersApi } from "@/features/users/usersApi";
import { rolesApi } from "@/features/roles/rolesApi";
import { transactionsApi } from "@/features/transactions/transactionsApi";
import { auditApi } from "@/features/audit/auditApi";
import themeReducer from "../features/theme/themeSlice";

export const store = configureStore({
  reducer: {
    // Redux Slices (глобальное состояние клиента)
    auth: authReducer,
    theme: themeReducer, // ← Добавь эту строку
    users: usersReducer,
    roles: rolesReducer,
    transactions: transactionsReducer,
    dashboard: dashboardReducer,

    // RTK Query API slices (состояние сервера)
    [usersApi.reducerPath]: usersApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [transactionsApi.reducerPath]: transactionsApi.reducer,
    [auditApi.reducerPath]: auditApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      usersApi.middleware,
      rolesApi.middleware,
      transactionsApi.middleware,
      auditApi.middleware,
    ),
  devTools: import.meta.env.DEV,
});

// Настройка listeners для RTK Query (рефетч при фокусе, переподключении и т.д.)
setupListeners(store.dispatch);

// Типы для TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
