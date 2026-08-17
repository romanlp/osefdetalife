import { test, expect } from '../fixtures';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

test.describe('Public Booking Page', () => {
  test('[P0] valid slug renders restaurant name, address, and Book a Table button', async ({
    page,
    db,
    restaurant,
  }) => {
    const slugDoc = await getDoc(doc(db, 'slugs', restaurant.slug));
    expect(slugDoc.exists()).toBe(true);
    expect(slugDoc.data()?.restaurantId).toBe(restaurant.id);

    await page.goto(`/book/${restaurant.slug}`);

    await expect(page.getByTestId('restaurant-name')).toHaveText(restaurant.name);
    await expect(page.getByTestId('restaurant-address')).toHaveText(restaurant.address);
    await expect(page.getByTestId('book-button')).toBeVisible();
    await expect(page.getByTestId('book-button')).toHaveText('Book a Table');
  });

  test('[P1] invalid slug shows "Restaurant not found"', async ({ page }) => {
    await page.goto('/book/definitely-not-a-real-slug');

    await expect(page.getByText('Restaurant not found')).toBeVisible();
    await expect(page.getByTestId('book-button')).toHaveCount(0);
  });

  test('[P1] address element is hidden when restaurant has no address', async ({
    page,
    db,
    restaurant,
  }) => {
    await updateDoc(doc(db, 'restaurants', restaurant.id), {
      address: deleteField(),
    });

    await page.goto(`/book/${restaurant.slug}`);

    await expect(page.getByTestId('restaurant-name')).toHaveText(restaurant.name);
    await expect(page.getByTestId('restaurant-address')).toHaveCount(0);
    await expect(page.getByTestId('book-button')).toBeVisible();
  });
});
