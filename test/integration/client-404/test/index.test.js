/* eslint-env jest */

import { join } from 'path'
import {
  renderViaHTTP,
  findPort,
  launchApp,
  killApp,
  nextBuild,
  nextStart,
  getBuildManifest,
  shouldRunTurboDevTest,
} from 'next-test-utils'
import fs from 'fs-extra'

// test suite
import clientNavigation from './client-navigation'

const shouldRunTurboDev = shouldRunTurboDevTest()
const context = {}
const appDir = join(__dirname, '../')

const runTests = (isProd = false) => {
  clientNavigation(context, isProd)
}

describe('Client 404', () => {
  describe.each([
    ['dev', false],
    ['turbo', true],
  ])('%s mode', (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    beforeAll(async () => {
      context.appPort = await findPort()
      context.server = await launchApp(appDir, context.appPort, {
        turbo: !!turbo,
      })

      // pre-build page at the start
      await renderViaHTTP(context.appPort, '/')
    })
    afterAll(() => killApp(context.server))

    runTests()
  })

  describe('production mode', () => {
    beforeAll(async () => {
      await nextBuild(appDir)
      context.appPort = await findPort()
      context.server = await nextStart(appDir, context.appPort)

      const manifest = await getBuildManifest(appDir)
      const files = manifest.pages['/missing'].filter((d) =>
        /static[\\/]chunks[\\/]pages/.test(d)
      )
      if (files.length < 1) {
        throw new Error('oops!')
      }
      await Promise.all(files.map((f) => fs.remove(join(appDir, '.next', f))))
    })
    afterAll(() => killApp(context.server))

    runTests(true)
  })
})
