// Typed fetch wrapper for all client-side API calls
// Every function throws on error so callers can use try/catch or toast
import type { ApplicationsListResponse, StoredApplication } from "@/lib/store";
import { csrfHeaders } from "@/lib/csrf";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const extraHeaders = MUTATION_METHODS.has(method) ? csrfHeaders() : {};

  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...extraHeaders, ...options.headers },
    ...options,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Request failed: ${res.status}`);
  return json.data as T;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  if (!params) return path;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    const normalized = String(value).trim();
    if (!normalized) return;
    search.set(key, normalized);
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  me: ()                                              => request("/api/auth/me"),
  login:    (email: string, password: string, rememberMe = false) =>
    request("/api/auth/login",    { method: "POST", body: JSON.stringify({ email, password, rememberMe }) }),
  register: (name: string, email: string, password: string) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  logout:   ()                                        =>
    request("/api/auth/logout",   { method: "POST" }),
  adminLogin: (email: string, password: string)       =>
    request("/api/auth/admin/login",    { method: "POST", body: JSON.stringify({ email, password }) }),
  supplierLogin: (email: string, password: string)    =>
    request("/api/auth/supplier/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  forgotPassword: (email: string) =>
    request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    request("/api/auth/reset-password",  { method: "POST", body: JSON.stringify({ token, password }) }),
};

// ── User profile ───────────────────────────────────────────────────────────
export const userApi = {
  getProfile:     ()                         => request("/api/user/profile"),
  updateProfile:  (patch: Record<string, unknown>) =>
    request("/api/user/profile",  { method: "PATCH", body: JSON.stringify(patch) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request("/api/user/password", { method: "PATCH", body: JSON.stringify({ currentPassword, newPassword }) }),
};

// ── Applications ───────────────────────────────────────────────────────────
export const applicationsApi = {
  list: (params?: {
    status?: "all" | "draft" | "submitted" | "processing" | "approved" | "rejected" | "cancelled";
    q?: string;
    page?: number;
    pageSize?: number;
    sortBy?: "submittedAt" | "updatedAt";
    sortDir?: "asc" | "desc";
  }) =>
    request<ApplicationsListResponse>(buildUrl("/api/applications", params)),
  get: (id: string) => request<StoredApplication>(`/api/applications/${id}`),
  create: (data: Record<string, unknown>) =>
    request("/api/applications", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request(`/api/applications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  cancel: (id: string) =>
    request(`/api/applications/${id}`, { method: "DELETE" }),
};

// ── Notifications ──────────────────────────────────────────────────────────
export const notificationsApi = {
  list:     async (params?: { page?: number; limit?: number; unread?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.unread) query.set("unread", "true");

    const data = await request<{ notifications?: unknown[] }>(
      `/api/notifications${query.toString() ? `?${query.toString()}` : ""}`,
    );
    return data.notifications ?? [];
  },
  markRead: (id: string) =>
    request(`/api/notifications/${id}/read`, { method: "PATCH" }),
  dismiss:  (id: string) =>
    request(`/api/notifications/${id}`, { method: "DELETE" }),
};

