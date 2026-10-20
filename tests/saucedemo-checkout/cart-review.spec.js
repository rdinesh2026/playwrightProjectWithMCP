const { test, expect } = require('@playwright/test');

test.describe('Checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(page.getByText('Products', { exact: true })).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('Review selected products in cart', async ({ page }) => {
    // 1. Add Sauce Labs Backpack and Sauce Labs Bike Light to the cart.
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');

    // 2. Open the cart and inspect the selected products.
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.getByText('Sauce Labs Backpack', { exact: true })).toBeVisible();
    await expect(page.getByText('Sauce Labs Bike Light', { exact: true })).toBeVisible();
    await expect(page.getByText('carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.')).toBeVisible();
    await expect(page.getByText("A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.")).toBeVisible();
    await expect(page.getByText('$29.99', { exact: true })).toBeVisible();
    await expect(page.getByText('$9.99', { exact: true })).toBeVisible();
    await expect(page.locator('.cart_quantity')).toHaveCount(2);
    await expect(page.locator('.cart_quantity').nth(0)).toHaveText('1');
    await expect(page.locator('.cart_quantity').nth(1)).toHaveText('1');
    await expect(page.getByRole('button', { name: 'Continue Shopping' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Checkout' })).toBeVisible();
    await expect(page.locator('[data-test="cart-subtotal"]')).toHaveCount(0);
  });
});
