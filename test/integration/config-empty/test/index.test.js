/* eslint-env jest */

import { join } from 'path'
import {
  nextBuild,
  launchApp,
  findPort,
  killApp,
  waitFor,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '..')

describe('Empty configuration', () => {
  it('should show relevant warning and compile successfully for next build', async () => {
    const { stderr, stdout } = await nextBuild(appDir, [], {
      stderr: true,
      stdout: true,
    })
    expect(stdout).toMatch(/Compiled successfully/)
    expect(stderr).toMatch(
      /Detected next\.config\.js, no exported configuration found\. https:\/\//
    )
  })

  it.each([
    ['dev', false],
    ['turbo', true],
  ])(
    'should show relevant warning and compile successfully for next %s',
    async (_name, turbo) => {
      if (!!turbo && !shouldRunTurboDev) {
        return
      }

      let stderr = ''

      const appPort = await findPort()
      const app = await launchApp(appDir, appPort, {
        turbo: !!turbo,
        onStderr(msg) {
          stderr += msg || ''
        },
      })
      await waitFor(1000)
      await killApp(app)

      expect(stderr).toMatch(
        /Detected next\.config\.js, no exported configuration found\. https:\/\//
      )
    }
  )
})
