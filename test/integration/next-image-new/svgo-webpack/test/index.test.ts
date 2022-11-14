/* eslint-env jest */

import { join } from 'path'
import {
  renderViaHTTP,
  findPort,
  launchApp,
  nextBuild,
  killApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '..')
let appPort
let app
let devOutput

describe('svgo-webpack with Image Component', () => {
  describe('next build', () => {
    it('should not fail to build invalid usage of the Image component', async () => {
      const { stderr, code } = await nextBuild(appDir, [], { stderr: true })
      const errors = stderr
        .split('\n')
        .filter((line) => line && !line.startsWith('warn  -'))
      expect(errors).toEqual([])
      expect(code).toBe(0)
    })
  })

  describe.each([
    ['dev', false],
    ['turbo', true],
  ])('next %s', (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    beforeAll(async () => {
      devOutput = { stdout: '', stderr: '' }
      appPort = await findPort()
      app = await launchApp(appDir, appPort, {
        turbo: !!turbo,
        onStdout: (msg) => {
          devOutput.stdout += msg
        },
        onStderr: (msg) => {
          devOutput.stderr += msg
        },
      })
    })
    afterAll(() => killApp(app))

    it('should print error when invalid Image usage', async () => {
      await renderViaHTTP(appPort, '/', {})
      const errors = devOutput.stderr
        .split('\n')
        .filter((line) => line && !line.startsWith('warn  -'))
      expect(errors).toEqual([])
    })
  })
})
