/* eslint-env jest */

import { join } from 'path'
import webdriver from 'next-webdriver'
import {
  findPort,
  launchApp,
  killApp,
  waitFor,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '../')

describe.each([
  ['dev', false],
  ['turbo', true],
])('%s', (_name, turbo) => {
  if (!!turbo && !shouldRunTurboDev) {
    return
  }

  let app
  let appPort

  beforeAll(async () => {
    appPort = await findPort()
    app = await launchApp(appDir, appPort, { turbo })
  })

  // see issue #22099
  it('page should not reload when the file is not changed', async () => {
    const browser = await webdriver(appPort, '/with+Special&Chars=')

    browser.eval(`window.doesNotReloadCheck = true`)

    await waitFor(10000)

    expect(await browser.eval('window.doesNotReloadCheck')).toBe(true)
  })

  afterAll(() => killApp(app))
})
