import { expect, test } from '@playwright/test';

test('Overview works before login and keyboard navigation opens the existing Wizard', async ({ page }) => {
  const unexpected: string[] = [];
  page.on('request', request => {
    if (request.resourceType() === 'fetch' || request.resourceType() === 'xhr' ||
        /fonts\.googleapis|fonts\.gstatic/.test(request.url())) unexpected.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByText('System Bootstrapper', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Getting Started', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeHidden();
  await expect(page.getByRole('tab', { name: 'Privacy', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Read the handbook', exact: true }))
    .toHaveAttribute('href', 'https://github.com/kihyoun/system/blob/master/docs/HANDBOOK.md');
  const navigation = page.getByRole('tablist', { name: 'Main navigation' });
  await navigation.getByRole('tab', { name: 'Overview', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(navigation.getByRole('tab', { name: 'Wizard', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'General', exact: true })).toBeVisible();
  expect(unexpected).toEqual([]);
});

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`Overview and its blue footer remain usable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route('**/privacy-instance.json', route => route.fulfill({ json: {
      operatorName: 'Max Mustermann', operatorAddress: 'Musterstraße 1\n12345 Musterstadt\nDeutschland',
      contactEmail: 'kontakt@example.com', privacyNoticeUrl: '', accessLogRetention: '', additionalPrivacyText: ''
    } }));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Getting Started', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Wizard', exact: true }))
      .toHaveCSS('background-color', 'rgb(245, 0, 87)');
    await page.screenshot({ path: test.info().outputPath(`overview-${viewport.width}.png`), fullPage: true, animations: 'disabled' });
    for (const destination of ['Overview', 'Wizard', 'Privacy', 'Imprint']) {
      if (destination !== 'Overview') {
        await page.getByRole('navigation', { name: 'Footer navigation' })
          .getByRole('button', { name: destination, exact: true }).click();
      }
      if (destination === 'Wizard') {
        await page.getByRole('tab', { name: 'Website', exact: true }).click();
        await expect(page.getByLabel('Operator name', { exact: true })).toHaveValue('Max Mustermann');
        await expect(page.getByLabel('Operator name', { exact: true })).toHaveAttribute('placeholder', 'Max Mustermann');
        await expect(page.getByLabel('Postal address', { exact: true })).toHaveValue('Musterstraße 1\n12345 Musterstadt\nDeutschland');
        await expect(page.getByLabel('Contact email', { exact: true })).toHaveValue('kontakt@example.com');
        await expect(page.getByLabel('Access-log retention', { exact: true })).toHaveValue('');
        await page.screenshot({ path: test.info().outputPath(`website-settings-${viewport.width}.png`), fullPage: true, animations: 'disabled' });
      }
      const footer = page.getByRole('contentinfo');
      const github = footer.getByRole('link', { name: 'System Bootstrapper on GitHub', exact: true });
      await github.scrollIntoViewIfNeeded();
      await expect(github).toBeVisible();
      await expect(github).toHaveCSS('color', 'rgb(255, 255, 255)');
      const layout = await github.evaluate(link => {
        const box = link.getBoundingClientRect();
        const footer = link.closest('footer')!.getBoundingClientRect();
        return { center: (box.left + box.right) / 2, footerCenter: (footer.left + footer.right) / 2,
          withinViewport: box.left >= 0 && box.right <= innerWidth,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      expect(layout.withinViewport).toBe(true);
      expect(layout.horizontalOverflow).toBe(false);
      expect(Math.abs(layout.center - layout.footerCenter)).toBeLessThan(2);
      await github.focus();
      await expect(github).toBeFocused();
      if (destination === 'Privacy' || destination === 'Imprint') {
        await expect(page.getByRole('heading', { name: destination, exact: true })).toHaveCount(1);
        await expect(page.getByRole('note')).toContainText('Example operator details.');
        await page.screenshot({ path: test.info().outputPath(`${destination.toLowerCase()}-${viewport.width}.png`), fullPage: true, animations: 'disabled' });
      }
    }
  });
}

test('cleared published details show an unconfigured notice and never publish input placeholders', async ({ page }) => {
  await page.route('**/privacy-instance.json', route => route.fulfill({ json: {
    operatorName: '', operatorAddress: '', contactEmail: '', privacyNoticeUrl: '',
    accessLogRetention: '', additionalPrivacyText: '', SYNC_PASS: 'not-public'
  } }));
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('button', { name: 'Imprint', exact: true }).click();
  await expect(page.getByText('The operator has not yet published contact details through this interface.', { exact: false })).toBeVisible();
  const visibleText = await page.locator('main').innerText();
  expect(visibleText).not.toContain('Max Mustermann');
  expect(visibleText).not.toContain('kontakt@example.com');
  expect(visibleText).not.toContain('not-public');
  await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('button', { name: 'Wizard', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeVisible();
});
