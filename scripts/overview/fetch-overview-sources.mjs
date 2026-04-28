import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildCbuFxMetricUpdates } from './sources/cbu-fx.mjs'
import { applyMetricUpdatesToSnapshot, formatDiffReport } from './sources/update-snapshot.mjs'

const repoRoot = resolve(fileURLToPath(import.meta.url), '..', '..', '..')
const defaultSnapshotPath = join(repoRoot, 'scripts', 'overview', 'overview_source_snapshot.json')

function fail(message) {
  throw new Error(message)
}

function parseArgs(argv) {
  const options = {
    family: 'cbu-fx',
    snapshot: defaultSnapshotPath,
    dryRun: false,
    writeSnapshot: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--dry-run') options.dryRun = true
    else if (arg === '--write-snapshot') options.writeSnapshot = true
    else if (arg === '--family') {
      options.family = argv[index + 1]
      index += 1
    } else if (arg === '--snapshot') {
      options.snapshot = argv[index + 1]
      index += 1
    } else if (arg === '--latest-date') {
      options.latestDate = argv[index + 1]
      index += 1
    } else if (arg === '--prior-month-date') {
      options.priorMonthDate = argv[index + 1]
      index += 1
    } else if (arg === '--prior-year-date') {
      options.priorYearDate = argv[index + 1]
      index += 1
    } else if (arg === '--fixture-dir') {
      options.fixtureDir = argv[index + 1]
      index += 1
    } else if (arg === '--diff-report') {
      options.diffReport = argv[index + 1]
      index += 1
    } else {
      fail(`Unknown argument: ${arg}`)
    }
  }

  if (options.family !== 'cbu-fx') fail(`Unsupported Overview source family for Phase 1: ${options.family}`)
  if (options.dryRun && options.writeSnapshot) fail('Use either --dry-run or --write-snapshot, not both.')
  if (!options.dryRun && !options.writeSnapshot) options.dryRun = true
  return options
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function fixtureFetchJson(fixtureDir) {
  return async (_url, requestedDate) => readJson(join(fixtureDir, `${requestedDate}.json`))
}

function buildDiffReport(args, snapshotPath, result) {
  return {
    generated_at: new Date().toISOString(),
    family: args.family,
    snapshot: snapshotPath,
    changed: result.changed,
    status: result.snapshot.status,
    value_hash: result.value_hash,
    diff: result.diff,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const snapshotPath = resolve(args.snapshot)
  const snapshot = readJson(snapshotPath)
  const updates = await buildCbuFxMetricUpdates({
    latestDate: args.latestDate,
    priorMonthDate: args.priorMonthDate,
    priorYearDate: args.priorYearDate,
    fetchJson: args.fixtureDir ? fixtureFetchJson(resolve(args.fixtureDir)) : undefined,
  })
  const result = applyMetricUpdatesToSnapshot(snapshot, updates)

  console.log(formatDiffReport(result.diff))
  console.log(`status: ${result.snapshot.status}`)
  console.log(`value_hash: ${result.value_hash}`)

  if (args.writeSnapshot) {
    const diffReportPath = resolve(args.diffReport ?? join(dirname(snapshotPath), 'overview_source_snapshot.diff_report.json'))
    writeFileSync(snapshotPath, `${JSON.stringify(result.snapshot, null, 2)}\n`, 'utf8')
    writeFileSync(diffReportPath, `${JSON.stringify(buildDiffReport(args, snapshotPath, result), null, 2)}\n`, 'utf8')
    console.log(`Wrote source snapshot: ${snapshotPath}`)
    console.log(`Wrote diff report: ${diffReportPath}`)
  } else {
    console.log('Dry run only; source snapshot and public overview.json were not written.')
  }
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
