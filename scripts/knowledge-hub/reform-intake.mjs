import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const KNOWLEDGE_HUB_SCHEMA_VERSION = 'knowledge-hub-reform-candidates.v1'
export const FIXTURE_DEMO_EXTRACTION_MODE = 'fixture-demo'
export const CONFIGURED_SOURCE_FETCH_EXTRACTION_MODE = 'configured-source-fetch'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..', '..')
const defaultPublicArtifactPath = resolve(repoRoot, 'apps', 'policy-ui', 'public', 'data', 'knowledge-hub.json')

export const REFORM_SOURCE_DEFINITIONS = [
  {
    id: 'cbu-policy-news',
    institution: 'Central Bank of Uzbekistan',
    url: 'https://cbu.uz/en/press_center/news/',
    fixture_path: resolve(scriptDir, 'source-fixtures', 'cbu-policy-news.html'),
  },
  {
    id: 'mef-policy-news',
    institution: 'Ministry of Economy and Finance of Uzbekistan',
    url: 'https://imv.uz/en/news',
    fixture_path: resolve(scriptDir, 'source-fixtures', 'mef-policy-news.html'),
  },
]

const REFORM_KEYWORDS = [
  'budget',
  'customs',
  'deposit',
  'energy',
  'excise',
  'finance',
  'fiscal',
  'foreign exchange',
  'fx',
  'policy rate',
  'privatization',
  'reserve requirement',
  'subsidy',
  'tariff',
  'tax',
]

