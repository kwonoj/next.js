/* eslint-env jest */

import { join } from 'path'
import {
  renderViaHTTP,
  launchApp,
  findPort,
  killApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
let server
let appPort

describe.each([
  ['dev', false],
  ['turbo', true],
])('Dynamic require %s', (_name, turbo) => {
  if (!!turbo && !shouldRunTurboDev) {
    return
  }

  beforeAll(async () => {
    appPort = await findPort()
    server = await launchApp(join(__dirname, '../'), appPort, {
      turbo: !!turbo,
    })
  })
  afterAll(() => killApp(server))

  it('should not throw error when dynamic require is used', async () => {
    const html = await renderViaHTTP(appPort, '/')
    expect(html).toMatch(/If you can see this then we are good/)
  })
})
