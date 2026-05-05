import type { ReformCandidateItem } from '../../contracts/data-contract.js'

export const KNOWLEDGE_HUB_ARTIFACT_SCHEMA_VERSION = 'knowledge-hub-reform-candidates.v1'

export type KnowledgeHubArtifactSource = {
  id: string
  institution: string
  url: string
}

export type KnowledgeHubArtifact = {
  schema_version: typeof KNOWLEDGE_HUB_ARTIFACT_SCHEMA_VERSION
  generated_at: string
  generated_by?: string
  extraction_mode: 'fixture-demo' | 'configured-source-fetch'
  extraction_mode_label: string
  sources: KnowledgeHubArtifactSource[]
  candidates: ReformCandidateItem[]
  caveats: string[]
}
