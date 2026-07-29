import { expect, test } from '@playwright/test'

test('navigates between primary pages and persists the selected language', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '分析方法库' })).toBeVisible()
  await page.getByRole('link', { name: '设置', exact: true }).click()
  await expect(page).toHaveURL(/\/settings$/)

  await page.getByRole('button', { name: '切换到英文' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Switch to Chinese' })).toBeVisible()
})

test('blocks AI practice without a key and persists settings locally', async ({ page }) => {
  await page.goto('/practice')

  await expect(page.getByText('请先配置 AI API Key 才能使用场景训练。')).toBeVisible()
  await page.getByRole('button', { name: '开始训练' }).click()
  await expect(page.getByText('请先在设置页面配置 API Key。')).toBeVisible()

  await page.getByRole('link', { name: '前往设置' }).click()
  const apiKeyInput = page.locator('input[type="password"]')
  await apiKeyInput.fill('e2e-placeholder-key')
  await page.getByRole('button', { name: '保存' }).click()
  await expect(page.getByText('已保存')).toBeVisible()

  await page.reload()
  await expect(apiKeyInput).toHaveValue('e2e-placeholder-key')

  await page.getByRole('link', { name: '场景训练' }).click()
  await expect(page.getByText('请先配置 AI API Key 才能使用场景训练。')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '开始训练' })).toBeVisible()
})

test('loads practice records and reveals saved analysis details', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('analysis-language', 'en')
    localStorage.setItem(
      'clarity-practice-records',
      JSON.stringify([
        {
          scenarioId: 'checkout-failure',
          scenarioTitle: 'Checkout failures',
          scenarioDescription: 'A payment option causes checkout failures.',
          taskType: 'diagnosis',
          selectedMethods: ['fishbone'],
          correct: true,
          score: 88,
          completedAt: '2026-07-28T12:00:00.000Z',
          steps: {
            problemDefinition: {
              userAnswer: 'The failure happens only with one payment option.',
              aiResponse: 'The scope is specific and measurable.',
            },
          },
        },
      ]),
    )
  })

  await page.goto('/progress')

  await expect(page.getByRole('heading', { name: 'My Progress' })).toBeVisible()
  await expect(page.getByText('Total practices').locator('..')).toContainText('1')
  await page.getByRole('button', { name: /Checkout failures/ }).click()

  await expect(page.getByText('A payment option causes checkout failures.')).toBeVisible()
  await expect(page.getByText('The failure happens only with one payment option.')).toBeVisible()
  await expect(page.getByText('The scope is specific and measurable.')).toBeVisible()
})
