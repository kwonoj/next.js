/* eslint-env jest */

import { join } from 'path'
import {
  killApp,
  findPort,
  launchApp,
  fetchViaHTTP,
  getPageFileFromBuildManifest,
  renderViaHTTP,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '../')

let appPort
let app

const runTest = (mode = 'server') => {
  it('supports trailing slash', async () => {
    // Make sure the page is built before getting the file
    await renderViaHTTP(appPort, '/')
    const file = getPageFileFromBuildManifest(appDir, '/')
    const res = await fetchViaHTTP(appPort, join('/_next', file))

    expect(res.status).toBe(200)
  })
}

describe('Trailing slash in distDir', () => {
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
    runTest('dev')
  })
})
