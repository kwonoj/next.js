/* eslint-env jest */

import {
  findPort,
  killApp,
  launchApp,
  renderViaHTTP,
  shouldRunTurboDevTest,
} from 'next-test-utils'
import { join } from 'path'
import waitPort from 'wait-port'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '../')

let appPort
let app

describe.each([
  ['dev', false],
  ['turbo', true],
])('Handles a broken webpack plugin (precompile) %s', (_name, turbo) => {
  if (!!turbo && !shouldRunTurboDev) {
    return
  }

  let stderr = ''
  beforeAll(async () => {
    appPort = await findPort()
    app = await launchApp(appDir, appPort, {
      turbo: !!turbo,
      stderr: true,
      nextStart: true,
      onStderr(text) {
        stderr += text
      },
    })
    await waitPort({
      host: 'localhost',
      port: appPort,
    })
  })
  afterAll(() => killApp(app))

  beforeEach(() => {
    stderr = ''
  })

  it('should render error correctly', async () => {
    const text = await renderViaHTTP(appPort, '/')
    expect(text).toContain('Internal Server Error')

    expect(stderr).toMatch('Error: oops')
  })
})
