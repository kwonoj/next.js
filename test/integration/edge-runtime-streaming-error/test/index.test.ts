import stripAnsi from 'next/dist/compiled/strip-ansi'
import {
  fetchViaHTTP,
  findPort,
  killApp,
  launchApp,
  nextBuild,
  nextStart,
  waitFor,
  shouldRunTurboDevTest,
} from 'next-test-utils'
import path from 'path'
import { remove } from 'fs-extra'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = path.join(__dirname, '..')

function test(context: ReturnType<typeof createContext>) {
  return async () => {
    const res = await fetchViaHTTP(context.appPort, '/api/test')
    expect(await res.text()).toEqual('hello')
    expect(res.status).toBe(200)
    await waitFor(200)
    const santizedOutput = stripAnsi(context.output)
    expect(santizedOutput).toMatch(
      new RegExp(`TypeError: This ReadableStream did not return bytes.`, 'm')
    )
    expect(santizedOutput).not.toContain('webpack-internal:')
  }
}

function createContext() {
  const ctx = {
    output: '',
    appPort: -1,
    app: undefined,
    handler: {
      onStdout(msg) {
        this.output += msg
      },
      onStderr(msg) {
        this.output += msg
      },
    },
  }
  ctx.handler.onStderr = ctx.handler.onStderr.bind(ctx)
  ctx.handler.onStdout = ctx.handler.onStdout.bind(ctx)
  return ctx
}

describe.each([
  ['dev', false],
  ['turbo', true],
])('%s mode', (_name, turbo) => {
  if (!!turbo && !shouldRunTurboDev) {
    return
  }

  const context = createContext()

  beforeAll(async () => {
    context.appPort = await findPort()
    context.app = await launchApp(appDir, context.appPort, {
      ...context.handler,
      turbo: !!turbo,
      env: { __NEXT_TEST_WITH_DEVTOOL: 1 },
    })
  })

  afterAll(() => killApp(context.app))

  it('logs the error correctly', test(context))
})

describe('production mode', () => {
  const context = createContext()

  beforeAll(async () => {
    await remove(path.join(appDir, '.next'))
    await nextBuild(appDir, undefined, {
      stderr: true,
      stdout: true,
    })
    context.appPort = await findPort()
    context.app = await nextStart(appDir, context.appPort, {
      ...context.handler,
    })
  })
  afterAll(() => killApp(context.app))
  it('logs the error correctly', test(context))
})
