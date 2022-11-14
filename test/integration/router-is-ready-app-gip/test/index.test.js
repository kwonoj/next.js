/* eslint-env jest */

import { join } from 'path'
import webdriver from 'next-webdriver'
import {
  findPort,
  launchApp,
  killApp,
  nextStart,
  nextBuild,
  File,
  check,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
let app
let appPort
const appDir = join(__dirname, '../')
const invalidPage = new File(join(appDir, 'pages/invalid.js'))

const checkIsReadyValues = (browser, expected = []) => {
  return check(async () => {
    const values = JSON.stringify(
      (await browser.eval('window.isReadyValues')).sort()
    )
    return JSON.stringify(expected.sort()) === values ? 'success' : values
  }, 'success')
}

function runTests() {
  it('isReady should be true immediately for pages without getStaticProps', async () => {
    const browser = await webdriver(appPort, '/appGip')
    await checkIsReadyValues(browser, [true])
  })

  it('isReady should be true immediately for pages without getStaticProps, with query', async () => {
    const browser = await webdriver(appPort, '/appGip?hello=world')
    await checkIsReadyValues(browser, [true])
  })

  it('isReady should be true immediately for getStaticProps page without query', async () => {
    const browser = await webdriver(appPort, '/gsp')
    await checkIsReadyValues(browser, [true])
  })

  it('isReady should be true after query update for getStaticProps page with query', async () => {
    const browser = await webdriver(appPort, '/gsp?hello=world')
    await checkIsReadyValues(browser, [false, true])
  })
}

describe('router.isReady with appGip', () => {
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
    afterAll(async () => {
      await killApp(app)
      invalidPage.restore()
    })

    runTests()
  })

  describe('production mode', () => {
    beforeAll(async () => {
      await nextBuild(appDir)

      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })
})
