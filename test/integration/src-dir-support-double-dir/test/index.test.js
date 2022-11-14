/* eslint-env jest */

import { join } from 'path'
import {
  renderViaHTTP,
  findPort,
  launchApp,
  killApp,
  nextBuild,
  nextStart,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
let app
let appPort
const appDir = join(__dirname, '../')

function runTests(dev) {
  it('should render from pages', async () => {
    const html = await renderViaHTTP(appPort, '/')
    expect(html).toMatch(/PAGES/)
  })

  it('should render not render from src/pages', async () => {
    const html = await renderViaHTTP(appPort, '/hello')
    expect(html).toMatch(/404/)
  })
}

describe('Dynamic Routing', () => {
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
      await nextBuild(appDir)

      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })
})
