import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type {
  KnowledgeHubContent,
  KnowledgeHubConfiguredSource,
  KnowledgeHubRulebookRule,
  KnowledgeHubSourceDiagnostic,
  ReformPackage,
  ReformPackageMilestone,
  ReformPackageSourceEvent,
} from '../../contracts/data-contract.js'

type KnowledgeHubContentViewProps = {
  content: KnowledgeHubContent
}

type KnowledgeHubSectionId = 'reformTracker' | 'sourceLibrary' | 'methodology'
type LabelNamespace = 'eventType'

type DossierFilters = {
  policyArea: string
  stage: string
  institution: string
}

const EXTERNAL_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

const HUB_SECTIONS: KnowledgeHubSectionId[] = ['reformTracker', 'sourceLibrary', 'methodology']

function dateSortKey(value: string): string {
  if (/^\d{4}$/.test(value)) return `${value}-01-01`
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`
  return value
}

function formatDisplayDate(value: string | undefined): string {
  if (!value) return 'n/a'
  if (/^\d{4}$/.test(value)) return value
  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) return value
  return parsed.toISOString().slice(0, 10)
}

function referenceTime(value: string | undefined): number {
  const parsed = value ? Date.parse(value) : Number.NaN
  return Number.isFinite(parsed) ? parsed : Date.now()
}

function hostLabel(value: string | undefined): string {
  if (!value) return 'n/a'
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

function formatCount(value: number | undefined): string {
  return String(value ?? 0)
}

function isFutureDate(value: string, reference: number): boolean {
  const parsed = Date.parse(dateSortKey(value))
  return Number.isFinite(parsed) && parsed > reference
}

function packageTimeline(reformPackage: ReformPackage): ReformPackageMilestone[] {
  return [...reformPackage.implementation_milestones].sort((left, right) =>
    dateSortKey(left.date).localeCompare(dateSortKey(right.date)),
  )
}

function sourceById(reformPackage: ReformPackage, id: string): ReformPackageSourceEvent | undefined {
  return reformPackage.official_source_events.find((event) => event.id === id)
}

function flattenMilestones(packages: ReformPackage[]): ReformPackageMilestone[] {
  return packages
    .flatMap((reformPackage) => reformPackage.implementation_milestones)
    .sort((left, right) => dateSortKey(left.date).localeCompare(dateSortKey(right.date)))
}

function trackerLabel(t: TFunction, namespace: LabelNamespace, value: string): string {
  return t(`knowledgeHub.reformTracker.labels.${namespace}.${value}`)
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0))).sort((left, right) =>
    left.localeCompare(right),
  )
}

function packageMatchesFilters(reformPackage: ReformPackage, filters: DossierFilters): boolean {
  return (
    (!filters.policyArea || reformPackage.policy_area === filters.policyArea) &&
    (!filters.stage || reformPackage.current_stage === filters.stage) &&
    (!filters.institution || reformPackage.responsible_institutions.includes(filters.institution))
  )
}

function splitSentences(value: string): string[] {
  return value
    .split(/(?<=[.!?])\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function cleanDossierText(value: string): string {
  const withoutTrackerLead = value.replace(/^Tracks an?\s+/i, (match) =>
    /^Tracks an/i.test(match) ? 'An ' : 'A ',
  )
  const usefulSentences = splitSentences(withoutTrackerLead).filter(
    (sentence) =>
      !/not as an independently verified legal registry/i.test(sentence) &&
      !/not an official legal registry/i.test(sentence) &&
      !/not as disbursement verification/i.test(sentence),
  )
  return usefulSentences.join(' ')
}

function dossierSummary(reformPackage: ReformPackage): string {
  if (reformPackage.short_summary) return cleanDossierText(reformPackage.short_summary)
  const sourceSummary = splitSentences(reformPackage.official_source_events[0]?.summary ?? '')
  const summary = sourceSummary.slice(0, 2).join(' ')
  return summary || reformPackage.why_tracked
}

function compactUniqueList(values: string[]): string[] {
  return uniqueSorted(values).filter((value, index, entries) => {
    const normalized = value.toLowerCase()
    return !entries.some((other, otherIndex) => otherIndex !== index && other.toLowerCase().includes(normalized))
  })
}

function parameterList(reformPackage: ReformPackage): string[] {
  const parameters = reformPackage.parameters_or_amounts ?? []
  const derived = [
    reformPackage.financing_or_incentive,
    ...reformPackage.measure_tracks.map((track) => (track.status ? `${track.label}: ${track.status}` : track.label)),
  ]
  return compactUniqueList([...parameters, ...derived].filter((value): value is string => Boolean(value)))
}

function policyChannels(reformPackage: ReformPackage): string[] {
  return reformPackage.policy_channels && reformPackage.policy_channels.length > 0
    ? reformPackage.policy_channels
    : reformPackage.model_relevance
}

function stageTone(stage: string): 'green' | 'amber' | 'blue' {
  const normalized = stage.toLowerCase()
  if (normalized.includes('adopt') || normalized.includes('approved')) return 'amber'
  if (normalized.includes('verified')) return 'blue'
  return 'green'
}

function MetricIcon({ type }: { type: 'dossier' | 'sources' | 'calendar' | 'clock' | 'info' }) {
  const paths = {
    dossier: 'M7 3h7l4 4v14H7V3zm7 0v5h5M10 12h6M10 16h6',
    sources: 'M4 20h16M6 18V9l6-4 6 4v9M9 18v-6M12 18v-6M15 18v-6M5 9h14',
    calendar: 'M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2zM8 13h3M13 13h3M8 17h3M13 17h3',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-14v6l4 2',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-10v6M12 7h.01',
  }

  return (
    <svg className="tracker-metric__icon" aria-hidden="true" viewBox="0 0 24 24">
      <path d={paths[type]} />
    </svg>
  )
}

function MetricStrip({ content, packages }: { content: KnowledgeHubContent; packages: ReformPackage[] }) {
  const { t } = useTranslation()
  const sourceDiagnostics = content.source_diagnostics ?? []
  const generatedReference = referenceTime(content.generated_at)
  const upcomingMilestones = flattenMilestones(packages).filter((milestone) =>
    isFutureDate(milestone.date, generatedReference),
  ).length
  const metrics = [
    {
      icon: 'dossier' as const,
      label: t('knowledgeHub.reformTracker.metrics.dossiers'),
      value: String(packages.length),
    },
    {
      icon: 'sources' as const,
      label: t('knowledgeHub.reformTracker.metrics.officialSources'),
      value: String(content.meta.sources_configured ?? sourceDiagnostics.length),
    },
    {
      icon: 'calendar' as const,
      label: t('knowledgeHub.reformTracker.metrics.upcomingMilestones'),
      value: String(upcomingMilestones),
    },
  ]

  return (
    <section aria-label={t('knowledgeHub.reformTracker.metrics.aria')} className="tracker-summary">
      {metrics.map((metric) => (
        <div key={metric.label} className="tracker-metric">
          <MetricIcon type={metric.icon} />
          <span className="tracker-summary__value">{metric.value}</span>
          <span className="tracker-summary__label">{metric.label}</span>
        </div>
      ))}
    </section>
  )
}

function DossierFiltersPanel({
  filters,
  onFiltersChange,
  packages,
}: {
  filters: DossierFilters
  onFiltersChange: (filters: DossierFilters) => void
  packages: ReformPackage[]
}) {
  const { t } = useTranslation()
  const policyAreas = uniqueSorted(packages.map((item) => item.policy_area))
  const stages = uniqueSorted(packages.map((item) => item.current_stage))
  const institutions = uniqueSorted(packages.flatMap((item) => item.responsible_institutions))

  function updateFilter(key: keyof DossierFilters, value: string) {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <section className="dossier-filters" aria-label={t('knowledgeHub.reformTracker.filters.aria')}>
      <div className="dossier-filters__topline">
        <span>{t('knowledgeHub.reformTracker.filters.title')}</span>
        <button
          type="button"
          className="dossier-filters__clear"
          onClick={() => onFiltersChange({ policyArea: '', stage: '', institution: '' })}
        >
          {t('knowledgeHub.reformTracker.filters.clearAll')}
        </button>
      </div>
      <label>
        <span>{t('knowledgeHub.reformTracker.filters.policyArea')}</span>
        <select value={filters.policyArea} onChange={(event) => updateFilter('policyArea', event.target.value)}>
          <option value="">{t('knowledgeHub.reformTracker.filters.allAreas')}</option>
          {policyAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{t('knowledgeHub.reformTracker.filters.stage')}</span>
        <select value={filters.stage} onChange={(event) => updateFilter('stage', event.target.value)}>
          <option value="">{t('knowledgeHub.reformTracker.filters.allStages')}</option>
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{t('knowledgeHub.reformTracker.filters.institution')}</span>
        <select value={filters.institution} onChange={(event) => updateFilter('institution', event.target.value)}>
          <option value="">{t('knowledgeHub.reformTracker.filters.allInstitutions')}</option>
          {institutions.map((institution) => (
            <option key={institution} value={institution}>
              {institution}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}

function DossierList({
  packages,
  selectedPackageId,
  onSelect,
  onClearFilters,
  totalCount,
}: {
  packages: ReformPackage[]
  selectedPackageId: string
  onSelect: (packageId: string) => void
  onClearFilters: () => void
  totalCount: number
}) {
  const { t } = useTranslation()

  if (packages.length === 0) {
    return (
      <section className="dossier-list dossier-list--empty" aria-label={t('knowledgeHub.reformTracker.packages.aria')}>
        <p className="empty-state empty-state--compact">{t('knowledgeHub.reformTracker.packages.empty')}</p>
        {totalCount > 0 ? (
          <button type="button" className="ui-secondary-action" onClick={onClearFilters}>
            {t('knowledgeHub.reformTracker.filters.clearAll')}
          </button>
        ) : null}
      </section>
    )
  }

  return (
    <section className="dossier-list" aria-label={t('knowledgeHub.reformTracker.packages.aria')}>
      <div className="dossier-list__topline">
        <span>{t('knowledgeHub.reformTracker.packages.count', { count: packages.length })}</span>
        <span>{t('knowledgeHub.reformTracker.packages.sortRecent')}</span>
      </div>
      <div className="dossier-list__items">
        {packages.map((reformPackage) => {
          return (
            <button
              key={reformPackage.package_id}
              type="button"
              className={`dossier-row${reformPackage.package_id === selectedPackageId ? ' is-selected' : ''}`}
              onClick={() => onSelect(reformPackage.package_id)}
            >
              <span className="dossier-row__title">{reformPackage.title}</span>
              <span className="dossier-row__meta">
                <span>{reformPackage.responsible_institutions[0]}</span>
                <span>{formatDisplayDate(reformPackage.current_stage_date)}</span>
              </span>
              <span className="dossier-row__chips">
                <span className={`ui-chip ui-chip--${stageTone(reformPackage.current_stage)}`}>
                  {reformPackage.current_stage}
                </span>
                <span className="ui-chip">{t('knowledgeHub.reformTracker.packages.officialSource')}</span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="dossier-list__footer">{t('knowledgeHub.reformTracker.packages.showing', { count: packages.length, total: totalCount })}</p>
    </section>
  )
}

function ResponsibleInstitutions({ reformPackage }: { reformPackage: ReformPackage }) {
  const { t } = useTranslation()

  return (
    <section className="dossier-section dossier-section--institutions">
      <h3>{t('knowledgeHub.reformTracker.dossier.responsibleInstitutions')}</h3>
      <ul className="institution-list">
        {reformPackage.responsible_institutions.map((institution, index) => (
          <li key={institution}>
            <span className="institution-list__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 20h16M6 18V9l6-4 6 4v9M9 18v-6M12 18v-6M15 18v-6M5 9h14" />
              </svg>
            </span>
            <span>{institution}</span>
            <span className="ui-chip">{index === 0 ? t('knowledgeHub.reformTracker.dossier.lead') : t('knowledgeHub.reformTracker.dossier.partner')}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ImplementationTimeline({ reformPackage }: { reformPackage: ReformPackage }) {
  const { t } = useTranslation()
  const milestones = packageTimeline(reformPackage)

  return (
    <section className="dossier-section dossier-section--timeline">
      <h3>{t('knowledgeHub.reformTracker.dossier.implementationTimeline')}</h3>
      {milestones.length > 0 ? (
        <ol className="dossier-timeline">
          {milestones.map((milestone) => {
            const sourceEvent = sourceById(reformPackage, milestone.source_event_ids[0] ?? '')
            return (
              <li key={milestone.id}>
                <time dateTime={milestone.date}>{formatDisplayDate(milestone.date)}</time>
                <span className="dossier-timeline__dot" aria-hidden="true" />
                <div>
                  <strong>{milestone.label}</strong>
                  <span>{trackerLabel(t, 'eventType', milestone.event_type)}</span>
                  {sourceEvent ? <span>{sourceEvent.source_institution}</span> : null}
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="empty-state empty-state--compact">
          {t('knowledgeHub.reformTracker.dossier.noPackageTimeline')}
        </p>
      )}
    </section>
  )
}

function OfficialSourceBasis({ reformPackage }: { reformPackage: ReformPackage }) {
  const { t } = useTranslation()
  const sourceEvent = reformPackage.official_source_events[0]
  const sourceHost = hostLabel(sourceEvent?.source_url)

  return (
    <section className="dossier-section dossier-section--source">
      <h3>{t('knowledgeHub.reformTracker.dossier.source')}</h3>
      {sourceEvent ? (
        <article className="source-basis">
          <h4>{sourceEvent.title}</h4>
          <dl>
            <div>
              <dt>{t('knowledgeHub.reformTracker.dossier.sourceInstitution')}</dt>
              <dd>{sourceEvent.source_institution}</dd>
            </div>
            <div>
              <dt>{t('knowledgeHub.reformTracker.dossier.publicationDate')}</dt>
              <dd>{formatDisplayDate(sourceEvent.source_published_at)}</dd>
            </div>
          </dl>
          <a
            href={sourceEvent.source_url}
            className="external-source-link"
            aria-label={t('knowledgeHub.reformTracker.dossier.openOfficialSourceAria', {
              title: sourceEvent.title,
            })}
            {...EXTERNAL_LINK_PROPS}
          >
            <span>{t('knowledgeHub.reformTracker.dossier.openOfficialSource')}</span>
            <span>{t('knowledgeHub.reformTracker.dossier.sourceLinkMeta', { host: sourceHost })}</span>
          </a>
        </article>
      ) : (
        <p className="empty-state empty-state--compact">{reformPackage.official_basis}</p>
      )}
    </section>
  )
}

function DossierDetail({ reformPackage }: { reformPackage: ReformPackage }) {
  const { t } = useTranslation()
  const parameters = parameterList(reformPackage)
  const channels = policyChannels(reformPackage)

  return (
    <article className="reform-dossier" aria-label={t('knowledgeHub.reformTracker.dossier.aria')}>
      <header className="reform-dossier__head">
        <div className="reform-dossier__headline">
          <h2>{reformPackage.title}</h2>
          <span>{t('knowledgeHub.reformTracker.dossier.lastUpdated', { date: formatDisplayDate(reformPackage.current_stage_date) })}</span>
        </div>
        <div className="reform-dossier__badges">
          <span className={`ui-chip ui-chip--${stageTone(reformPackage.current_stage)}`}>{reformPackage.current_stage}</span>
          <span className="ui-chip">{reformPackage.policy_area}</span>
        </div>
      </header>

      <div className="reform-dossier__body">
        <main className="reform-dossier__main">
          <section className="dossier-section">
            <h3>{t('knowledgeHub.reformTracker.dossier.whatChanged')}</h3>
            <p>{dossierSummary(reformPackage)}</p>
          </section>

          <section className="dossier-section">
            <h3>{t('knowledgeHub.reformTracker.dossier.keyMeasures')}</h3>
            <ul className="measure-list">
              {parameters.map((parameter) => (
                <li key={parameter}>{parameter}</li>
              ))}
            </ul>
          </section>

          <ResponsibleInstitutions reformPackage={reformPackage} />
        </main>

        <aside className="reform-dossier__aside">
          <OfficialSourceBasis reformPackage={reformPackage} />
        </aside>

        <ImplementationTimeline reformPackage={reformPackage} />

        <section className="dossier-section dossier-section--model">
          <h3>{t('knowledgeHub.reformTracker.dossier.policyChannels')}</h3>
          <p>{cleanDossierText(reformPackage.why_tracked)}</p>
          <div className="chip-row">
            {channels.map((channel) => (
              <span key={channel} className="attribution-badge">
                {channel}
              </span>
            ))}
          </div>
        </section>

        <section className="dossier-section dossier-section--caveats">
          <h3>{t('knowledgeHub.reformTracker.dossier.note')}</h3>
          <p>{t('knowledgeHub.reformTracker.dossier.registryNote')}</p>
        </section>
      </div>
    </article>
  )
}

function ReformTrackerDesk({ content }: { content: KnowledgeHubContent }) {
  const { t } = useTranslation()
  const packages = useMemo(() => content.reform_packages ?? [], [content.reform_packages])
  const [filters, setFilters] = useState<DossierFilters>({
    policyArea: '',
    stage: '',
    institution: '',
  })
  const sortedPackages = useMemo(
    () =>
      [...packages].sort((left, right) =>
        dateSortKey(right.current_stage_date).localeCompare(dateSortKey(left.current_stage_date)),
      ),
    [packages],
  )
  const filteredPackages = useMemo(
    () => sortedPackages.filter((reformPackage) => packageMatchesFilters(reformPackage, filters)),
    [filters, sortedPackages],
  )
  const [selectedPackageId, setSelectedPackageId] = useState(sortedPackages[0]?.package_id ?? '')
  const clearFilters = () => setFilters({ policyArea: '', stage: '', institution: '' })

  const selectedPackage =
    filteredPackages.find((item) => item.package_id === selectedPackageId) ?? filteredPackages[0]

  return (
    <>
      <MetricStrip content={content} packages={packages} />
      <section className="dossier-desk" aria-label={t('knowledgeHub.reformTracker.dossierDeskAria')}>
        <div className="dossier-rail">
          <DossierFiltersPanel filters={filters} onFiltersChange={setFilters} packages={sortedPackages} />
          <DossierList
            packages={filteredPackages}
            selectedPackageId={selectedPackage?.package_id ?? ''}
            onSelect={setSelectedPackageId}
            onClearFilters={clearFilters}
            totalCount={sortedPackages.length}
          />
        </div>
        {selectedPackage ? <DossierDetail reformPackage={selectedPackage} /> : null}
      </section>
    </>
  )
}

function sourceRows(content: KnowledgeHubContent): Array<KnowledgeHubConfiguredSource & { diagnostic?: KnowledgeHubSourceDiagnostic }> {
  const diagnosticsById = new Map((content.source_diagnostics ?? []).map((diagnostic) => [diagnostic.id, diagnostic]))
  const configuredSources = content.sources ?? []
  if (configuredSources.length > 0) {
    return configuredSources.map((source) => ({ ...source, diagnostic: diagnosticsById.get(source.id) }))
  }
  return (content.source_diagnostics ?? []).map((diagnostic) => ({
    id: diagnostic.id,
    institution: diagnostic.institution,
    url: diagnostic.url,
    diagnostic,
  }))
}

function SourceLibrarySection({ content }: { content: KnowledgeHubContent }) {
  const { t } = useTranslation()
  const rows = sourceRows(content)
  const diagnostics = content.source_diagnostics ?? []
  const checkedCount = diagnostics.filter((diagnostic) => diagnostic.ok).length
  const issueCount = diagnostics.filter((diagnostic) => !diagnostic.ok).length
  const candidateCount = diagnostics.reduce((sum, diagnostic) => sum + diagnostic.candidate_count, 0)
  const excludedCount = diagnostics.reduce((sum, diagnostic) => sum + diagnostic.excluded_count, 0)
  const invalidLinkCount = diagnostics.reduce((sum, diagnostic) => sum + diagnostic.link_invalid_count, 0)

  return (
    <section className="hub-detail-panel" aria-label={t('knowledgeHub.sourceLibrary.aria')}>
      <header className="hub-detail-panel__head">
        <div>
          <h2>{t('knowledgeHub.sourceLibrary.title')}</h2>
          <p>{t('knowledgeHub.sourceLibrary.description')}</p>
        </div>
      </header>

      <div className="hub-stat-grid" aria-label={t('knowledgeHub.sourceLibrary.summaryAria')}>
        <div className="hub-stat">
          <strong>{formatCount(rows.length)}</strong>
          <span>{t('knowledgeHub.sourceLibrary.sourcesConfigured')}</span>
        </div>
        <div className="hub-stat">
          <strong>{formatCount(checkedCount)}</strong>
          <span>{t('knowledgeHub.sourceLibrary.sourcesChecked')}</span>
        </div>
        <div className="hub-stat">
          <strong>{formatCount(candidateCount)}</strong>
          <span>{t('knowledgeHub.sourceLibrary.candidatesExtracted')}</span>
        </div>
        <div className="hub-stat">
          <strong>{formatCount(excludedCount)}</strong>
          <span>{t('knowledgeHub.sourceLibrary.excludedItems')}</span>
        </div>
        <div className="hub-stat">
          <strong>{formatCount(invalidLinkCount)}</strong>
          <span>{t('knowledgeHub.sourceLibrary.invalidLinks')}</span>
        </div>
      </div>

      {issueCount > 0 ? (
        <p className="source-library-note">
          {t('knowledgeHub.sourceLibrary.issueCount', { count: issueCount })}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <div className="source-library-list">
          {rows.map((source) => {
            const diagnostic = source.diagnostic
            return (
              <article key={source.id} className="source-library-card">
                <div>
                  <h3>{source.institution}</h3>
                  <p>{hostLabel(source.url)}</p>
                </div>
                <dl>
                  <div>
                    <dt>{t('knowledgeHub.sourceLibrary.lastChecked')}</dt>
                    <dd>{formatDisplayDate(diagnostic?.fetched_at)}</dd>
                  </div>
                  <div>
                    <dt>{t('knowledgeHub.sourceLibrary.itemsFound')}</dt>
                    <dd>{formatCount(diagnostic?.candidate_count)}</dd>
                  </div>
                  <div>
                    <dt>{t('knowledgeHub.sourceLibrary.excluded')}</dt>
                    <dd>{formatCount(diagnostic?.excluded_count)}</dd>
                  </div>
                  <div>
                    <dt>{t('knowledgeHub.sourceLibrary.linkStatus')}</dt>
                    <dd>
                      <span
                        className={`source-status${
                          diagnostic?.ok === false ? ' source-status--issue' : diagnostic ? '' : ' source-status--pending'
                        }`}
                      >
                        {diagnostic
                          ? diagnostic.ok
                            ? t('knowledgeHub.sourceLibrary.statusChecked')
                            : t('knowledgeHub.sourceLibrary.statusIssue')
                          : t('knowledgeHub.sourceLibrary.statusMissing')}
                      </span>
                    </dd>
                  </div>
                </dl>
                <a
                  href={source.url}
                  className="external-source-link"
                  aria-label={t('knowledgeHub.sourceLibrary.openSourceAria', { institution: source.institution })}
                  {...EXTERNAL_LINK_PROPS}
                >
                  <span>{t('knowledgeHub.sourceLibrary.openSource')}</span>
                  <span>{t('knowledgeHub.reformTracker.dossier.sourceLinkMeta', { host: hostLabel(source.url) })}</span>
                </a>
              </article>
            )
          })}
        </div>
      ) : (
        <p className="empty-state empty-state--compact">{t('knowledgeHub.sourceLibrary.empty')}</p>
      )}
    </section>
  )
}

function RuleList({ rules }: { rules: KnowledgeHubRulebookRule[] }) {
  return (
    <ol className="methodology-rule-list">
      {rules.map((rule) => (
        <li key={rule.id}>
          <strong>{rule.label ?? rule.id}</strong>
          {rule.description ? <span>{rule.description}</span> : null}
        </li>
      ))}
    </ol>
  )
}

function MethodologySection({ content }: { content: KnowledgeHubContent }) {
  const { t } = useTranslation()
  const rulebook = content.rulebook

  return (
    <section className="hub-detail-panel methodology-panel" aria-label={t('knowledgeHub.methodologyDetail.aria')}>
      <header className="hub-detail-panel__head">
        <div>
          <h2>{t('knowledgeHub.methodologyDetail.title')}</h2>
          <p>{t('knowledgeHub.methodologyDetail.description')}</p>
        </div>
      </header>

      <div className="methodology-definition">
        <h3>{t('knowledgeHub.methodologyDetail.definitionTitle')}</h3>
        <p>{rulebook?.actual_reform_definition ?? t('knowledgeHub.methodologyDetail.definitionUnavailable')}</p>
      </div>

      <details className="methodology-rules">
        <summary>{t('knowledgeHub.methodologyDetail.showFullRules')}</summary>
        <div className="methodology-columns">
          <section>
            <h3>{t('knowledgeHub.methodologyDetail.includedTitle')}</h3>
            <RuleList rules={rulebook?.include_rules ?? []} />
          </section>
          <section>
            <h3>{t('knowledgeHub.methodologyDetail.excludedTitle')}</h3>
            <RuleList rules={rulebook?.exclude_rules ?? []} />
          </section>
        </div>
      </details>

      <section className="dossier-section dossier-section--caveats">
        <h3>{t('knowledgeHub.methodologyDetail.note')}</h3>
        <ul>
          <li>{t('knowledgeHub.reformTracker.methodology.caveat')}</li>
          <li>{t('knowledgeHub.reformTracker.notice.sourceLanguage')}</li>
        </ul>
      </section>
    </section>
  )
}

export function KnowledgeHubContentView({ content }: KnowledgeHubContentViewProps) {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState<KnowledgeHubSectionId>('reformTracker')

  return (
    <>
      <div className="hub-section-tabs" role="tablist" aria-label={t('knowledgeHub.sections.aria')}>
        {HUB_SECTIONS.map((sectionId) => (
          <button
            key={sectionId}
            type="button"
            role="tab"
            aria-selected={activeSection === sectionId}
            className={activeSection === sectionId ? 'is-active' : ''}
            onClick={() => setActiveSection(sectionId)}
          >
            {t(`knowledgeHub.sections.${sectionId}`)}
          </button>
        ))}
      </div>
      {activeSection === 'reformTracker' ? <ReformTrackerDesk content={content} /> : null}
      {activeSection === 'sourceLibrary' ? <SourceLibrarySection content={content} /> : null}
      {activeSection === 'methodology' ? <MethodologySection content={content} /> : null}
    </>
  )
}