// ── Documents ──────────────────────────────────────────────────────────────
export const documentsApi = {
  list:   ()                                    => request("/api/documents"),
  get:    (id: string)                          => request(`/api/documents/${id}`),
  create: (data: Record<string, unknown>)        =>
    request("/api/documents",       { method: "POST",   body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request(`/api/documents/${id}`, { method: "PATCH",  body: JSON.stringify(data) }),
  delete: (id: string)                          =>
    request(`/api/documents/${id}`, { method: "DELETE" }),
};

// ── Admin ──────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats:       ()                                      => request("/api/admin/stats"),
  getApplications:(params?: Record<string, string>)       =>
    request(`/api/admin/applications?${new URLSearchParams(params ?? {})}`),
  getApplication: (id: string)                            => request(`/api/admin/applications/${id}`),
  createApplication: (data: Record<string, unknown>)      =>
    request("/api/admin/applications", { method: "POST", body: JSON.stringify(data) }),
  updateApplication: (id: string, data: Record<string, unknown>) =>
    request(`/api/admin/applications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteApplication: (id: string)                         =>
    request(`/api/admin/applications/${id}`, { method: "DELETE" }),
  getUsers:       async (q?: string)                     => {
    const data = await request<{ users?: unknown[] }>(`/api/admin/users${q ? `?q=${q}` : ""}`);
    return data.users ?? [];
  },
  getUser:        (id: string)                            => request(`/api/admin/users/${id}`),
  createUser:     (data: Record<string, unknown>)         =>
    request("/api/admin/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser:     (id: string, data: Record<string, unknown>) =>
    request(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteUser:     (id: string)                            =>
    request(`/api/admin/users/${id}`, { method: "DELETE" }),
  sendNotification: (data: Record<string, unknown>)       =>
    request("/api/admin/notifications", { method: "POST", body: JSON.stringify(data) }),
  getNotifications: (params?: Record<string, string>)     =>
    request(`/api/admin/notifications?${new URLSearchParams(params ?? {})}`),
  getNotification:  (id: string)                          => request(`/api/admin/notifications/${id}`),
  updateNotification: (id: string, data: Record<string, unknown>) =>
    request(`/api/admin/notifications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteNotification: (id: string)                        =>
    request(`/api/admin/notifications/${id}`, { method: "DELETE" }),

  // Suppliers
  getSuppliers:   ()                                      => request("/api/admin/suppliers"),
  getSupplier:    (id: string)                            => request(`/api/admin/suppliers/${id}`),
  createSupplier: (data: Record<string, unknown>)         =>
    request("/api/admin/suppliers", { method: "POST", body: JSON.stringify(data) }),
  updateSupplier: (id: string, data: Record<string, unknown>) =>
    request(`/api/admin/suppliers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSupplier: (id: string)                            =>
    request(`/api/admin/suppliers/${id}`, { method: "DELETE" }),

  // Payments
  getPayments:    (params?: Record<string, string>)       =>
    request(`/api/admin/payments?${new URLSearchParams(params ?? {})}`),
  getPayment:     (id: string)                            => request(`/api/admin/payments/${id}`),
  updatePayment:  (id: string, data: Record<string, unknown>) =>
    request(`/api/admin/payments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePayment:  (id: string)                            =>
    request(`/api/admin/payments/${id}`, { method: "DELETE" }),

  // Settings
  getSettings:    ()                                      => request("/api/admin/settings"),
  updateSettings: (data: Record<string, unknown>)         =>
    request("/api/admin/settings", { method: "PATCH", body: JSON.stringify(data) }),

  // Support tickets
  getTickets:     async (params?: Record<string, string>) => {
    const data = await request<{ tickets?: unknown[] }>(`/api/admin/support?${new URLSearchParams(params ?? {})}`);
    return data.tickets ?? [];
  },
  getTicket:      (id: string)                            => request(`/api/admin/support/${id}`),
  createTicket:   (data: Record<string, unknown>)         =>
    request("/api/admin/support", { method: "POST", body: JSON.stringify(data) }),
  updateTicket:   (id: string, data: Record<string, unknown>) =>
    request(`/api/admin/support/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTicket:   (id: string)                            =>
    request(`/api/admin/support/${id}`, { method: "DELETE" }),

  // Visas
  getVisas:       (params?: Record<string, string>)       =>
    request(`/api/admin/visas?${new URLSearchParams(params ?? {})}`),
  getVisa:        (id: string)                            => request(`/api/admin/visas/${id}`),
  createVisa:     (data: Record<string, unknown>)         =>
    request("/api/admin/visas", { method: "POST", body: JSON.stringify(data) }),
  updateVisa:     (id: string, data: Record<string, unknown>) =>
    request(`/api/admin/visas/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteVisa:     (id: string)                            =>
    request(`/api/admin/visas/${id}`, { method: "DELETE" }),

  // Countries
  getCountries:   ()                                      => request("/api/admin/countries"),
  getCountry:     (id: string)                            => request(`/api/admin/countries/${id}`),
  createCountry:  (data: Record<string, unknown>)         =>
    request("/api/admin/countries", { method: "POST", body: JSON.stringify(data) }),
  updateCountry:  (id: string, data: Record<string, unknown>) =>
    request(`/api/admin/countries/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCountry:  (id: string)                            =>
    request(`/api/admin/countries/${id}`, { method: "DELETE" }),

  // Dynamic forms
  getForms:       ()                                      => request("/api/admin/forms"),
  getForm:        (visaId: string)                        => request(`/api/admin/forms/${visaId}`),
  saveForm:       (config: Record<string, unknown>)       =>
    request("/api/admin/forms", { method: "POST", body: JSON.stringify(config) }),
  updateForm:     (visaId: string, config: Record<string, unknown>) =>
    request(`/api/admin/forms/${visaId}`, { method: "PATCH", body: JSON.stringify(config) }),
  resetForm:      (visaId: string)                        =>
    request(`/api/admin/forms/${visaId}`, { method: "DELETE" }),
};

// ── Supplier ───────────────────────────────────────────────────────────────
export const supplierApi = {
  getApplications: async (params?: { page?: number; limit?: number; status?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);
    if (params?.q) query.set("q", params.q);

    const data = await request<{ apps?: unknown[] }>(
      `/api/supplier/applications${query.toString() ? `?${query.toString()}` : ""}`,
    );
    return data.apps ?? [];
  },
  getApplication:  (id: string) => request(`/api/supplier/applications/${id}`),
  updateApplication: (id: string, data: Record<string, unknown>) =>
    request(`/api/supplier/applications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  withdrawApplication: (id: string) =>
    request(`/api/supplier/applications/${id}`, { method: "DELETE" }),
  getStats:        ()           => request("/api/supplier/stats"),
  getProfile:      ()           => request("/api/supplier/profile"),
  updateProfile:   (data: Record<string, unknown>) =>
    request("/api/supplier/profile", { method: "PATCH", body: JSON.stringify(data) }),
  logout:          ()           => request("/api/auth/supplier/logout", { method: "POST" }),

  // Notifications
  getNotifications: (params?: Record<string, string>) =>
    request(`/api/supplier/notifications?${new URLSearchParams(params ?? {})}`),
  sendNotification: (data: Record<string, unknown>) =>
    request("/api/supplier/notifications", { method: "POST", body: JSON.stringify(data) }),
  getNotification: (id: string) =>
    request(`/api/supplier/notifications/${id}`),
  updateNotification: (id: string, data: Record<string, unknown>) =>
    request(`/api/supplier/notifications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteNotification: (id: string) =>
    request(`/api/supplier/notifications/${id}`, { method: "DELETE" }),
};

// ── Supplier Catalog ───────────────────────────────────────────────────────
export const suppliersApi = {
  list: () => request("/api/suppliers"),
};
