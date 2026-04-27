import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, it } from 'node:test'
import { validateOverviewArtifact } from '../../../src/data/overview/artifact-guard.js'
import {
  OVERVIEW_LOCKED_METRICS,
  OVERVIEW_TOP_CARD_METRIC_IDS,
  type OverviewArtifact,
} from '../../../src/data/overview/artifact-types.js'

const repoRoot = resolve(process.cwd(), '..', '..')
const exporterPath = join(repoRoot, 'scripts', 'overview', 'export-overview.mjs')
const sourceSnapshotPath = join(repoRoot, 'scripts', 'overview', 'overview_source_snapshot.json')
const fixedExportedAt = '2026-04-27T09:30:00Z'
const toConfirmMetricIds = ['reer_level', 'gold_price_level', 'gold_price_change', 'gold_price_forecast']

function tempPath(name: string): string {
  return join(mkdtempSync(join(tmpdir(), 'overview-export-')), name)
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function buildVerifiedFixturePath(): string {
  const source = readJson(sourceSnapshotPath) as Record<string, unknown>
  const fixture: Record<string, unknown> = {
    ...source,
    status: 'owner_verified_for_public_artifact',
    snapshot_accepted_by: 'test-owner',
    snapshot_accepted_at: '2026-04-27T00:00:00Z',
  }
  delete fixture.draft_note
  const fixturePath = tempPath('verified-overview-source.json')
  writeFileSync(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8')
  return fixturePath
}

function runExporter(options: {
  sourcePath?: string
  outputPath?: string
  exportedAt?: string
}) {
  const outputPath = options.outputPath ?? tempPath('overview.json')
  const result = spawnSync(
    process.execPath,
    [exporterPath, '--exported-at', options.exportedAt ?? fixedExportedAt],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        OVERVIEW_SOURCE_SNAPSHOT_PATH: options.sourcePath ?? buildVerifiedFixturePath(),
        OVERVIEW_OUTPUT_PATH: outputPath,
      },
      encoding: 'utf8',
    },
  )
  return { ...result, outputPath }
}

describe('overview exporter', () => {
  it('does not require a production overview.json fixture to exist', () => {
    assert.equal(existsSync(join(repoRoot, 'apps', 'policy-ui', 'public', 'data', 'overview.json')), false)
  })

  it('refuses to export the committed draft source snapshot', () => {
    const result = runExporter({ sourcePath: sourceSnapshotPath })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /draft_not_for_public_artifact/)
  })

  it('writes a deterministic artifact that passes the Overview UI guard', () => {
    const first = runExporter({})
    const second = runExporter({})

    assert.equal(first.status, 0, first.stderr)
    assert.equal(second.status, 0, second.stderr)
    assert.equal(readFileSync(first.outputPath, 'utf8'), readFileSync(second.outputPath, 'utf8'))

    const artifact = readJson(first.outputPath) as OverviewArtifact
    const validation = validateOverviewArtifact(artifact)
    assert.equal(validation.ok, true)
    assert.equal(artifact.exported_at, fixedExportedAt)
    assert.equal(artifact.generated_by, 'scripts/overview/export-overview.mjs')
    assert.equal(artifact.validation_status, 'warning')
    assert.deepEqual(
      artifact.metrics.map((metric) => metric.id),
      OVERVIEW_LOCKED_METRICS.map((metric) => metric.id),
    )
  })

  it('keeps the top-card subset and order aligned with the Overview lock', () => {
    const result = runExporter({})
    assert.equal(result.status, 0, result.stderr)

    const artifact = readJson(result.outputPath) as OverviewArtifact
    assert.deepEqual(
      artifact.metrics.filter((metric) => metric.top_card).map((metric) => metric.id),
      [...OVERVIEW_TOP_CARD_METRIC_IDS],
    )
    assert.deepEqual(
      artifact.metrics
        .filter((metric) => metric.top_card)
        .map((metric) => metric.top_card_order),
      [1, 2, 3, 4, 5, 6, 7, 8],
    )
  })

  it('carries TO CONFIRM source metrics as warnings in the public artifact', () => {
    const result = runExporter({})
    assert.equal(result.status, 0, result.stderr)

    const artifact = readJson(result.outputPath) as OverviewArtifact
    for (const metricId of toConfirmMetricIds) {
      const metric = artifact.metrics.find((entry) => entry.id === metricId)
      assert.equal(metric?.validation_status, 'warning')
      assert.match(metric?.source_label ?? '', /\(TO CONFIRM\)$/)
      assert.deepEqual(metric?.warnings, ['Source not yet confirmed.'])
    }
  })

  it('fails export when a locked metric is missing', () => {
    const source = readJson(buildVerifiedFixturePath()) as {
      metrics: Array<{ metric_id: string }>
    }
    source.metrics = source.metrics.filter((metric) => metric.metric_id !== 'gold_price_forecast')
    const badSourcePath = tempPath('missing-metric.json')
    writeFileSync(badSourcePath, `${JSON.stringify(source, null, 2)}\n`, 'utf8')

    const result = runExporter({ sourcePath: badSourcePath })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /Missing locked metric id gold_price_forecast/)
  })

  it('fails export when source snapshot metadata conflicts with the locked metric contract', () => {
    const source = readJson(buildVerifiedFixturePath()) as {
      metrics: Array<{ metric_id: string; claim_type: string }>
    }
    const cpi = source.metrics.find((metric) => metric.metric_id === 'cpi_yoy')
    assert.ok(cpi)
    cpi.claim_type = 'reference'
    const badSourcePath = tempPath('invalid-source.json')
    writeFileSync(badSourcePath, `${JSON.stringify(source, null, 2)}\n`, 'utf8')

    const result = runExporter({ sourcePath: badSourcePath })

    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /claim_type must be observed/)
  })
})
