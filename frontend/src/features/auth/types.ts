// Тип для прав доступа (JSONB с бэкенда)
export type PermissionAction = "create" | "read" | "update" | "delete" | "*";
export type Permissions = Record<string, PermissionAction[]>;

// Тип для роли
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permissions;
  isSystem: boolean;
  createdAt: string;
  usersCount?: number;
}

// Тип для пользователя
export interface User {
  id: string;
  login: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  role: Role;
  businessId: string;
  settings: UserSettings;
  lastLogin?: string;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  language: "ru" | "en";
  notifications: boolean;
}

// Тип для бизнеса
export interface Business {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  settings: BusinessSettings;
}

export interface BusinessSettings {
  currency: string;
  timezone: string;
  dateFormat: string;
}

// Состояние авторизации
export interface AuthState {
  user: User | null;
  business: Business | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Запрос на вход
export interface LoginRequest {
  login: string;
  password: string;
}

// Запрос на регистрацию
export interface RegisterRequest {
  businessName: string;
  businessEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminLogin: string;
  adminPassword: string;
  adminEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
}

// Ответ с токенами
export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
