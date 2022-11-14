import { createNext } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { fetchViaHTTP, shouldRunTurboDevTest } from 'next-test-utils'

const shouldRunTurboDev = shouldRunTurboDevTest()

describe.each([
  ['dev', false],
  ['turbo', true],
])(
  'Rewritten API Requests should pass OPTIONS requests to the api function  %s',
  (_name, turbo) => {
    if (!!turbo && !shouldRunTurboDev) {
      return
    }

    let next: NextInstance

    beforeAll(async () => {
      next = await createNext({
        turbo: !!turbo,
        files: {
          'pages/api/some-endpoint.js': `
          export default (req, res) => {
            res.end("successfully hit some-endpoint!")
          }
        `,
        },
        nextConfig: {
          rewrites: () =>
            Promise.resolve({
              beforeFiles: [
                // Nextjs by default requires a /api prefix, let's remove that
                {
                  source: '/:path*',
                  destination: '/api/:path*',
                },
              ],
              afterFiles: [],
              fallback: [],
            }),
        },
        dependencies: {},
      })
    })
    afterAll(() => next.destroy())

    it('should pass OPTIONS requests to the api function', async () => {
      const res = await fetchViaHTTP(next.url, '/some-endpoint', null, {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
        },
      })
      expect(await res.text()).toContain('successfully hit some-endpoint!')
    })
  }
)
