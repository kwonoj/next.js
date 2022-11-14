/* eslint-env jest */

import path from 'path'

import {
  nextBuild,
  findPort,
  launchApp,
  renderViaHTTP,
  killApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = path.join(__dirname, '..')

describe('Handles Duplicate Pages', () => {
  describe('production', () => {
    it('Throws an error during build', async () => {
      const { stderr } = await nextBuild(appDir, [], { stderr: true })
      expect(stderr).toContain('Duplicate page detected')
    })
  })

  describe.each([
    ['dev', false],
    ['turbo', true],
  ])('%s mode', (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    it('Shows warning in development', async () => {
      let output
      const handleOutput = (msg) => {
        output += msg
      }
      const appPort = await findPort()
      const app = await launchApp(appDir, appPort, {
        turbo: !!turbo,
        onStdout: handleOutput,
        onStderr: handleOutput,
      })
      await renderViaHTTP(appPort, '/hello')
      await killApp(app)
      expect(output).toMatch(/Duplicate page detected/)
    })
  })
})
