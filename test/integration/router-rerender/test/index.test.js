/* eslint-env jest */

import { join } from 'path'
import {
  findPort,
  killApp,
  launchApp,
  nextBuild,
  nextStart,
  shouldRunTurboDevTest,
} from 'next-test-utils'
import webdriver from 'next-webdriver'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '../')

let appPort
let app

const runTests = () => {
  describe('with middleware', () => {
    it('should not trigger unncessary rerenders when middleware is used', async () => {
      const browser = await webdriver(appPort, '/')
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(await browser.eval('window.__renders')).toEqual([undefined])
    })
  })

  describe('with rewrites', () => {
    // TODO: Figure out the `isReady` issue.
    it.skip('should not trigger unncessary rerenders when rewrites are used', async () => {})
    it.skip('should rerender with the correct query parameter if present with rewrites', async () => {})
  })
}

describe('router rerender', () => {
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
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })
})
