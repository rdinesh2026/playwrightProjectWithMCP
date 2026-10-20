const { test, expect } = require('@playwright/test');

 test.describe('Checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one\.html$/);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('Require each checkout information field', async ({ page }) => {
    const continueButton = page.locator('[data-test="continue"]');
    const errorMessage = page.locator('[data-test="error"]');

    // 1. Submit with all fields empty.
    await continueButton.click();
    await expect(page.getByText('Checkout: Your Information', { exact: true })).toBeVisible();
    await expect(errorMessage).toHaveText('Error: First Name is required');

    // 2. Enter a first name only and submit.
    await page.locator('[data-test="firstName"]').fill('Ava');
    await continueButton.click();
    await expect(page.getByText('Checkout: Your Information', { exact: true })).toBeVisible();
    await expect(errorMessage).toHaveText('Error: Last Name is required');

    // 3. Enter first and last names, leaving postal code empty.
    await page.locator('[data-test="lastName"]').fill('Tester');
    await continueButton.click();
    await expect(page.getByText('Checkout: Your Information', { exact: true })).toBeVisible();
    await expect(errorMessage).toHaveText('Error: Postal Code is required');
  });
});
