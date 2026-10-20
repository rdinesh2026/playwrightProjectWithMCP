import { expect, test, type Page } from '@playwright/test';

const appUrl = 'https://www.saucedemo.com';

async function logIn(page: Page) {
  await page.goto(appUrl);
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await expect(page).toHaveURL(/inventory\.html$/);
}

async function addBackpackAndBikeLight(page: Page) {
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page).toHaveURL(/cart\.html$/);
}

async function openCheckout(page: Page) {
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page).toHaveURL(/checkout-step-one\.html$/);
}

async function enterValidInformation(page: Page) {
  await page.locator('[data-test="firstName"]').fill('Ava');
  await page.locator('[data-test="lastName"]').fill('Tester');
  await page.locator('[data-test="postalCode"]').fill('12345');
}

test.describe('SCRUM-101 checkout', () => {
  test.beforeEach(async ({ page }) => {
    await logIn(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus && !page.isClosed()) {
      await page.screenshot({ path: testInfo.outputPath('failure.png'), fullPage: true });
    }
  });

  test('AC1: review cart items and navigation actions', async ({ page }) => {
    await addBackpackAndBikeLight(page);

    await expect(page.getByRole('button', { name: 'Cart, 2 items' })).toBeVisible();
    await expect(page.locator('.cart_item').filter({ hasText: 'Sauce Labs Backpack' })).toBeVisible();
    await expect(page.locator('.cart_item').filter({ hasText: 'Sauce Labs Bike Light' })).toBeVisible();
    await expect(page.getByText('carry.allTheThings()', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue Shopping' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Checkout' })).toBeVisible();
  });

  test('AC1: show item prices, quantities, and cart subtotal', async ({ page }) => {
    test.fail(true, 'Known AC1 gap: cart page does not display an order subtotal.');
    await addBackpackAndBikeLight(page);

    await expect(page.getByText('$29.99', { exact: true })).toBeVisible();
    await expect(page.getByText('$9.99', { exact: true })).toBeVisible();
    await expect(page.locator('.cart_quantity')).toHaveText(['1', '1']);
    await expect(page.getByText('Item total: $39.98')).toBeVisible();
  });

  test('AC2: require first name, last name, and postal code independently', async ({ page }) => {
    await addBackpackAndBikeLight(page);
    await openCheckout(page);

    await page.locator('[data-test="continue"]').click();
    await expect(page.getByRole('alert')).toContainText('First Name is required');

    await page.locator('[data-test="firstName"]').fill('Ava');
    await page.locator('[data-test="continue"]').click();
    await expect(page.getByRole('alert')).toContainText('Last Name is required');

    await page.locator('[data-test="lastName"]').fill('Tester');
    await page.locator('[data-test="continue"]').click();
    await expect(page.getByRole('alert')).toContainText('Postal Code is required');
    await expect(page).toHaveURL(/checkout-step-one\.html$/);
  });

  test('AC3: show items, payment, shipping, and calculated totals', async ({ page }) => {
    await addBackpackAndBikeLight(page);
    await openCheckout(page);
    await enterValidInformation(page);
    await page.locator('[data-test="continue"]').click();

    await expect(page).toHaveURL(/checkout-step-two\.html$/);
    await expect(page.getByText('Sauce Labs Backpack', { exact: true })).toBeVisible();
    await expect(page.getByText('Sauce Labs Bike Light', { exact: true })).toBeVisible();
    await expect(page.getByText('SauceCard #31337')).toBeVisible();
    await expect(page.getByText('Free Pony Express Delivery!')).toBeVisible();
    await expect(page.getByText('Item total: $39.98')).toBeVisible();
    await expect(page.getByText('Tax: $3.20')).toBeVisible();
    await expect(page.getByText('Total: $43.18')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Finish' })).toBeVisible();
  });

  test('AC4: finish order, confirm success, and clear cart', async ({ page }) => {
    await addBackpackAndBikeLight(page);
    await openCheckout(page);
    await enterValidInformation(page);
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();

    await expect(page).toHaveURL(/checkout-complete\.html$/);
    await expect(page.getByText('Thank you for your order!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back Home' })).toBeVisible();
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(page.locator('[data-test="shopping-cart-link"]')).toBeVisible();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/cart\.html$/);
    await expect(page.locator('.cart_item')).toHaveCount(0);
  });

  test.describe('AC5 malformed checkout values', () => {
    test('AC5: reject malformed checkout values', async ({ page }) => {
      test.skip(true, 'Blocked: live SauceDemo inconsistently accepts malformed checkout values.');
      await addBackpackAndBikeLight(page);
      await openCheckout(page);
      await page.locator('[data-test="firstName"]').fill('Ava!@#');
      await page.locator('[data-test="lastName"]').fill('Tester123$');
      await page.locator('[data-test="postalCode"]').fill('!@#');
      await page.locator('[data-test="continue"]').click();

      await expect(page).toHaveURL(/checkout-step-one\.html$/);
      await expect(page.getByRole('alert')).toBeVisible();
    });
  });

  test('business rule: cancel checkout information returns to cart', async ({ page }) => {
    await addBackpackAndBikeLight(page);
    await openCheckout(page);
    await page.locator('[data-test="cancel"]').click();

    await expect(page).toHaveURL(/cart\.html$/);
    await expect(page.getByRole('button', { name: 'View details for Sauce Labs Backpack' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View details for Sauce Labs Bike Light' })).toBeVisible();
  });

  test('business rule: do not proceed to checkout with an empty cart', async ({ page }) => {
    test.fail(true, 'Known business-rule defect: the application allows checkout with an empty cart.');
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/cart\.html$/);
    await page.getByRole('button', { name: 'Checkout' }).click();

    await expect(page).not.toHaveURL(/checkout-step-one\.html$/);
  });

  test('technical note: browser Back returns from overview to information', async ({ page }) => {
    await addBackpackAndBikeLight(page);
    await openCheckout(page);
    await enterValidInformation(page);
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-two\.html$/);
    await page.goBack();

    await expect(page).toHaveURL(/checkout-step-one\.html$/);
    await expect(page.locator('[data-test="firstName"]')).toBeVisible();
  });

  test('business rule: logged-out users cannot access checkout', async ({ browser }) => {
    const context = await browser.newContext();
    const unauthenticatedPage = await context.newPage();

    try {
      await unauthenticatedPage.goto(`${appUrl}/checkout-step-one.html`);
      await expect(unauthenticatedPage).toHaveURL(appUrl + '/');
      await expect(unauthenticatedPage.getByRole('form', { name: 'Login' })).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
