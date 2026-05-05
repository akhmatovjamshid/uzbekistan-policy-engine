import type {
  KnowledgeHubContent,
  ReformCandidateItem,
  ReformStatus,
  ReformTrackerItem,
  ResearchBrief,
} from '../../contracts/data-contract.js'
import type { KnowledgeHubArtifact } from '../knowledge-hub/artifact-types.js'

export type RawKnowledgeHubByline = {
  author?: string
  date_label?: string
  read_time_minutes?: number
  ai_drafted?: boolean
  reviewed_by?: string
}

export type RawKnowledgeHubReform = {
  id?: string
  date_label?: string
  date_iso?: string
  status?: string
  title?: string
  mechanism?: string
  domain_tag?: string
  model_refs?: unknown
}

export type RawKnowledgeHubBrief = {
  id?: string
  byline?: RawKnowledgeHubByline
  title?: string
  summary?: string
  domain_tag?: string
  model_refs?: unknown
}

export type RawKnowledgeHubPayload = {
  meta?: {
    reforms_tracked?: number
    research_briefs?: number
    literature_items?: number
    candidate_items?: number
    sources_configured?: number
  }
  reforms?: RawKnowledgeHubReform[]
  briefs?: RawKnowledgeHubBrief[]
  candidates?: ReformCandidateItem[]
  caveats?: string[]
  generated_at?: string
  extraction_mode?: string
  extraction_mode_label?: string
  source_artifact?: string
}

const REFORM_STATUS_VALUES: ReformStatus[] = ['completed', 'in_progress', 'planned']

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter((entry): entry is string => typeof entry === 'string')
}

function asReformStatus(value: unknown, fallback: ReformStatus = 'planned'): ReformStatus {
  return REFORM_STATUS_VALUES.includes(value as ReformStatus) ? (value as ReformStatus) : fallback
}

function adaptReform(raw: RawKnowledgeHubReform, index: number): ReformTrackerItem {
  return {
    id: asString(raw.id, `reform-${index}`),
    date_label: asString(raw.date_label, ''),
    date_iso: typeof raw.date_iso === 'string' ? raw.date_iso : undefined,
    status: asReformStatus(raw.status),
    title: asString(raw.title, 'Untitled reform'),
    mechanism: asString(raw.mechanism, ''),
    domain_tag: asString(raw.domain_tag, 'Other'),
    model_refs: asStringArray(raw.model_refs),
  }
}

function adaptBrief(raw: RawKnowledgeHubBrief, index: number): ResearchBrief {
  const byline = raw.byline ?? {}
  return {
    id: asString(raw.id, `brief-${index}`),
    byline: {
      author: typeof byline.author === 'string' ? byline.author : undefined,
      date_label: asString(byline.date_label, ''),
      read_time_minutes:
        typeof byline.read_time_minutes === 'number' && Number.isFinite(byline.read_time_minutes)
          ? byline.read_time_minutes
          : undefined,
      ai_drafted: byline.ai_drafted === true,
      reviewed_by: typeof byline.reviewed_by === 'string' ? byline.reviewed_by : undefined,
    },
    title: asString(raw.title, 'Untitled brief'),
    summary: asString(raw.summary, ''),
    domain_tag: typeof raw.domain_tag === 'string' ? raw.domain_tag : undefined,
    model_refs: asStringArray(raw.model_refs),
  }
}

export function toKnowledgeHubContent(raw: RawKnowledgeHubPayload): KnowledgeHubContent {
  const reforms = Array.isArray(raw.reforms) ? raw.reforms.map(adaptReform) : []
  const briefs = Array.isArray(raw.briefs) ? raw.briefs.map(adaptBrief) : []
  const candidates = Array.isArray(raw.candidates) ? raw.candidates : []
  const meta = raw.meta ?? {}
  return {
    reforms,
    briefs,
    candidates,
    caveats: asStringArray(raw.caveats),
    generated_at: typeof raw.generated_at === 'string' ? raw.generated_at : undefined,
    extraction_mode: typeof raw.extraction_mode === 'string' ? raw.extraction_mode : undefined,
    extraction_mode_label: typeof raw.extraction_mode_label === 'string' ? raw.extraction_mode_label : undefined,
    source_artifact: typeof raw.source_artifact === 'string' ? raw.source_artifact : undefined,
    meta: {
      reforms_tracked: asNumber(meta.reforms_tracked, reforms.length),
      research_briefs: asNumber(meta.research_briefs, briefs.length),
      literature_items: asNumber(meta.literature_items, 0),
      candidate_items: asNumber(meta.candidate_items, candidates.length),
      sources_configured: asNumber(meta.sources_configured, 0),
    },
  }
}

export function knowledgeHubArtifactToContent(artifact: KnowledgeHubArtifact): KnowledgeHubContent {
  return toKnowledgeHubContent({
    generated_at: artifact.generated_at,
    extraction_mode: artifact.extraction_mode,
    extraction_mode_label: artifact.extraction_mode_label,
    source_artifact: '/data/knowledge-hub.json',
    candidates: artifact.candidates,
    caveats: artifact.caveats,
    meta: {
      candidate_items: artifact.candidates.length,
      sources_configured: artifact.sources.length,
      reforms_tracked: 0,
      research_briefs: 0,
      literature_items: 0,
    },
  })
}
