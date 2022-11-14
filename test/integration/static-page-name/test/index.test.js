/* eslint-env jest */

import path from 'path'
import webdriver from 'next-webdriver'
import {
  launchApp,
  killApp,
  findPort,
  nextBuild,
  nextStart,
  renderViaHTTP,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = path.join(__dirname, '..')
let app
let appPort

const runTests = () => {
  it('should render the page via SSR correctly', async () => {
    const html = await renderViaHTTP(appPort, '/static')
    expect(html).toMatch(/hello from static page/)
  })

  it('should navigate to static page name correctly', async () => {
    const browser = await webdriver(appPort, '/')
    await browser.elementByCss('#to-static').click()
    await browser.waitForElementByCss('#static')
    const html = await browser.eval(`document.documentElement.innerHTML`)
    expect(html).toMatch(/hello from static page/)
  })
}

describe('Static Page Name', () => {
  describe.each([
    ['dev', false],
    ['turbo', true],
  ])('%s mode', (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort, { turbo })
    })
    afterAll(() => killApp(app))
    runTests()
  })

  describe('production mode', () => {
    beforeAll(async () => {
      appPort = await findPort()
      await nextBuild(appDir)
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))
    runTests()
  })
})
