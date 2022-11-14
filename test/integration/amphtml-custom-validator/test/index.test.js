/* eslint-env jest */

import { join } from 'path'
import {
  nextBuild,
  findPort,
  nextStart,
  killApp,
  launchApp,
  renderViaHTTP,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
let app
let appPort
const appDir = join(__dirname, '../')

describe('AMP Custom Validator', () => {
  it('should build and start successfully', async () => {
    const { code } = await nextBuild(appDir)
    expect(code).toBe(0)

    appPort = await findPort()
    app = await nextStart(appDir, appPort)

    const html = await renderViaHTTP(appPort, '/')
    await killApp(app)

    expect(html).toContain('Hello from AMP')
  })

  it.each([
    ['dev', false],
    ['turbo', true],
  ])('should run in dev mode successfully %s', async (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    let stderr = ''

    appPort = await findPort()
    app = await launchApp(appDir, appPort, {
      turbo: !!turbo,
      onStderr(msg) {
        stderr += msg || ''
      },
    })

    const html = await renderViaHTTP(appPort, '/')
    await killApp(app)

    expect(stderr).not.toContain('error')
    expect(html).toContain('Hello from AMP')
  })
})
