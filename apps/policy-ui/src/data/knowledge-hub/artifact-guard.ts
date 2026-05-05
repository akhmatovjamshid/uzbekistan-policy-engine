import type { ReformCandidateItem } from '../../contracts/data-contract.js'
import {
  KNOWLEDGE_HUB_ARTIFACT_SCHEMA_VERSION,
  type KnowledgeHubArtifact,
  type KnowledgeHubArtifactSource,
} from './artifact-types.js'

export type KnowledgeHubArtifactValidationIssue = {
  path: string
  message: string
  severity: 'error' | 'warning'
}

export type KnowledgeHubArtifactValidationResult =
  | { ok: true; value: KnowledgeHubArtifact; issues: KnowledgeHubArtifactValidationIssue[] }
  | { ok: false; value: null; issues: KnowledgeHubArtifactValidationIssue[] }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function stringArray(value: unknown, path: string, issues: KnowledgeHubArtifactValidationIssue[]): string[] {
  if (!Array.isArray(value)) {
    issues.push({ path, message: 'Expected an array of strings.', severity: 'error' })
    return []
  }

  return value.flatMap((entry, index) => {
    if (typeof entry === 'string') return [entry]
    issues.push({ path: `${path}[${index}]`, message: 'Expected a string.', severity: 'error' })
    return []
  })
}

function requireString(
  record: Record<string, unknown>,
  key: string,
  path: string,
  issues: KnowledgeHubArtifactValidationIssue[],
): string {
  const value = stringValue(record[key])
  if (!value) {
    issues.push({ path: `${path}.${key}`, message: 'Expected a non-empty string.', severity: 'error' })
    return ''
  }
  return value
}

function isIsoLike(value: string): boolean {
  return Number.isFinite(Date.parse(value))
}

function validateUrl(value: string, path: string, issues: KnowledgeHubArtifactValidationIssue[]): void {
  try {
    const parsed = new URL(value)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return
  } catch {
    // handled below
  }
  issues.push({ path, message: 'Expected an absolute HTTP(S) URL.', severity: 'error' })
}

function validateSource(
  value: unknown,
  path: string,
  issues: KnowledgeHubArtifactValidationIssue[],
): KnowledgeHubArtifactSource | null {
  if (!isRecord(value)) {
    issues.push({ path, message: 'Source entry must be an object.', severity: 'error' })
    return null
  }

  const source = {
    id: requireString(value, 'id', path, issues),
    institution: requireString(value, 'institution', path, issues),
    url: requireString(value, 'url', path, issues),
  }
  validateUrl(source.url, `${path}.url`, issues)
  return source
}

function validateCandidate(
  value: unknown,
  path: string,
  issues: KnowledgeHubArtifactValidationIssue[],
): ReformCandidateItem | null {
  if (!isRecord(value)) {
    issues.push({ path, message: 'Candidate entry must be an object.', severity: 'error' })
    return null
  }

  const candidate: ReformCandidateItem = {
    id: requireString(value, 'id', path, issues),
    extraction_state: value.extraction_state === 'source-extracted' ? 'source-extracted' : 'source-extracted',
    review_state: value.review_state === 'unreviewed' ? 'unreviewed' : 'unreviewed',
    review_status: value.review_status === 'needs_review' ? 'needs_review' : 'needs_review',
    title: requireString(value, 'title', path, issues),
    summary: requireString(value, 'summary', path, issues),
    domain_tag: requireString(value, 'domain_tag', path, issues),
    source_institution: requireString(value, 'source_institution', path, issues),
    source_url: requireString(value, 'source_url', path, issues),
    source_published_at: stringValue(value.source_published_at) ?? undefined,
    extracted_at: requireString(value, 'extracted_at', path, issues),
    caveats: stringArray(value.caveats, `${path}.caveats`, issues),
  }

  if (value.extraction_state !== 'source-extracted') {
    issues.push({ path: `${path}.extraction_state`, message: 'Expected source-extracted.', severity: 'error' })
  }
  if (value.review_state !== 'unreviewed') {
    issues.push({ path: `${path}.review_state`, message: 'Expected unreviewed.', severity: 'error' })
  }
  if (value.review_status !== 'needs_review') {
    issues.push({ path: `${path}.review_status`, message: 'Expected needs_review.', severity: 'error' })
  }
  validateUrl(candidate.source_url, `${path}.source_url`, issues)
  if (!isIsoLike(candidate.extracted_at)) {
    issues.push({ path: `${path}.extracted_at`, message: 'Expected an ISO-like timestamp.', severity: 'error' })
  }
  if (candidate.source_published_at && !isIsoLike(candidate.source_published_at)) {
    issues.push({ path: `${path}.source_published_at`, message: 'Expected an ISO-like source date.', severity: 'warning' })
  }

  return candidate
}

export function validateKnowledgeHubArtifact(input: unknown): KnowledgeHubArtifactValidationResult {
  const issues: KnowledgeHubArtifactValidationIssue[] = []
  if (!isRecord(input)) {
    return {
      ok: false,
      value: null,
      issues: [{ path: '$', message: 'Knowledge Hub artifact must be an object.', severity: 'error' }],
    }
  }

  if (input.schema_version !== KNOWLEDGE_HUB_ARTIFACT_SCHEMA_VERSION) {
    issues.push({
      path: 'schema_version',
      message: `Expected ${KNOWLEDGE_HUB_ARTIFACT_SCHEMA_VERSION}.`,
      severity: 'error',
    })
  }

  const generatedAt = requireString(input, 'generated_at', '$', issues)
  if (generatedAt && !isIsoLike(generatedAt)) {
    issues.push({ path: 'generated_at', message: 'Expected an ISO-like timestamp.', severity: 'error' })
  }

  if (input.extraction_mode !== 'fixture' && input.extraction_mode !== 'configured-source-fetch') {
    issues.push({
      path: 'extraction_mode',
      message: 'Expected fixture or configured-source-fetch.',
      severity: 'error',
    })
  }

  const sources = Array.isArray(input.sources)
    ? input.sources
        .map((entry, index) => validateSource(entry, `sources[${index}]`, issues))
        .filter((entry): entry is KnowledgeHubArtifactSource => entry !== null)
    : []
  if (!Array.isArray(input.sources)) {
    issues.push({ path: 'sources', message: 'Expected a source array.', severity: 'error' })
  }

  const candidates = Array.isArray(input.candidates)
    ? input.candidates
        .map((entry, index) => validateCandidate(entry, `candidates[${index}]`, issues))
        .filter((entry): entry is ReformCandidateItem => entry !== null)
    : []
  if (!Array.isArray(input.candidates)) {
    issues.push({ path: 'candidates', message: 'Expected a candidate array.', severity: 'error' })
  }

  const ids = new Set<string>()
  for (const candidate of candidates) {
    if (ids.has(candidate.id)) {
      issues.push({ path: 'candidates', message: `Duplicate candidate id ${candidate.id}.`, severity: 'error' })
    }
    ids.add(candidate.id)
  }

  const caveats = stringArray(input.caveats, 'caveats', issues)
  const hasErrors = issues.some((issue) => issue.severity === 'error')
  if (hasErrors) return { ok: false, value: null, issues }

  return {
    ok: true,
    value: {
      schema_version: KNOWLEDGE_HUB_ARTIFACT_SCHEMA_VERSION,
      generated_at: generatedAt,
      generated_by: stringValue(input.generated_by) ?? undefined,
      extraction_mode: input.extraction_mode as KnowledgeHubArtifact['extraction_mode'],
      sources,
      candidates,
      caveats,
    },
    issues,
  }
}
