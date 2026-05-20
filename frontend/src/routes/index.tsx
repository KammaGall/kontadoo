import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { UsersPage } from "../features/users/pages/UsersPage";
import { UserDetailPage } from "../features/users/pages/UserDetailPage";
import { RolesPage } from "../features/roles/pages/RolesPage";
import { TransactionsPage } from "../features/transactions/pages/TransactionsPage";
import { TransactionDetailPage } from "../features/transactions/pages/TransactionDetailPage";
import { AuditPage } from "../features/audit/pages/AuditPage";
import { SettingsPage } from "../features/settings/pages/SettingsPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute resource="dashboard" action="read">
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute resource="dashboard" action="read">
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "transactions",
        element: (
          <ProtectedRoute resource="transactions" action="read">
            <TransactionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "transactions/:id",
        element: (
          <ProtectedRoute resource="transactions" action="read">
            <TransactionDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute resource="staff" action="read">
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "users/:id",
        element: (
          <ProtectedRoute resource="staff" action="read">
            <UserDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "roles",
        element: (
          <ProtectedRoute resource="roles" action="read">
            <RolesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "audit",
        element: (
          <ProtectedRoute resource="audit" action="read">
            <AuditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute resource="settings" action="read">
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
