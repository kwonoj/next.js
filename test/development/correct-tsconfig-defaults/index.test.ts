import { createNext } from 'e2e-utils'
import { check, shouldRunTurboDevTest } from 'next-test-utils'
import { NextInstance } from 'test/lib/next-modes/base'

const shouldRunTurboDev = shouldRunTurboDevTest()

describe.each([
  ['dev', false],
  ['turbo', true],
])('correct tsconfig.json defaults %s', (_name, turbo) => {
  if (!!turbo && !shouldRunTurboDev) {
    return
  }

  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      turbo: !!turbo,
      files: {
        'pages/index.tsx': 'export default function Page() {}',
      },
      skipStart: true,
      dependencies: {
        typescript: 'latest',
        '@types/react': 'latest',
        '@types/node': 'latest',
      },
    })
  })
  afterAll(() => next.destroy())

  it('should add `moduleResolution` when generating tsconfig.json in dev', async () => {
    try {
      expect(
        await next.readFile('tsconfig.json').catch(() => false)
      ).toBeFalse()

      await next.start()

      // wait for tsconfig to be written
      await check(async () => {
        await next.readFile('tsconfig.json')
        return 'success'
      }, 'success')

      const tsconfig = JSON.parse(await next.readFile('tsconfig.json'))
      expect(next.cliOutput).not.toContain('moduleResolution')

      expect(tsconfig.compilerOptions).toEqual(
        expect.objectContaining({ moduleResolution: 'node' })
      )
    } finally {
      await next.stop()
    }
  })

  it('should not warn for `moduleResolution` when already present and valid', async () => {
    try {
      expect(
        await next.readFile('tsconfig.json').catch(() => false)
      ).toBeTruthy()

      await next.start()

      const tsconfig = JSON.parse(await next.readFile('tsconfig.json'))

      expect(tsconfig.compilerOptions).toEqual(
        expect.objectContaining({ moduleResolution: 'node' })
      )
      expect(next.cliOutput).not.toContain('moduleResolution')
    } finally {
      await next.stop()
    }
  })
})
