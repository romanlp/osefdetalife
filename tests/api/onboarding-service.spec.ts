import { test, expect } from '@playwright/test';

test.describe('Onboarding Service API Tests (ATDD)', () => {
  test.skip('[P0] should create restaurant document in Firestore', async ({ request }) => {
    const restaurantData = {
      name: 'The Blue Bistro',
      slug: 'the-blue-bistro',
      address: '123 Main St, London, UK',
      ownerId: 'user-123',
    };

    const response = await request.post('/api/restaurants', {
      data: restaurantData,
    });

    expect(response.status()).toBe(201);

    const restaurant = await response.json();
    expect(restaurant).toMatchObject({
      id: expect.any(String),
      name: 'The Blue Bistro',
      slug: 'the-blue-bistro',
      address: '123 Main St, London, UK',
      ownerId: 'user-123',
      createdAt: expect.any(String),
    });
  });

  test.skip('[P0] should check slug availability in real-time', async ({ request }) => {
    const response = await request.get('/api/restaurants/check-slug/the-blue-bistro');

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result).toMatchObject({
      available: expect.any(Boolean),
      slug: 'the-blue-bistro',
    });
  });

  test.skip('[P1] should return 409 when slug already exists', async ({ request }) => {
    // First create a restaurant with the slug
    await request.post('/api/restaurants', {
      data: {
        name: 'Existing Restaurant',
        slug: 'existing-slug',
        ownerId: 'user-456',
      },
    });

    // Then try to check availability
    const response = await request.get('/api/restaurants/check-slug/existing-slug');

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result).toMatchObject({
      available: false,
      slug: 'existing-slug',
    });
  });

  test.skip('[P1] should update restaurant document', async ({ request }) => {
    const updateData = {
      name: 'Updated Blue Bistro',
      address: '456 Oak Ave, London, UK',
    };

    const response = await request.patch('/api/restaurants/restaurant-123', {
      data: updateData,
    });

    expect(response.status()).toBe(200);

    const restaurant = await response.json();
    expect(restaurant).toMatchObject({
      id: 'restaurant-123',
      name: 'Updated Blue Bistro',
      address: '456 Oak Ave, London, UK',
    });
  });

  test.skip('[P2] should get restaurant document', async ({ request }) => {
    const response = await request.get('/api/restaurants/restaurant-123');

    expect(response.status()).toBe(200);

    const restaurant = await response.json();
    expect(restaurant).toMatchObject({
      id: 'restaurant-123',
      name: expect.any(String),
      slug: expect.any(String),
      ownerId: expect.any(String),
    });
  });
});
