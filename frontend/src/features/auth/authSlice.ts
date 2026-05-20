import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../shared/lib/axios";
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../shared/lib/constants";

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Проверяем наличие токена ПРИ ЗАГРУЗКЕ
const hasToken = !!localStorage.getItem(TOKEN_KEY);

const initialState: AuthState = {
  user: null,
  isAuthenticated: hasToken, // Восстанавливаем из localStorage
  isLoading: hasToken, // Если есть токен — грузим пользователя
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: any) => {
    const response = await apiClient.post("/auth/login", credentials);
    const { accessToken, refreshToken } = response.data.tokens;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    return response.data;
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    // Даже если сервер недоступен — чистим локально
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
});

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: {
      businessName: string;
      businessEmail: string;
      businessPhone?: string;
      businessAddress?: string;
      adminFirstName: string;
      adminLastName: string;
      adminLogin: string;
      adminPassword: string;
      adminEmail?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiClient.post("/auth/register", data);
      const { accessToken, refreshToken } = response.data.tokens;
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Ошибка регистрации",
      );
    }
  },
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.error.message || "Ошибка входа";
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.isLoading = false;
      })

      // GET CURRENT USER
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        // Токен невалидный — чистим
        state.isAuthenticated = false;
        state.user = null;
        state.isLoading = false;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      });
  },
});

export const { setUser, clearError } = authSlice.actions;

export default authSlice.reducer;

export const selectUser = (state: any) => state.auth.user;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectIsLoading = (state: any) => state.auth.isLoading;
