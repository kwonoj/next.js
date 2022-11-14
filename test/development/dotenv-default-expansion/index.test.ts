import { createNext } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import webdriver from 'next-webdriver'
import { shouldRunTurboDevTest } from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()

describe.each([
  ['dev', false],
  ['turbo', true],
])('Dotenv default expansion %s', (_name, turbo) => {
  if (!!turbo && !shouldRunTurboDev) {
    return
  }

  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      turbo: !!turbo,
      files: {
        'pages/index.js': `
          export default function Page() {
            return <p>{process.env.NEXT_PUBLIC_TEST}</p>
          }
        `,
        '.env': `
          NEXT_PUBLIC_TEST=\${MISSING_KEY:-default}
        `,
      },
      dependencies: {},
    })
  })
  afterAll(() => next.destroy())

  it('should work', async () => {
    const browser = await webdriver(next.appPort, '/')
    const text = await browser.elementByCss('p').text()
    expect(text).toBe('default')

    await browser.close()
  })
})
