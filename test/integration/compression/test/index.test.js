/* eslint-env jest */

import { join } from 'path'
import {
  fetchViaHTTP,
  renderViaHTTP,
  findPort,
  launchApp,
  killApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const context = {}

describe.each([
  ['dev', false],
  ['turbo', true],
])('Compression %s', (_name, turbo) => {
  if (!!turbo && !shouldRunTurboDev) {
    return
  }

  beforeAll(async () => {
    context.appPort = await findPort()
    context.server = await launchApp(join(__dirname, '../'), context.appPort, {
      turbo: !!turbo,
    })

    // pre-build page at the start
    await renderViaHTTP(context.appPort, '/')
  })
  afterAll(() => killApp(context.server))

  it('should compress responses by default', async () => {
    const res = await fetchViaHTTP(context.appPort, '/')

    expect(res.headers.get('content-encoding')).toMatch(/gzip/)
  })
})
