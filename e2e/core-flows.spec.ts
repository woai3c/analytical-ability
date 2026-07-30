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
            methodSelection: {
              selectedMethods: ['fishbone'],
              reasoning: 'The failure happens only with one payment option.',
              aiResponse: 'The scope is specific and measurable.',
            },
            analysis: null,
            reflection: null,
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

test('shows the complete selected method introduction inside practice', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      'clarity-guided-session',
      JSON.stringify({
        id: 'guided-e2e',
        scenario: {
          id: 'checkout-cancellations',
          title: '订单取消率上升',
          description: '订单取消率在一个月内明显上升。',
          context: '团队需要系统排查所有候选原因。',
          difficulty: 'beginner',
          taskType: 'diagnosis',
          applicableMethods: ['fishbone'],
          explanations: { fishbone: '适合系统展开候选原因。' },
          commonMistakes: [],
        },
        difficulty: 'beginner',
        currentStep: 1,
        steps: {
          methodSelection: null,
          analysis: null,
          reflection: null,
        },
        tokenUsage: { promptTokens: 10, completionTokens: 10 },
        startedAt: '2026-07-29T12:00:00.000Z',
        completedAt: null,
      }),
    )
  })

  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/practice')

  const progressGeometry = await page.getByTestId('step-progress').evaluate((progress) => {
    const progressRect = progress.getBoundingClientRect()
    const markerCenters = Array.from({ length: 3 }, (_, index) => {
      const marker = progress.querySelector(`[data-testid="step-marker-${index + 1}"]`)
      const label = progress.querySelector(`[data-testid="step-label-${index + 1}"]`)
      if (!(marker instanceof HTMLElement) || !(label instanceof HTMLElement)) throw new Error('Missing progress step')

      const markerRect = marker.getBoundingClientRect()
      const labelRect = label.getBoundingClientRect()
      return {
        marker: markerRect.left + markerRect.width / 2,
        label: labelRect.left + labelRect.width / 2,
      }
    })

    return {
      startGap: markerCenters[0]!.marker - progressRect.left,
      endGap: progressRect.right - markerCenters[2]!.marker,
      alignmentGaps: markerCenters.map(({ marker, label }) => Math.abs(marker - label)),
    }
  })

  expect(Math.abs(progressGeometry.startGap)).toBeLessThan(1)
  expect(Math.abs(progressGeometry.endGap)).toBeLessThan(1)
  for (const alignmentGap of progressGeometry.alignmentGaps) expect(alignmentGap).toBeLessThan(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

  const methodGuideButton = page.getByRole('button', { name: '完整方法说明' })
  await expect(methodGuideButton).toBeVisible()
  await methodGuideButton.click()

  const dialog = page.getByRole('dialog', { name: '方法介绍' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: '鱼骨分析' })).toBeVisible()
  await expect(dialog.getByRole('heading', { name: '什么时候用' })).toBeVisible()
  await expect(dialog.getByRole('heading', { name: '操作步骤' })).toBeVisible()
  await expect(dialog.getByRole('heading', { name: '完整示例' })).toBeVisible()
  await expect(dialog.getByRole('heading', { name: '使用边界与常见误区' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page).toHaveURL(/\/practice$/)
})
