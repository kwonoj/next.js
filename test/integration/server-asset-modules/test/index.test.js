/* eslint-env jest */

import {
  fetchViaHTTP,
  findPort,
  killApp,
  launchApp,
  nextBuild,
  nextStart,
  shouldRunTurboDevTest,
} from 'next-test-utils'
import { join } from 'path'

jest.setTimeout(1000 * 60 * 2)

const shouldRunTurboDev = shouldRunTurboDevTest()
let app
let appPort
const appDir = join(__dirname, '../')

function runTests() {
  it('should enable reading local files in api routes', async () => {
    const res = await fetchViaHTTP(appPort, '/api/test', null, {})
    expect(res.status).toEqual(200)
    const content = await res.json()
    expect(content).toHaveProperty('message', 'hello world')
  })
}

describe('serverside asset modules', () => {
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
