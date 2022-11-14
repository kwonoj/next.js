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

  it('should show error when a Next prop is returned in _app.getInitialProps', async () => {
    const html = await renderViaHTTP(appPort, '/')
    expect(html).toMatch(/\/cant-override-next-props/)
  })
})
