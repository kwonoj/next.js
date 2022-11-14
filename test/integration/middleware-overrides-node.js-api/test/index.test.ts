/* eslint-env jest */

import {
  fetchViaHTTP,
  findPort,
  killApp,
  launchApp,
  waitFor,
  shouldRunTurboDevTest,
} from 'next-test-utils'
import { join } from 'path'

const shouldRunTurboDev = shouldRunTurboDevTest()
const context = { appDir: join(__dirname, '../'), appPort: NaN, app: null }

jest.setTimeout(1000 * 60 * 2)

describe('Middleware overriding a Node.js API', () => {
  describe.each([
    ['dev', false],
    ['turbo', true],
  ])('%s mode', (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    let output = ''

    beforeAll(async () => {
      output = ''
      context.appPort = await findPort()
      context.app = await launchApp(context.appDir, context.appPort, {
        turbo: !!turbo,
        onStdout(msg) {
          output += msg
        },
        onStderr(msg) {
          output += msg
        },
      })
    })

    afterAll(() => killApp(context.app))

    it('does not show a warning and allows overriding', async () => {
      const res = await fetchViaHTTP(context.appPort, '/')
      await waitFor(500)
      expect(res.status).toBe(200)
      expect(output).toContain('fixed-value')
      expect(output).not.toContain('TypeError')
      expect(output).not.toContain('A Node.js API is used (process.env')
      expect(output).not.toContain('A Node.js API is used (process.cwd')
    })
  })
})
