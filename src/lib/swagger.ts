/**
 * OpenAPI 3.1 spec builder for VisaHub API.
 * Served at /api/docs and rendered by Swagger UI at /api/docs/ui.
 */

export function buildOpenApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "VisaHub API",
      version: "1.0.0",
      description: "Visa application platform API — authentication, applications, payments, and admin.",
      contact: { name: "VisaHub Support", email: "support@visahub.com" },
    },
    servers: [
      { url: process.env.NEXT_PUBLIC_APP_URL ?? "https://visahub.com", description: "Production" },
      { url: "http://localhost:3000", description: "Local dev" },
    ],
    tags: [
      { name: "Auth", description: "User authentication" },
      { name: "Applications", description: "Visa applications" },
      { name: "Payments", description: "Razorpay payments" },
      { name: "Documents", description: "File uploads" },
      { name: "Notifications", description: "User notifications" },
      { name: "Content", description: "Public visa/country catalog" },
      { name: "Admin", description: "Admin-only endpoints" },
      { name: "Supplier", description: "Supplier endpoints" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: { type: "apiKey", in: "cookie", name: "vh-user-token" },
        adminCookieAuth: { type: "apiKey", in: "cookie", name: "vh-admin-token" },
        supplierCookieAuth: { type: "apiKey", in: "cookie", name: "vh-supplier-token" },
        csrfToken: { type: "apiKey", in: "header", name: "x-csrf-token" },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            data: { type: "object" },
            error: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["USER", "ADMIN", "SUPPLIER"] },
            avatar: { type: "string", nullable: true },
            phone: { type: "string", nullable: true },
            country: { type: "string", nullable: true },
            emailVerified: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Application: {
          type: "object",
          properties: {
            id: { type: "string" },
            status: { type: "string", enum: ["draft", "submitted", "processing", "approved", "rejected", "cancelled"] },
            visaName: { type: "string" },
            countryName: { type: "string" },
            totalPaid: { type: "number" },
            referenceNumber: { type: "string", nullable: true },
            submittedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string" },
            status: { type: "string", enum: ["pending", "completed", "failed", "refunded"] },
            gatewayRef: { type: "string" },
            paidAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        Error: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: false },
            error: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["Auth"],
          summary: "Health check",
          responses: {
            200: { description: "Service healthy" },
            503: { description: "Database unreachable" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "User login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8 },
                    rememberMe: { type: "boolean", default: false },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful — sets JWT cookie" },
            401: { description: "Invalid credentials" },
            403: { description: "Account inactive or email not verified" },
            429: { description: "Rate limited" },
          },
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "User registration",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string", minLength: 2 },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Registration successful" },
            400: { description: "Validation error" },
            409: { description: "Email already exists" },
          },
        },
      },
      "/api/auth/logout": {
        post: { tags: ["Auth"], summary: "Logout — clears cookie", responses: { 200: { description: "Logged out" } } },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: "Current user data" }, 401: { description: "Not authenticated" } },
        },
      },
      "/api/applications": {
        get: {
          tags: ["Applications"],
          summary: "List user applications",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 50 } },
            { name: "status", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "Application list with pagination" }, 401: { description: "Unauthorized" } },
        },
        post: {
          tags: ["Applications"],
          summary: "Create new application",
          security: [{ cookieAuth: [], csrfToken: [] }],
          responses: { 201: { description: "Application created" }, 400: { description: "Validation error" } },
        },
      },
      "/api/payments/create-order": {
        post: {
          tags: ["Payments"],
          summary: "Create Razorpay order",
          security: [{ cookieAuth: [], csrfToken: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["amount"],
                  properties: {
                    amount: { type: "number", description: "Amount in INR" },
                    visaId: { type: "string" },
                    supplierId: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Order created — returns orderId" }, 503: { description: "Payment service unavailable" } },
        },
      },
      "/api/payments/verify": {
        post: {
          tags: ["Payments"],
          summary: "Verify Razorpay payment signature",
          security: [{ cookieAuth: [], csrfToken: [] }],
          responses: { 200: { description: "Payment verified" }, 400: { description: "Signature mismatch" } },
        },
      },
      "/api/payments/webhook": {
        post: {
          tags: ["Payments"],
          summary: "Razorpay webhook receiver",
          description: "Verified via x-razorpay-signature header. No auth cookie needed.",
          responses: { 200: { description: "Webhook processed" }, 400: { description: "Invalid signature" } },
        },
      },
      "/api/upload": {
        post: {
          tags: ["Documents"],
          summary: "Upload document/image",
          security: [{ cookieAuth: [], csrfToken: [] }],
          requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" }, folder: { type: "string" } } } } } },
          responses: { 201: { description: "Upload successful" }, 400: { description: "Invalid file type/size" }, 422: { description: "Virus detected" } },
        },
      },
      "/api/content/catalog": {
        get: { tags: ["Content"], summary: "Get published visa catalog", responses: { 200: { description: "Countries and visas" } } },
      },
    },
  };
}
