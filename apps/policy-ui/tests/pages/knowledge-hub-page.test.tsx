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
const TIMELINE_ITEM_SOURCE = fileURLToPath(
  new URL('../../../src/components/knowledge-hub/TimelineItem.tsx', import.meta.url),
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
  it('loads and renders tracker artifact content instead of the pending surface', () => {
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

  it('renders the v2 dossier desk without a visible candidate or review queue surface', () => {
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.match(contentViewSource, /KnowledgeHubSectionId = 'reformTracker' \| 'sourceLibrary' \| 'methodology'/)
    assert.match(contentViewSource, /ReformTrackerDesk/)
    assert.match(contentViewSource, /DossierFiltersPanel/)
    assert.match(contentViewSource, /DossierList/)
    assert.match(contentViewSource, /DossierDetail/)
    assert.match(contentViewSource, /dossier-desk/)
    assert.match(contentViewSource, /dossier-rail/)
    assert.match(contentViewSource, /dossier-row/)
    assert.match(contentViewSource, /reform-dossier/)
    assert.match(contentViewSource, /filteredPackages\.find\(\(item\) => item\.package_id === selectedPackageId\) \?\? filteredPackages\[0\]/)
    assert.match(contentViewSource, /hub-section-tabs/)
    assert.match(contentViewSource, /trackerLabel\(t, 'eventType'/)
    assert.match(contentViewSource, /packageMatchesFilters/)

    assert.doesNotMatch(contentViewSource, /ReformCandidateList/)
    assert.doesNotMatch(contentViewSource, /reform-package-table/)
    assert.doesNotMatch(contentViewSource, /Unreviewed candidates/)
    assert.doesNotMatch(contentViewSource, /Review Queue/)
    assert.doesNotMatch(contentViewSource, /filteredPackages\[0\] \?\? sortedPackages\[0\]/)
    assert.doesNotMatch(contentViewSource, /\{reformPackage\.source_confidence\}/)
    assert.doesNotMatch(contentViewSource, /\{item\.milestone\.event_type\}/)
  })

  it('keeps hidden mock reform, brief, and candidate components out of the page route', () => {
    const pageSource = readFileSync(KNOWLEDGE_HUB_PAGE_SOURCE, 'utf8')

    assert.doesNotMatch(pageSource, /BriefCard/)
    assert.doesNotMatch(pageSource, /ResearchBriefList/)
    assert.doesNotMatch(pageSource, /ReformCandidateList/)
    assert.doesNotMatch(pageSource, /knowledge-hub-static-banner/)
    assert.doesNotMatch(pageSource, /hub-grid/)
  })

  it('renders all 4 reform packages as dossiers from the static artifact', () => {
    const artifact = JSON.parse(readFileSync(PUBLIC_KNOWLEDGE_HUB_ARTIFACT, 'utf8'))
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.equal(artifact.reform_packages.length, 4)
    assert.match(contentViewSource, /packages=\{filteredPackages\}/)
    assert.match(contentViewSource, /totalCount=\{sortedPackages\.length\}/)
    assert.match(contentViewSource, /knowledgeHub\.reformTracker\.packages\.showing/)
    assert.ok(artifact.reform_packages.every((reformPackage: { title?: string }) => reformPackage.title))
  })

  it('selected dossier detail exposes source, measures, timeline, institutions, policy channels, and a concise note', () => {
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.match(contentViewSource, /OfficialSourceBasis/)
    assert.match(contentViewSource, /ResponsibleInstitutions/)
    assert.match(contentViewSource, /ImplementationTimeline/)
    assert.match(contentViewSource, /keyMeasures/)
    assert.match(contentViewSource, /policyChannels/)
    assert.match(contentViewSource, /registryNote/)
    assert.match(contentViewSource, /cleanDossierText/)
    assert.doesNotMatch(contentViewSource, /reformPackage\.caveat/)
    assert.match(contentViewSource, /parameterList/)
    assert.match(contentViewSource, /policyChannels/)
  })

  it('subsection tabs render source library and methodology from artifact metadata', () => {
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.match(contentViewSource, /HUB_SECTIONS/)
    assert.match(contentViewSource, /sourceLibrary/)
    assert.match(contentViewSource, /methodology/)
    assert.match(contentViewSource, /SourceLibrarySection/)
    assert.match(contentViewSource, /MethodologySection/)
    assert.match(contentViewSource, /source_diagnostics/)
    assert.match(contentViewSource, /rulebook/)
    assert.match(contentViewSource, /content\.sources/)
    assert.match(contentViewSource, /methodology-rules/)
    assert.doesNotMatch(contentViewSource, /PlannedSection/)
  })

  it('covers visible Reform Tracker strings in EN, RU, and UZ locales', () => {
    for (const localePath of LOCALE_SOURCES) {
      const locale = JSON.parse(readFileSync(localePath, 'utf8'))
      assert.equal(typeof locale.pages.knowledgeHub.title, 'string')
      assert.equal(typeof locale.pages.knowledgeHub.description, 'string')
      assert.equal(typeof locale.knowledgeHub.sections.reformTracker, 'string')
      assert.equal(typeof locale.knowledgeHub.sections.sourceLibrary, 'string')
      assert.equal(typeof locale.knowledgeHub.sections.methodology, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.header.updated, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.metrics.dossiers, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.filters.policyArea, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.packages.showing, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.packages.officialSource, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.whatChanged, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.source, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.openOfficialSourceAria, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.sourceLinkMeta, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.keyMeasures, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.implementationTimeline, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.responsibleInstitutions, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.policyChannels, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.note, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.dossier.registryNote, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.timeline.relatedNext, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.labels.eventType.instructions_issued, 'string')
      assert.equal(typeof locale.knowledgeHub.sourceLibrary.title, 'string')
      assert.equal(typeof locale.knowledgeHub.sourceLibrary.openSourceAria, 'string')
      assert.equal(typeof locale.knowledgeHub.sourceLibrary.invalidLinks, 'string')
      assert.equal(typeof locale.knowledgeHub.sourceLibrary.statusMissing, 'string')
      assert.equal(typeof locale.knowledgeHub.methodologyDetail.title, 'string')
      assert.equal(typeof locale.knowledgeHub.methodologyDetail.definitionTitle, 'string')
      assert.equal(typeof locale.knowledgeHub.methodologyDetail.showFullRules, 'string')
      assert.equal(typeof locale.knowledgeHub.methodologyDetail.note, 'string')
      assert.equal(typeof locale.knowledgeHub.reformTracker.notice.sourceLanguage, 'string')
    }
  })

  it('keeps internal pipeline wording out of visible Knowledge Hub copy', () => {
    const locale = JSON.parse(readFileSync(LOCALE_SOURCES[0], 'utf8'))
    const visibleCopy = collectStrings({
      page: locale.pages.knowledgeHub,
      header: locale.knowledgeHub.reformTracker.header,
      metrics: locale.knowledgeHub.reformTracker.metrics,
      notice: locale.knowledgeHub.reformTracker.notice,
      filters: locale.knowledgeHub.reformTracker.filters,
      packages: locale.knowledgeHub.reformTracker.packages,
      dossier: locale.knowledgeHub.reformTracker.dossier,
      sourceLibrary: locale.knowledgeHub.sourceLibrary,
      methodology: locale.knowledgeHub.methodologyDetail,
      sections: {
        reformTracker: locale.knowledgeHub.sections.reformTracker,
        sourceLibrary: locale.knowledgeHub.sections.sourceLibrary,
        methodology: locale.knowledgeHub.sections.methodology,
      },
    }).join('\n')

    assert.doesNotMatch(visibleCopy, /\b(artifact|configured-source|source-backed|diagnostics|candidate|intake|rulebook|guarded export|model-output)\b/i)
    assert.doesNotMatch(visibleCopy, /\bconfidence\b/i)
  })

  it('does not render selected enum values as raw visible UI strings', () => {
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')

    assert.doesNotMatch(contentViewSource, />\s*high\s*</)
    assert.doesNotMatch(contentViewSource, />\s*instructions_issued\s*</)
    assert.doesNotMatch(contentViewSource, />\s*official_policy_announcement\s*</)
  })

  it('opens official source links outside the SPA', () => {
    const contentViewSource = readFileSync(KNOWLEDGE_HUB_CONTENT_VIEW_SOURCE, 'utf8')
    const timelineItemSource = readFileSync(TIMELINE_ITEM_SOURCE, 'utf8')

    assert.match(contentViewSource, /target: '_blank'/)
    assert.match(contentViewSource, /rel: 'noopener noreferrer'/)
    assert.match(contentViewSource, /href=\{sourceEvent\.source_url\}/)
    assert.match(contentViewSource, /openOfficialSourceAria/)
    assert.match(contentViewSource, /sourceLinkMeta/)
    assert.match(contentViewSource, /href=\{source\.url\}/)
    assert.match(timelineItemSource, /target: '_blank'/)
    assert.match(timelineItemSource, /rel: 'noopener noreferrer'/)
    assert.match(timelineItemSource, /<a href=\{item\.source_url\} \{\.\.\.EXTERNAL_LINK_PROPS\}>/)
  })
})
