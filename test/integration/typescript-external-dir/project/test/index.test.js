/* eslint-env jest */

import { join } from 'path'
import cheerio from 'cheerio'
import {
  renderViaHTTP,
  findPort,
  launchApp,
  killApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '..')
let appPort
let app

async function get$(path, query) {
  const html = await renderViaHTTP(appPort, path, query)
  return cheerio.load(html)
}

describe('TypeScript Features', () => {
  describe.each([
    ['dev', false],
    ['turbo', true],
  ])('default behavior %s', (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    beforeAll(async () => {
      appPort = await findPort()
      app = await launchApp(appDir, appPort, { turbo: !!turbo })
    })
    afterAll(() => killApp(app))

    it('should render the page with external TS/TSX dependencies', async () => {
      const $ = await get$('/')
      expect($('body').text()).toMatch(/Hello World!Counter: 0/)
    })
  })
})
