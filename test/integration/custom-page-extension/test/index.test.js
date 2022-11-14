/* eslint-env jest */

import { join } from 'path'
import {
  nextBuild,
  nextStart,
  findPort,
  launchApp,
  killApp,
  renderViaHTTP,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '..')
let appPort
let app

const runTests = () => {
  it('should work with normal page', async () => {
    const html = await renderViaHTTP(appPort, '/blog')
    expect(html).toContain('Blog - CPE')
  })

  it('should work dynamic page', async () => {
    const html = await renderViaHTTP(appPort, '/blog/nextjs')
    expect(html).toContain('Post - nextjs')
  })
}

describe('Custom page extension', () => {
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