function parseArgs(argv) {
  const args = {
    fetchSource: false,
    writePublicArtifact: false,
    output: defaultPublicArtifactPath,
    extractedAt: new Date().toISOString(),
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--fetch-source') args.fetchSource = true
    else if (arg === '--write-public-artifact') args.writePublicArtifact = true
    else if (arg === '--output') {
      args.output = resolve(argv[index + 1])
      index += 1
    } else if (arg === '--extracted-at') {
      args.extractedAt = argv[index + 1]
      index += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return args
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function normalizeWhitespace(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function firstMatch(value, patterns) {
  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return ''
}

function toAbsoluteUrl(url, baseUrl) {
  if (!url) return baseUrl
  try {
    return new URL(url, baseUrl).toString()
  } catch {
    return baseUrl
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function classifyDomain(text) {
  const normalized = text.toLowerCase()
  if (/(energy|gas|privatization|state-owned|infrastructure)/.test(normalized)) return 'Structural'
  if (/(customs|tariff|trade|wto|import|export)/.test(normalized)) return 'Trade'
  if (/(policy rate|reserve requirement|foreign exchange|fx|deposit|bank)/.test(normalized)) return 'Monetary'
  if (/(budget|tax|excise|fiscal|subsidy)/.test(normalized)) return 'Fiscal'
  return 'Policy'
}

function isLikelyReformCandidate(text) {
  const normalized = text.toLowerCase()
  return REFORM_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

function extractArticleBlocks(html) {
  const articleBlocks = Array.from(html.matchAll(/<article\b[\s\S]*?<\/article>/gi), (match) => match[0])
  if (articleBlocks.length > 0) return articleBlocks
  return Array.from(html.matchAll(/<li\b[\s\S]*?<\/li>/gi), (match) => match[0])
}

export function extractCandidatesFromSource(source, html, extractedAt) {
  return extractArticleBlocks(html)
    .map((block) => {
      const href = firstMatch(block, [/<a\b[^>]*href=["']([^"']+)["']/i])
      const title = normalizeWhitespace(
        firstMatch(block, [
          /<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/i,
          /<a\b[^>]*>([\s\S]*?)<\/a>/i,
        ]),
      )
      const summary = normalizeWhitespace(
        firstMatch(block, [
          /<p\b[^>]*class=["'][^"']*(?:summary|description|excerpt)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i,
          /<p\b[^>]*>([\s\S]*?)<\/p>/i,
        ]),
      )
      const publishedAt = firstMatch(block, [
        /<time\b[^>]*datetime=["']([^"']+)["']/i,
        /data-date=["']([^"']+)["']/i,
      ])
      const text = `${title} ${summary}`
      return {
        title,
        summary,
        publishedAt,
        sourceUrl: toAbsoluteUrl(href, source.url),
        text,
      }
    })
    .filter((item) => item.title && isLikelyReformCandidate(item.text))
    .map((item) => ({
      id: `${source.id}-${slugify(`${item.publishedAt}-${item.title}`)}`,
      extraction_state: 'source-extracted',
      review_state: 'unreviewed',
      review_status: 'needs_review',
      title: item.title,
      summary: item.summary || 'Source page did not expose a summary in the configured extraction block.',
      domain_tag: classifyDomain(item.text),
      source_institution: source.institution,
      source_url: item.sourceUrl,
      source_published_at: item.publishedAt || undefined,
      extracted_at: extractedAt,
      caveats: [
        'Deterministic extraction from configured source text.',
        'Unreviewed candidate; not an official reviewed policy database entry.',
      ],
    }))
}

async function readSource(source, fetchSource) {
  if (!fetchSource) return readFileSync(source.fixture_path, 'utf8')

  const response = await fetch(source.url, {
    headers: {
      Accept: 'text/html',
      'User-Agent': 'Uzbekistan-Economic-Policy-Engine/knowledge-hub-intake (+manual-review)',
    },
  })
  if (!response.ok) throw new Error(`Failed to fetch ${source.url}: HTTP ${response.status}`)
  return response.text()
}

export async function buildKnowledgeHubCandidateArtifact(options = {}) {
  const extractedAt = options.extractedAt ?? new Date().toISOString()
  const sources = options.sources ?? REFORM_SOURCE_DEFINITIONS
  const fetchSource = options.fetchSource === true
  const extractionMode = fetchSource
    ? CONFIGURED_SOURCE_FETCH_EXTRACTION_MODE
    : FIXTURE_DEMO_EXTRACTION_MODE
  const candidatesBySource = await Promise.all(
    sources.map(async (source) => extractCandidatesFromSource(source, await readSource(source, fetchSource), extractedAt)),
  )
  const candidates = candidatesBySource.flat().sort((left, right) => {
    const leftDate = left.source_published_at ?? ''
    const rightDate = right.source_published_at ?? ''
    return rightDate.localeCompare(leftDate) || left.title.localeCompare(right.title)
  })

  return {
    schema_version: KNOWLEDGE_HUB_SCHEMA_VERSION,
    generated_at: extractedAt,
    generated_by: options.generatedBy ?? 'scripts/knowledge-hub/reform-intake.mjs',
    extraction_mode: extractionMode,
    extraction_mode_label: fetchSource ? 'Configured source fetch' : 'Fixture/demo intake',
    sources: sources.map((source) => ({
      id: source.id,
      institution: source.institution,
      url: source.url,
    })),
    candidates,
    caveats: [
      'This is a deterministic reform-candidate intake artifact.',
      fetchSource
        ? 'Generated from configured source URLs at artifact build time.'
        : 'Fixture/demo mode: generated from checked-in HTML fixtures for deterministic review and smoke testing.',
      'Items are source-extracted and unreviewed; this is not an official reviewed policy database.',
      'The frontend loads this static JSON artifact only and does not scrape source pages in the browser.',
    ],
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const artifact = await buildKnowledgeHubCandidateArtifact({
    fetchSource: args.fetchSource,
    extractedAt: args.extractedAt,
  })

  if (args.writePublicArtifact) {
    writeFileSync(args.output, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8')
    console.log(`Wrote Knowledge Hub candidate artifact: ${args.output}`)
  } else {
    console.log(JSON.stringify(artifact, null, 2))
  }
}

if (process.argv[1] && existsSync(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
