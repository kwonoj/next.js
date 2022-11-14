/* eslint-env jest */

import { join } from 'path'
import {
  findPort,
  launchApp,
  killApp,
  shouldRunTurboDevTest,
} from 'next-test-utils'
import { promises as fs } from 'fs'

const shouldRunTurboDev = shouldRunTurboDevTest()
const appDir = join(__dirname, '..')
const appTypeDeclarations = join(appDir, 'next-env.d.ts')

describe('TypeScript App Type Declarations', () => {
  it.each([
    ['dev', false],
    ['turbo', true],
  ])(
    'should write a new next-env.d.ts if none exist %s',
    async (_name, turbo) => {
      if (!!turbo && !shouldRunTurboDev) {
        return
      }

      const prevContent = await fs.readFile(appTypeDeclarations, 'utf8')
      try {
        await fs.unlink(appTypeDeclarations)
        const appPort = await findPort()
        let app
        try {
          app = await launchApp(appDir, appPort, { turbo: !!turbo })
          const content = await fs.readFile(appTypeDeclarations, 'utf8')
          expect(content).toEqual(prevContent)
        } finally {
          await killApp(app)
        }
      } finally {
        await fs.writeFile(appTypeDeclarations, prevContent)
      }
    }
  )

  it.each([
    ['dev', false],
    ['turbo', true],
  ])(
    'should overwrite next-env.d.ts if an incorrect one exists',
    async (_name, turbo) => {
      if (!!turbo && !shouldRunTurboDev) {
        return
      }

      const prevContent = await fs.readFile(appTypeDeclarations, 'utf8')
      try {
        await fs.writeFile(appTypeDeclarations, prevContent + 'modification')
        const appPort = await findPort()
        let app
        try {
          app = await launchApp(appDir, appPort, { turbo: !!turbo })
          const content = await fs.readFile(appTypeDeclarations, 'utf8')
          expect(content).toEqual(prevContent)
        } finally {
          await killApp(app)
        }
      } finally {
        await fs.writeFile(appTypeDeclarations, prevContent)
      }
    }
  )

  it.each([
    ['dev', false],
    ['turbo', true],
  ])(
    'should not touch an existing correct next-env.d.ts',
    async (_name, turbo) => {
      if (!!turbo && !shouldRunTurboDev) {
        return
      }

      const prevStat = await fs.stat(appTypeDeclarations)
      const appPort = await findPort()
      let app
      try {
        app = await launchApp(appDir, appPort, { turbo: !!turbo })
        const stat = await fs.stat(appTypeDeclarations)
        expect(stat.mtime).toEqual(prevStat.mtime)
      } finally {
        await killApp(app)
      }
    }
  )
})
