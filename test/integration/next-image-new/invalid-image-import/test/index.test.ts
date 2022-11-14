/* eslint-env jest */

import { join } from 'path'
import {
  findPort,
  getRedboxHeader,
  getRedboxSource,
  hasRedbox,
  killApp,
  launchApp,
  nextBuild,
  shouldRunTurboDevTest,
} from 'next-test-utils'
import webdriver from 'next-webdriver'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '../')
let appPort: number
let app
let stderr = ''
const msg =
  'Error: Image import "../public/invalid.svg" is not a valid image file. The image may be corrupted or an unsupported format.'

function runTests({ isDev }) {
  it('should show error', async () => {
    if (isDev) {
      const browser = await webdriver(appPort, '/')
      expect(await hasRedbox(browser)).toBe(true)
      expect(await getRedboxHeader(browser)).toBe('Failed to compile')
      expect(await getRedboxSource(browser)).toBe(`./pages/index.js:3\n${msg}`)
      expect(stderr).toContain(msg)
    } else {
      expect(stderr).toContain(msg)
    }
  })
}

describe('Missing Import Image Tests', () => {
  describe.each([
    ['dev', false],
    ['turbo', true],
  ])('%s mode', (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    beforeAll(async () => {
      stderr = ''
      appPort = await findPort()
      app = await launchApp(appDir, appPort, {
        turbo: !!turbo,
        onStderr(msg) {
          stderr += msg || ''
        },
      })
    })
    afterAll(async () => {
      if (app) {
        await killApp(app)
      }
    })

    runTests({ isDev: true })
  })

  describe('server mode', () => {
    beforeAll(async () => {
      stderr = ''
      const result = await nextBuild(appDir, [], { stderr: true })
      stderr = result.stderr
    })
    afterAll(async () => {
      if (app) {
        await killApp(app)
      }
    })

    runTests({ isDev: false })
  })
})
