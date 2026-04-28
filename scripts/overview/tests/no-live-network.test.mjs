import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const testDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(testDir, '..', '..', '..')

test('script tests use fixtures and do not contain live CBU fetches', () => {
  const testSource = readFileSync(join(repoRoot, 'scripts', 'overview', 'tests', 'cbu-fx.test.mjs'), 'utf8')

  assert.equal(testSource.includes('fetch('), false)
  assert.ok(testSource.includes('fixtureFetchJson'))
})

