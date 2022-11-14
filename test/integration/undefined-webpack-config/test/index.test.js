/* eslint-env jest */

import { join } from 'path'
import { launchApp, nextBuild, shouldRunTurboDevTest } from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '../')
const expectedErr =
  /Webpack config is undefined. You may have forgot to return properly from within the "webpack" method of your next.config.js/

describe('undefined webpack config error', () => {
  it('should show in production mode', async () => {
    const result = await nextBuild(appDir, [], {
      stdout: true,
      stderr: true,
    })
    expect(result.stderr || '' + result.stdout || '').toMatch(expectedErr)
  })

  it.each([
    ['dev', false],
    ['turbo', true],
  ])('should show in %s mode', async (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    let output = ''

    await launchApp(appDir, [], {
      turbo: !!turbo,
      onStderr(msg) {
        output += msg || ''
      },
      ontStdout(msg) {
        output += msg || ''
      },
    })

    expect(output).toMatch(expectedErr)
  })
})
