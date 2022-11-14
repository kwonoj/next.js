/* eslint-env jest */

import {
  check,
  findPort,
  getRedboxSource,
  hasRedbox,
  killApp,
  launchApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'
import webdriver from 'next-webdriver'
import { join } from 'path'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '../')

describe('devtool set in development mode in next config', () => {
  it.each([
    ['dev', false],
    ['turbo', true],
  ])(
    'should warn and revert when a devtool is set in %s mode',
    async (_name, turbo) => {
      if (!!turbo && !shouldRunTurboDev) {
        return
      }

      let stderr = ''

      const appPort = await findPort()
      const app = await launchApp(appDir, appPort, {
        turbo: !!turbo,
        env: { __NEXT_TEST_WITH_DEVTOOL: true },
        onStderr(msg) {
          stderr += msg || ''
        },
      })

      const found = await check(
        () => stderr,
        /Reverting webpack devtool to /,
        false
      )

      const browser = await webdriver(appPort, '/')
      expect(await hasRedbox(browser)).toBe(true)
      if (process.platform === 'win32') {
        // TODO: add win32 snapshot
      } else {
        expect(await getRedboxSource(browser)).toMatchInlineSnapshot(`
"pages/index.js (5:10) @ eval

  3 | export default function Index(props) {
  4 | useEffect(() => {
> 5 |   throw new Error('this should render')
    |        ^
  6 | }, [])
  7 | return <div>Index Page</div>
  8 | }"
`)
      }
      await browser.close()

      await killApp(app)
      expect(found).toBeTruthy()
    }
  )
})
