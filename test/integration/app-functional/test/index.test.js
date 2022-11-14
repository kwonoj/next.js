/* eslint-env jest */

import { join } from 'path'
import {
  renderViaHTTP,
  findPort,
  launchApp,
  killApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const context = {
  output: '',
}

const collectOutput = (message) => {
  context.output += message
}

describe.each([
  ['dev', false],
  ['turbo', true],
])('Document and App %s', (_name, turbo) => {
  if (!!turbo && !shouldRunTurboDev) {
    return
  }

  beforeAll(async () => {
    context.appPort = await findPort()
    context.server = await launchApp(join(__dirname, '../'), context.appPort, {
      turbo: !!turbo,
      onStdout: collectOutput,
      onStderr: collectOutput,
    })

    // pre-build all pages at the start
    await Promise.all([renderViaHTTP(context.appPort, '/')])
  })
  afterAll(() => killApp(context.server))

  it('should not have any missing key warnings', async () => {
    const html = await renderViaHTTP(context.appPort, '/')
    expect(html).toMatch(/<div>Hello World!!!<\/div>/)
  })
})
