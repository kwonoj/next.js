import { createNext } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { renderViaHTTP, shouldRunTurboDevTest } from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()

describe.each([
  ['dev', false],
  ['turbo', true],
])('webpack-issuer-deprecation-warning %s', (_name, turbo) => {
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
            return <p>hello world
          }
        `,
      },
      dependencies: {},
    })
  })
  afterAll(() => next.destroy())

  it('should not appear deprecation warning about webpack module issuer', async () => {
    const html = await renderViaHTTP(next.url, '/')
    expect(html).toContain('Syntax Error')
    expect(next.cliOutput).not.toContain(
      '[DEP_WEBPACK_MODULE_ISSUER] DeprecationWarning: Module.issuer: Use new ModuleGraph API'
    )
  })
})
