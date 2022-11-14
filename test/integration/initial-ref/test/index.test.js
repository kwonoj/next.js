/* eslint-env jest */

import path from 'path'
import webdriver from 'next-webdriver'
import {
  nextBuild,
  nextStart,
  launchApp,
  findPort,
  killApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = path.join(__dirname, '..')
let app
let appPort

const runTest = () => {
  it('Has correct initial ref values', async () => {
    const browser = await webdriver(appPort, '/')
    expect(await browser.elementByCss('#ref-val').text()).toContain('76px')
  })
}

describe('Initial Refs', () => {
  describe('production mode', () => {
    beforeAll(async () => {
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTest()
  })

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

    runTest()
  })
})
