import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "./app/store";
import { router } from "./routes";
import { getCurrentUser } from "./features/auth/authSlice";
import { TOKEN_KEY } from "./shared/lib/constants";
import "./index.css";

import { initTheme } from "./features/theme/themeSlice";

store.dispatch(initTheme());

// Если есть токен — загружаем пользователя ДО рендера
const token = localStorage.getItem(TOKEN_KEY);
if (token) {
  store.dispatch(getCurrentUser());
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
