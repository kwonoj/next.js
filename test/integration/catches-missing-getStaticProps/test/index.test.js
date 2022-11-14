/* eslint-env jest */

import { join } from 'path'
import {
  renderViaHTTP,
  nextBuild,
  launchApp,
  findPort,
  killApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '../')
const errorRegex = /getStaticPaths was added without a getStaticProps in/

describe('Catches Missing getStaticProps', () => {
  it.each([
    ['dev', false],
    ['turbo', true],
  ])('should catch it in %s mode', async (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    const appPort = await findPort()
    const app = await launchApp(appDir, appPort, { turbo })
    const html = await renderViaHTTP(appPort, '/hello')
    await killApp(app)

    expect(html).toMatch(errorRegex)
  })

  it('should catch it in server build mode', async () => {
    const { stderr } = await nextBuild(appDir, [], {
      stderr: true,
    })
    expect(stderr).toMatch(errorRegex)
  })
})
