/* eslint-env jest */

import fs from 'fs-extra'
import { join } from 'path'
import {
  renderViaHTTP,
  findPort,
  nextBuild,
  nextStart,
  killApp,
  launchApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '..')
const page404 = join(appDir, 'pages/404.js')
let appPort
let app

const runTests = () => {
  it('renders custom _error successfully', async () => {
    const html = await renderViaHTTP(appPort, '/')
    expect(html).toMatch(/Custom error/)
  })
}

const customErrNo404Match =
  /You have added a custom \/_error page without a custom \/404 page/

describe('Custom _error', () => {
  describe.each([
    ['dev', false],
    ['turbo', true],
  ])('%s mode 1', (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    let stderr = ''

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

    it('should not warn with /_error and /404 when rendering error first', async () => {
      stderr = ''
      await fs.writeFile(page404, 'export default <h1>')
      const html = await renderViaHTTP(appPort, '/404')
      await fs.remove(page404)
      expect(html).toContain('Unexpected eof')
      expect(stderr).not.toMatch(customErrNo404Match)
    })
  })

  describe.each([
    ['dev', false],
    ['turbo', true],
  ])('%s mode 2', (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    let stderr = ''

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

    it('should not warn with /_error and /404', async () => {
      stderr = ''
      await fs.writeFile(page404, `export default () => 'not found...'`)
      const html = await renderViaHTTP(appPort, '/404')
      await fs.remove(page404)
      expect(html).toContain('not found...')
      expect(stderr).not.toMatch(customErrNo404Match)
    })

    it('should warn on custom /_error without custom /404', async () => {
      stderr = ''
      const html = await renderViaHTTP(appPort, '/404')
      expect(html).toContain('An error 404 occurred on server')
      expect(stderr).toMatch(customErrNo404Match)
    })
  })

  describe('production mode', () => {
    let buildOutput = ''

    beforeAll(async () => {
      const { stdout, stderr } = await nextBuild(appDir, undefined, {
        stdout: true,
        stderr: true,
      })
      buildOutput = (stdout || '') + (stderr || '')
      appPort = await findPort()
      app = await nextStart(appDir, appPort)
    })
    afterAll(() => killApp(app))

    it('should not contain /_error in build output', async () => {
      expect(buildOutput).toMatch(/λ .*?\/404/)
      expect(buildOutput).not.toMatch(/λ .*?\/_error/)
    })

    runTests()
  })
})
