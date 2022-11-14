import { createNext } from 'e2e-utils'
import { check, shouldRunTurboDevTest } from 'next-test-utils'
import { NextInstance } from 'test/lib/next-modes/base'

const shouldRunTurboDev = shouldRunTurboDevTest()

describe.each([
  ['dev', false],
  ['turbo', true],
])('watch-config-file %s', (_name, turbo) => {
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
            return <p>hello world</p>
          }
        `,
        'next.config.js': `
        const nextConfig = {
          reactStrictMode: true,
        }

        module.exports = nextConfig
        `,
      },
      dependencies: {},
      skipStart: true,
    })
  })
  afterAll(() => next.destroy())

  it('should output config file change', async () => {
    // next dev test-dir
    await next.start(true)
    let i = 1

    await check(async () => {
      await next.patchFile(
        'next.config.js',
        `
          /** changed - ${i} **/
          const nextConfig = {
            reactStrictMode: true,
          }
          module.exports = nextConfig`
      )
      return next.cliOutput
    }, /Found a change in next.config.js. Restart the server to see the changes in effect./)
  })
})
