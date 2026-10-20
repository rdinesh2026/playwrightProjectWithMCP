# SCRUM-101 SauceDemo Checkout Test Plan

## Application Overview

Validate the SauceDemo e-commerce checkout flow for SCRUM-101 across inventory, cart, checkout information, overview, and confirmation. Target https://www.saucedemo.com using standard_user / secret_sauce. Exploration confirmed that non-empty malformed values are accepted, so that scenario records an observed acceptance-criteria defect rather than assuming unsupported validation.

## Test Scenarios

### 1. Checkout flow

**Seed:** `tests/seed.spec.ts`

#### 1.1. Review selected products in cart

**File:** `tests/saucedemo-checkout/cart-review.spec.ts`

**Steps:**
  1. Log in as standard_user / secret_sauce.
    - expect: The Products page is shown.
  2. Add Sauce Labs Backpack and Sauce Labs Bike Light to the cart.
    - expect: The cart badge shows 2 items.
  3. Open the cart.
    - expect: Both product names, descriptions, prices, and quantity 1 are shown.
    - expect: Continue Shopping and Checkout actions are available.
  4. Review cart price summary.
    - expect: Record whether a total/subtotal is displayed; manual exploration did not expose a cart total, while the overview totals the order.

#### 1.2. Require each checkout information field

**File:** `tests/saucedemo-checkout/required-fields.spec.ts`

**Steps:**
  1. Prepare a cart with one product, open Checkout, leave all fields empty, and click Continue.
    - expect: Remain on Checkout: Your Information.
    - expect: Show Error: First Name is required.
  2. Enter a first name only and click Continue.
    - expect: Remain on the information page and show Error: Last Name is required.
  3. Enter first and last name but leave postal code empty and click Continue.
    - expect: Remain on the information page and show Error: Postal Code is required.

#### 1.3. Reject malformed checkout values

**File:** `tests/saucedemo-checkout/invalid-information.spec.ts`

**Steps:**
  1. Enter non-empty values Ava!@#, Test123$, and !@# in the three checkout fields, then click Continue.
    - expect: Expected by AC5: show a validation error and do not proceed.
    - expect: Observed: the app navigates to Checkout: Overview, accepting the malformed values; report this as a defect.

#### 1.4. Verify order overview totals

**File:** `tests/saucedemo-checkout/order-overview.spec.ts`

**Steps:**
  1. Add Backpack and Bike Light and enter valid checkout details.
    - expect: Proceed to Checkout: Overview.
  2. Review items, payment, shipping, and totals.
    - expect: Backpack $29.99 and Bike Light $9.99 are listed.
    - expect: Payment is SauceCard #31337 and shipping is Free Pony Express Delivery!.
    - expect: Item total is $39.98, tax is $3.20, and total is $43.18.
    - expect: Cancel and Finish are available.

#### 1.5. Cancel checkout and return to cart

**File:** `tests/saucedemo-checkout/cancel-navigation.spec.ts`

**Steps:**
  1. With items in cart, open checkout information and click Cancel.
    - expect: Return to the cart with the existing items retained.
  2. Proceed to overview and click Cancel.
    - expect: Return to the inventory or cart as implemented; verify cart items are not lost and record actual navigation.

#### 1.6. Complete order and clear cart

**File:** `tests/saucedemo-checkout/order-completion.spec.ts`

**Steps:**
  1. Complete checkout with valid first name, last name, and postal code.
    - expect: The overview shows the selected order and calculated totals.
  2. Click Finish.
    - expect: Navigate to the confirmation page and show a successful order message with Back Home.
  3. Click Back Home and inspect the cart badge/cart.
    - expect: Return to Products and the cart is empty.

#### 1.7. Prevent checkout without a cart or login

**File:** `tests/saucedemo-checkout/access-guards.spec.ts`

**Steps:**
  1. While logged in with an empty cart, navigate directly to checkout or click the cart's checkout path.
    - expect: Checkout must not complete with an empty cart; record the app's actual behavior.
  2. Log out and navigate directly to a checkout URL.
    - expect: A logged-out user cannot access checkout and is redirected to login or otherwise blocked.

#### 1.8. Browser back navigation

**File:** `tests/saucedemo-checkout/back-navigation.spec.ts`

**Steps:**
  1. Proceed from checkout information to overview, then use browser Back.
    - expect: Return to checkout information with entered values handled consistently.
  2. Use browser Back to return toward cart/inventory.
    - expect: Navigation is stable and cart state is retained.
