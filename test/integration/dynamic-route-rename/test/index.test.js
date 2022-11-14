/* eslint-env jest */

import fs from 'fs-extra'
import { join } from 'path'
import {
  renderViaHTTP,
  launchApp,
  findPort,
  killApp,
  waitFor,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()

let app
let appPort
let stderr = ''

const appDir = join(__dirname, '../')
const pageFile = join(appDir, 'pages/[pid].js')
const pageFileAlt = join(appDir, 'pages/[PiD].js')

describe.each([
  ['dev', false],
  ['turbo', true],
])('Dynamic route rename casing %s', (_name, turbo) => {
  if (!!turbo && !shouldRunTurboDev) {
    return
  }

  beforeAll(async () => {
    appPort = await findPort()
    app = await launchApp(appDir, appPort, {
      turbo: !!turbo,
      onStderr(msg) {
        stderr += msg || ''
      },
    })
  })
  afterAll(() => killApp(app))

  it('should not throw error when changing casing of dynamic route file', async () => {
    // make sure route is loaded in webpack
    const html = await renderViaHTTP(appPort, '/abc')
    expect(html).toContain('hi')

    await fs.rename(pageFile, pageFileAlt)
    await waitFor(2000)

    expect(stderr).not.toContain(
      `You cannot use different slug names for the same dynamic path`
    )

    await fs.rename(pageFileAlt, pageFile)
    await waitFor(2000)

    expect(stderr).not.toContain(
      `You cannot use different slug names for the same dynamic path`
    )
  })
})
