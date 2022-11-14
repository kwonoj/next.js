import { createNext } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { waitFor, shouldRunTurboDevTest } from 'next-test-utils'
import webdriver from 'next-webdriver'

const shouldRunTurboDev = shouldRunTurboDevTest()

describe.each([
  ['dev', false],
  ['turbo', true],
])('getServerSideProps returns notFound: true', (_name, turbo) => {
  if (!!turbo && !shouldRunTurboDev) {
    return
  }

  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      turbo: !!turbo,
      files: {
        'pages/index.js': `
        const Home = () => null
        export default Home

        export function getServerSideProps() {
          console.log("gssp called")
          return { notFound: true }
        }
        `,
      },
      dependencies: {},
    })
  })
  afterAll(() => next.destroy())

  it('should not poll indefinitely', async () => {
    const browser = await webdriver(next.appPort, '/')
    await waitFor(3000)
    await browser.close()
    const logOccurrences = next.cliOutput.split('gssp called').length - 1
    expect(logOccurrences).toBe(1)
  })
})
