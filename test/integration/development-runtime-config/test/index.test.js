/* eslint-env jest */

import fs from 'fs-extra'
import { join } from 'path'
import cheerio from 'cheerio'
import {
  findPort,
  renderViaHTTP,
  launchApp,
  waitFor,
  killApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '../')
const nextConfig = join(appDir, 'next.config.js')

const runApp = async (config, turbo) => {
  const port = await findPort()

  let stderr = ''
  const app = await launchApp(appDir, port, {
    turbo: !!turbo,
    onStderr(err) {
      stderr += err
    },
  })

  const html = await renderViaHTTP(port, '/post/1')
  const $ = cheerio.load(html)
  await waitFor(1000)

  await killApp(app)
  await fs.remove(nextConfig)

  expect(stderr).not.toMatch(
    /Cannot read property 'serverRuntimeConfig' of undefined/i
  )
  expect(JSON.parse($('#server-runtime-config').text())).toEqual(
    config.serverRuntimeConfig || {}
  )
  expect(JSON.parse($('#public-runtime-config').text())).toEqual(
    config.publicRuntimeConfig || {}
  )
}

describe('should work with runtime-config in next.config.js', () => {
  test('empty runtime-config', async () => {
    await fs.writeFile(
      nextConfig,
      `
      module.exports = {
      }
    `
    )

    await runApp({})
  })

  test.each([
    ['dev', false],
    ['turbo', true],
  ])('with runtime-config %s', async (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    const config = {
      serverRuntimeConfig: {
        mySecret: '**********',
      },
      publicRuntimeConfig: {
        staticFolder: '/static',
      },
    }

    await fs.writeFile(
      nextConfig,
      `
      module.exports = ${JSON.stringify(config)}
    `
    )

    await runApp(config, turbo)
  })
})
