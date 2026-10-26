import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // Serial GPU/browser execution is the reproducible default on this Windows host.
  workers: process.platform==='win32' ? 1 : process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173',
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    { name: 'compact', use: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true } },
    { name: 'wide-mobile', use: { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true } },
    { name: 'landscape', use: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true } },
    ...[
      { name: 'webkit-desktop',width: 1440,height: 900,mobile: false },
      { name: 'webkit-mobile',width: 390,height: 844,mobile: true },
      { name: 'webkit-compact',width: 320,height: 568,mobile: true },
      { name: 'webkit-wide-mobile',width: 430,height: 932,mobile: true },
      { name: 'webkit-landscape',width: 844,height: 390,mobile: true },
      { name: 'webkit-tablet',width: 768,height: 1024,mobile: true },
    ].map(project => ({ name: project.name,use: { browserName: 'webkit' as const,channel: undefined,viewport: { width: project.width,height: project.height },isMobile: project.mobile,hasTouch: project.mobile } })),
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'node scripts/testing/dev-server.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
