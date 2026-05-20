export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const TOKEN_KEY = "kontadoo_access_token";
export const REFRESH_TOKEN_KEY = "kontadoo_refresh_token";

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
};

export const DATE_FORMAT = "dd.MM.yyyy";
export const DATE_TIME_FORMAT = "dd.MM.yyyy HH:mm";
