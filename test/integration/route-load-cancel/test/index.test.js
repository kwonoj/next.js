/* eslint-env jest */

import webdriver from 'next-webdriver'
import { join } from 'path'
import {
  findPort,
  launchApp,
  killApp,
  waitFor,
  runNextCommand,
  nextServer,
  startApp,
  stopApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
let app
let appPort
let server
const appDir = join(__dirname, '../')

function runTests() {
  it('should cancel slow page loads on re-navigation', async () => {
    const browser = await webdriver(appPort, '/')
    await waitFor(5000)

    await browser.elementByCss('#link-1').click()
    await waitFor(1000)
    await browser.elementByCss('#link-2').click()
    await waitFor(1000)

    const text = await browser.elementByCss('#page-text').text()
    expect(text).toMatch(/2/)
    expect(await browser.eval('window.routeCancelled')).toBe('yes')
  })
}

describe('next/dynamic', () => {
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

    runTests(true)
  })

  describe('production mode', () => {
    beforeAll(async () => {
      await runNextCommand(['build', appDir])

      app = nextServer({
        dir: appDir,
        dev: false,
        quiet: true,
      })

      server = await startApp(app)
      appPort = server.address().port
    })
    afterAll(() => stopApp(server))

    runTests()
  })
})
