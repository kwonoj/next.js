/* eslint-env jest */
import {
  killApp,
  findPort,
  nextStart,
  nextBuild,
  launchApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'
import webdriver from 'next-webdriver'
import { join } from 'path'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '../')
let appPort
let app
let browser

function runTests() {
  // #31065
  it('should apply image config for node_modules', async () => {
    browser = await webdriver(appPort, '/image-from-node-modules')
    expect(
      await browser.elementById('image-from-node-modules').getAttribute('src')
    ).toMatch('i.imgur.com')
  })
}

describe('Image Component Tests In Prod Mode', () => {
  beforeAll(async () => {
    await nextBuild(appDir)
    appPort = await findPort()
    app = await nextStart(appDir, appPort)
  })
  afterAll(async () => {
    await killApp(app)
  })

  runTests()
})

describe.each([
  ['dev', false],
  ['turbo', true],
])('Image Component Tests In %s Mode', (_name, turbo) => {
  if (!!turbo && !shouldRunTurboDev) {
    return
  }

  beforeAll(async () => {
    appPort = await findPort()
    app = await launchApp(appDir, appPort, { turbo })
  })
  afterAll(async () => {
    await killApp(app)
  })

  runTests()
})
