/* eslint-env jest */

import { join } from 'path'
import {
  renderViaHTTP,
  launchApp,
  nextBuild,
  nextStart,
  killApp,
  findPort,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '..')
let appPort
let app

const runTests = () => {
  it('should support optional chaining', async () => {
    const html = await renderViaHTTP(appPort, '/optional-chaining')
    expect(html).toMatch(/result1:.*?nothing/)
    expect(html).toMatch(/result2:.*?something/)
  })

  it('should support nullish coalescing', async () => {
    const html = await renderViaHTTP(appPort, '/nullish-coalescing')
    expect(html).toMatch(/result1:.*?fallback/)
    expect(html).not.toMatch(/result2:.*?fallback/)
  })
}

describe('Optional chaining and nullish coalescing support', () => {
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

  describe('server mode', () => {
    beforeAll(async () => {
      await nextBuild(appDir)
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    runTests()
  })
})
