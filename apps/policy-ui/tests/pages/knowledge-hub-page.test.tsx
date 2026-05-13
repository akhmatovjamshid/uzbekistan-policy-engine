import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KNOWLEDGE_HUB_PAGE_SOURCE = fileURLToPath(
  new URL('../../../src/pages/KnowledgeHubPage.tsx', import.meta.url),
)
const KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE = fileURLToPath(
  new URL('../../../src/components/knowledge-hub/KnowledgeHubContentView.tsx', import.meta.url),
)
const LOCALE_SOURCES = ['en', 'ru', 'uz'].map((locale) =>
  fileURLToPath(new URL(`../../../src/locales/${locale}/common.json`, import.meta.url)),
)
const PUBLIC_KNOWLEDGE_HUB_ARTIFACT = fileURLToPath(
  new URL('../../../public/data/knowledge-hub.json', import.meta.url),
)

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(collectStrings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectStrings)
  return []
}

describe('Knowledge Hub page', () => {
  it('loads the public artifact into the Knowledge Hub route', () => {
    const source = readFileSync(KNOWLEDGE_HUB_PAGE_SOURCE, 'utf8')

    assert.match(source, /<PageHeader\s+[\s\S]*title=\{t\('pages\.knowledgeHub\.title'\)\}/)
    assert.match(source, /description=\{t\('pages\.knowledgeHub\.description'\)\}/)
    assert.match(source, /loadKnowledgeHubSourceState/)
    assert.match(source, /KnowledgeHubContentView/)
    assert.match(source, /reformTracker\.header\.packages/)
    assert.match(source, /reformTracker\.header\.sources/)
    assert.match(source, /reformTracker\.header\.updated/)
    assert.match(source, /formatHeaderDate/)

    assert.doesNotMatch(source, /PendingSurface/)
    assert.doesNotMatch(source, /knowledgeHub\.pending/)
    assert.doesNotMatch(source, /candidateCount/)
  })

  it('renders exactly three visible Knowledge Hub subpages', () => {
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.match(contentViewSource, /KnowledgeHubSectionId = 'reformTracker' \| 'researchUpdates' \| 'literatureHub'/)
    assert.match(contentViewSource, /const HUB_SECTIONS: KnowledgeHubSectionId\[\] = \['reformTracker', 'researchUpdates', 'literatureHub'\]/)
    assert.match(contentViewSource, /activeSection === 'reformTracker'/)
    assert.match(contentViewSource, /activeSection === 'researchUpdates'/)
    assert.match(contentViewSource, /activeSection === 'literatureHub'/)

    assert.doesNotMatch(contentViewSource, /activeSection === 'sourceLibrary'/)
    assert.doesNotMatch(contentViewSource, /activeSection === 'methodology'/)
    assert.doesNotMatch(contentViewSource, /activeSection === 'modelImpactMap'/)
    assert.doesNotMatch(contentViewSource, /SourceLibrarySection/)
    assert.doesNotMatch(contentViewSource, /MethodologySection/)
    assert.doesNotMatch(contentViewSource, /ModelImpactMapSection/)
    assert.doesNotMatch(contentViewSource, /ReformCandidateList/)
  })

  it('keeps the public artifact package-only and source-verified', () => {
    const artifact = JSON.parse(readFileSync(PUBLIC_KNOWLEDGE_HUB_ARTIFACT, 'utf8'))

    assert.ok(artifact.reform_packages.length > 4)
    assert.deepEqual(artifact.candidates, [])
    assert.deepEqual(artifact.accepted_reforms, [])
    assert.ok(
      artifact.reform_packages.every((reformPackage: { official_source_events?: { source_url_status?: string }[] }) =>
        reformPackage.official_source_events?.every((sourceEvent) => sourceEvent.source_url_status === 'verified'),
      ),
    )
  })

  it('renders a CorpInfo-style latest-changes digest with the required labels', () => {
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.match(contentViewSource, /LatestChangesSection/)
    assert.match(contentViewSource, /latestPackages = packages\.slice\(0, 3\)/)
    assert.match(contentViewSource, /latestChanges\.changed/)
    assert.match(contentViewSource, /latestChanges\.appliesTo/)
    assert.match(contentViewSource, /latestChanges\.effectiveStatus/)
    assert.match(contentViewSource, /latestChanges\.document/)
    assert.match(contentViewSource, /digestChangeText\(reformPackage, t\)/)
    assert.match(contentViewSource, /isVisibleMeasure/)
    assert.doesNotMatch(contentViewSource, /const firstMeasure = parameterList\(reformPackage, t\)\[0\]/)
  })

  it('renders search and compact archive controls instead of a selected-dossier desk', () => {
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.match(contentViewSource, /TrackerControlsPanel/)
    assert.match(contentViewSource, /type="search"/)
    assert.match(contentViewSource, /sourceHost/)
    assert.match(contentViewSource, /ReformArchive/)
    assert.match(contentViewSource, /className="archive-item"/)
    assert.match(contentViewSource, /<details/)
    assert.match(contentViewSource, /TimelineChips/)
    assert.match(contentViewSource, /ModelLensChips/)

    assert.doesNotMatch(contentViewSource, /DossierDetail/)
    assert.doesNotMatch(contentViewSource, /selectedPackageId/)
    assert.doesNotMatch(contentViewSource, /dossier-desk/)
    assert.doesNotMatch(contentViewSource, /dossier-rail/)
  })

  it('keeps source checks and selection rules as compact supporting disclosures', () => {
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.match(contentViewSource, /SupportingInfo/)
    assert.match(contentViewSource, /sourceDiagnosticsSummary/)
    assert.match(contentViewSource, /support\.sourcesTitle/)
    assert.match(contentViewSource, /support\.selectionTitle/)
    assert.match(contentViewSource, /rulebook\?\.actual_reform_definition/)
    assert.doesNotMatch(contentViewSource, /methodology-rules/)
    assert.doesNotMatch(contentViewSource, /source-library-list/)
  })

  it('renders research updates and literature hub without exposing old policy-brief or model-map tabs', () => {
    const artifact = JSON.parse(readFileSync(PUBLIC_KNOWLEDGE_HUB_ARTIFACT, 'utf8'))
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.ok(artifact.policy_briefs.length >= 3)
    assert.match(contentViewSource, /ResearchUpdatesSection/)
    assert.match(contentViewSource, /research-update-card/)
    assert.match(contentViewSource, /content\.policy_briefs/)
    assert.match(contentViewSource, /LiteratureHubSection/)
    assert.match(contentViewSource, /LITERATURE_ITEMS/)
    assert.match(contentViewSource, /literature-card/)

    assert.doesNotMatch(contentViewSource, /PolicyBriefsSection/)
    assert.doesNotMatch(contentViewSource, /policy-brief-card/)
    assert.doesNotMatch(contentViewSource, /impact-package-card/)
  })

  it('shows active model lenses and muted planned model lenses', () => {
    const artifact = JSON.parse(readFileSync(PUBLIC_KNOWLEDGE_HUB_ARTIFACT, 'utf8'))
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')
    const activeIds = artifact.model_impact_map.active_lenses.map((lens: { id: string; status: string }) => `${lens.id}:${lens.status}`)
    const gatedIds = artifact.model_impact_map.gated_lenses.map((lens: { id: string; status: string }) => `${lens.id}:${lens.status}`)

    assert.deepEqual(activeIds.sort(), ['DFM:possible_lens', 'I-O:possible_lens', 'QPM:possible_lens'].sort())
    assert.deepEqual(
      gatedIds.sort(),
      ['CGE:planned_gated', 'FPP:planned_gated', 'HFI:planned_gated', 'PE:planned_gated', 'Synthesis:planned_gated'].sort(),
    )
    assert.ok(
      artifact.model_impact_map.package_links.every((link: { active_lenses: { model_id: string }[] }) =>
        link.active_lenses.every((lens) => ['QPM', 'DFM', 'I-O'].includes(lens.model_id)),
      ),
    )
    assert.match(contentViewSource, /model-chip--active/)
    assert.match(contentViewSource, /model-chip--planned/)
    assert.match(contentViewSource, /gatedLenses\(content\)/)
  })

  it('covers visible Knowledge Hub v3 strings in EN, RU, and UZ locales', () => {
    for (const localePath of LOCALE_SOURCES) {
      const locale = JSON.parse(readFileSync(localePath, 'utf8'))
      assert.equal(typeof locale.pages.knowledgeHub.title, 'string')
      assert.equal(typeof locale.pages.knowledgeHub.description, 'string')
      assert.equal(typeof locale.knowledgeHub.sections.reformTracker, 'string')
      assert.equal(typeof locale.knowledgeHub.sections.researchUpdates, 'string')
      assert.equal(typeof locale.knowledgeHub.sections.literatureHub, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.latestChanges.changed, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.latestChanges.appliesTo, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.latestChanges.effectiveStatus, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.latestChanges.document, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.filters.search, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.filters.status, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.filters.source, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.archive.title, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.archive.modelLenses, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.support.sourcesTitle, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.support.selectionTitle, 'string')
      assert.equal(typeof locale.knowledgeHub.researchUpdates.title, 'string')
      assert.equal(typeof locale.knowledgeHub.researchUpdates.sources, 'string')
      assert.equal(typeof locale.knowledgeHub.literatureHub.title, 'string')
      assert.equal(typeof locale.knowledgeHub.literatureHub.openSource, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.openOfficialSourceAria, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.sourceLinkMeta, 'string')
    }
  })

  it('keeps internal or LLM-style wording out of the visible Knowledge Hub v3 copy', () => {
    const locale = JSON.parse(readFileSync(LOCALE_SOURCES[0], 'utf8'))
    const visibleCopy = collectStrings({
      page: locale.pages.knowledgeHub,
      header: locale.knowledgeHub.reformTracker.header,
      metrics: locale.knowledgeHub.reformTracker.metrics,
      filters: locale.knowledgeHub.reformTracker.filters,
      latestChanges: locale.knowledgeHub.reformTracker.latestChanges,
      archive: locale.knowledgeHub.reformTracker.archive,
      support: locale.knowledgeHub.reformTracker.support,
      researchUpdates: locale.knowledgeHub.researchUpdates,
      literatureHub: locale.knowledgeHub.literatureHub,
      sections: {
        reformTracker: locale.knowledgeHub.sections.reformTracker,
        researchUpdates: locale.knowledgeHub.sections.researchUpdates,
        literatureHub: locale.knowledgeHub.sections.literatureHub,
      },
    }).join('\n')

    assert.doesNotMatch(visibleCopy, /\b(candidate|review queue|RSS|intelligence feed|artifact|configured-source|source-backed|diagnostics|intake|rulebook|guarded export|model-output)\b/i)
    assert.doesNotMatch(visibleCopy, /\b(why it matters|insight|AI)\b/i)
  })

  it('does not render selected enum values as raw visible UI strings', () => {
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.doesNotMatch(contentViewSource, />\s*high\s*</)
    assert.doesNotMatch(contentViewSource, />\s*instructions_issued\s*</)
    assert.doesNotMatch(contentViewSource, />\s*official_policy_announcement\s*</)
  })

  it('opens official and literature source links outside the SPA', () => {
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.match(contentViewSource, /target: '_blank'/)
    assert.match(contentViewSource, /rel: 'noopener noreferrer'/)
    assert.match(contentViewSource, /href=\{sourceEvent\.source_url\}/)
    assert.match(contentViewSource, /href=\{event\.source_url\}/)
    assert.match(contentViewSource, /href=\{item\.url\}/)
    assert.match(contentViewSource, /openOfficialSourceAria/)
    assert.match(contentViewSource, /sourceLinkMeta/)
  })
})
