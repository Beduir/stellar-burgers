import { expect, test } from '@playwright/test';

import ingredients from './fixtures/ingredients.json' with { type: 'json' };

import type { Locator, Page } from '@playwright/test';

const [bun, main, sauce] = ingredients;

const getIngredientCard = (page: Page, name: string): Locator =>
  page.getByRole('listitem').filter({
    has: page.getByRole('link').filter({ hasText: name }),
  });

const getConstructor = (page: Page): Locator =>
  page.locator('section').filter({
    has: page.getByRole('button', { name: 'Оформить заказ', exact: true }),
  });

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/**',
      notFound: 'abort',
    });
  });

  test('добавляет булку, начинку и соус в конструктор', async ({ page }) => {
    await page.goto('/');

    for (const ingredient of ingredients) {
      await getIngredientCard(page, ingredient.name)
        .getByRole('button', { name: 'Добавить', exact: true })
        .click();
    }

    const constructor = getConstructor(page);
    await expect(
      constructor.getByText(`${bun.name} (верх)`, { exact: true })
    ).toBeVisible();
    await expect(
      constructor.getByText(`${bun.name} (низ)`, { exact: true })
    ).toBeVisible();
    await expect(constructor.getByText(main.name, { exact: true })).toBeVisible();
    await expect(constructor.getByText(sauce.name, { exact: true })).toBeVisible();

    const totalPrice = bun.price * 2 + main.price + sauce.price;
    await expect(
      constructor.getByText(String(totalPrice), { exact: true })
    ).toBeVisible();
  });

  test('открывает детали ингредиента и закрывает их крестиком', async ({ page }) => {
    await page.goto('/');
    await getIngredientCard(page, bun.name).getByRole('link').click();

    const modal = page.locator('#modals');
    await expect(page).toHaveURL(`/ingredients/${bun._id}`);
    await expect(
      modal.getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible();
    await expect(
      modal.getByRole('heading', { name: bun.name, exact: true })
    ).toBeVisible();
    await expect(
      modal
        .getByRole('listitem')
        .filter({ hasText: 'Калории, ккал' })
        .getByText(String(bun.calories), { exact: true })
    ).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(modal).toBeEmpty();
    await expect(page).toHaveURL('/');
  });

  test('закрывает модальное окно по клику на оверлей', async ({ page }) => {
    await page.goto('/');
    await getIngredientCard(page, main.name).getByRole('link').click();

    const modal = page.locator('#modals');
    await expect(
      modal.getByRole('heading', { name: main.name, exact: true })
    ).toBeVisible();

    await page.locator('[class*="modal-overlay__overlay"]').click({
      position: { x: 10, y: 10 },
    });
    await expect(modal).toBeEmpty();
    await expect(page).toHaveURL('/');
  });

  test('оформляет заказ и очищает конструктор', async ({ page, context }) => {
    const accessToken = 'Bearer test-access-token';
    const userName = 'Тестовый пользователь';
    const orderNumber = 12345;
    const ingredientIds = [bun._id, main._id, sauce._id, bun._id];

    await context.addCookies([
      {
        name: 'accessToken',
        value: encodeURIComponent(accessToken),
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });
    await page.routeFromHAR('tests/hars/user.har', {
      url: '**/api/auth/user',
      notFound: 'abort',
    });
    await page.routeFromHAR('tests/hars/order.har', {
      url: '**/api/orders',
      notFound: 'abort',
    });
    await page.goto('/');
    await expect(
      page.locator('header').getByRole('link', { name: userName })
    ).toBeVisible();

    for (const ingredient of ingredients) {
      await getIngredientCard(page, ingredient.name)
        .getByRole('button', { name: 'Добавить', exact: true })
        .click();
    }

    const orderRequest = page.waitForRequest(
      (request) => request.url().endsWith('/api/orders') && request.method() === 'POST'
    );
    await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();
    const request = await orderRequest;
    expect(request.postDataJSON()).toEqual({ ingredients: ingredientIds });
    expect(request.headers().authorization).toBe(accessToken);

    const modal = page.locator('#modals');
    await expect(
      modal.getByRole('heading', { name: String(orderNumber), exact: true })
    ).toBeVisible();

    const constructor = getConstructor(page);
    await expect(constructor.getByText('Выберите булки', { exact: true })).toHaveCount(
      2
    );
    await expect(
      constructor.getByText('Выберите начинку', { exact: true })
    ).toBeVisible();
    await expect(constructor.getByText(main.name, { exact: true })).toHaveCount(0);
    await expect(constructor.getByText(sauce.name, { exact: true })).toHaveCount(0);
    await expect(constructor.getByText('0', { exact: true })).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(modal).toBeEmpty();
  });
});
