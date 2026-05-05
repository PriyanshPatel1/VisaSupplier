import { test, expect } from "@playwright/test";

test.describe("Auth flows", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/VisaHub/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("nonexistent@example.com");
    await page.getByLabel(/password/i).fill("WrongPass123");
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await expect(page.getByText(/invalid|incorrect|wrong/i)).toBeVisible({ timeout: 5000 });
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("forgot password page loads", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});

test.describe("Public pages", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/VisaHub/);
  });

  test("countries page loads", async ({ page }) => {
    await page.goto("/countries");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("health endpoint returns 200", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  test("API docs accessible", async ({ request }) => {
    const res = await request.get("/api/docs");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.openapi).toBe("3.1.0");
  });
});

test.describe("Unauthenticated redirects", () => {
  test("user dashboard redirects to login", async ({ page }) => {
    await page.goto("/user/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin dashboard redirects to admin login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("supplier dashboard redirects to supplier login", async ({ page }) => {
    await page.goto("/supplier/dashboard");
    await expect(page).toHaveURL(/\/supplier\/login/);
  });
});
