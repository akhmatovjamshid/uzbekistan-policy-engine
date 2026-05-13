import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type {
  KnowledgeHubActiveModelLensId,
  KnowledgeHubContent,
  KnowledgeHubGatedModelLensId,
  KnowledgeHubLiteratureItem,
  ReformPackage,
  ReformPackageMilestone,
  ReformPackageSourceEvent,
} from '../../contracts/data-contract.js'
import {
  dateSortKey,
  sortMilestonesChronologically,
  sortReformPackagesNewestFirst,
  sortResearchUpdatesNewestFirst,
} from './knowledge-hub-ordering.js'

type KnowledgeHubContentViewProps = {
  content: KnowledgeHubContent
}

type KnowledgeHubSectionId = 'reformTracker' | 'researchUpdates' | 'literatureHub'
type LabelNamespace = 'eventType' | 'evidenceType'
type ModelLensId = KnowledgeHubActiveModelLensId | KnowledgeHubGatedModelLensId

type KeyMeasureLabelKey =
  | 'whatChanged'
  | 'whoAffected'
  | 'effectiveStatus'
  | 'newRule'
  | 'amountsDeadlines'
  | 'officialDocument'

type KeyMeasureRow = {
  labelKey: KeyMeasureLabelKey
  values: string[]
}

type DossierFilters = {
  search: string
  policyArea: string
  stage: string
  sourceHost: string
}

const EXTERNAL_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

const HUB_SECTIONS: KnowledgeHubSectionId[] = ['reformTracker', 'researchUpdates', 'literatureHub']

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
  return sortMilestonesChronologically(reformPackage.implementation_milestones)
}

function flattenMilestones(packages: ReformPackage[]): ReformPackageMilestone[] {
  return packages
    .flatMap((reformPackage) => reformPackage.implementation_milestones)
    .sort((left, right) => dateSortKey(left.date).localeCompare(dateSortKey(right.date)))
}

function hasDuplicateTitle(reformPackage: ReformPackage, packages: ReformPackage[]): boolean {
  const normalizedTitle = reformPackage.title.trim().toLowerCase()
  return packages.filter((item) => item.title.trim().toLowerCase() === normalizedTitle).length > 1
}

function isGenericDossierTitle(title: string): boolean {
  return /^policy implementation reform$/i.test(title.trim())
}

function dossierDisplayTitle(reformPackage: ReformPackage, packages: ReformPackage[]): string {
  if (!isGenericDossierTitle(reformPackage.title) && !hasDuplicateTitle(reformPackage, packages)) {
    return reformPackage.title
  }

  return `${reformPackage.title}: ${reformPackage.policy_area}`
}

function sourceById(reformPackage: ReformPackage, id: string): ReformPackageSourceEvent | undefined {
  return reformPackage.official_source_events.find((event) => event.id === id)
}

function trackerLabel(t: TFunction, namespace: LabelNamespace, value: string): string {
  return t(`knowledgeHub.reformTracker.labels.${namespace}.${value}`)
}

function humanizeMachineToken(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (letter) => letter.toUpperCase())
}

function displayEvidenceType(t: TFunction, value: string): string {
  const translated = trackerLabel(t, 'evidenceType', value)
  return translated === `knowledgeHub.reformTracker.labels.evidenceType.${value}`
    ? humanizeMachineToken(value)
    : translated
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0))).sort((left, right) =>
    left.localeCompare(right),
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
  return summary || cleanDossierText(reformPackage.why_tracked)
}

function compactUniqueList(values: string[]): string[] {
  return uniqueSorted(values).filter((value, index, entries) => {
    const normalized = value.toLowerCase()
    return !entries.some((other, otherIndex) => otherIndex !== index && other.toLowerCase().includes(normalized))
  })
}

function displayParameter(t: TFunction, value: string): string {
  const evidenceTypeMatch = value.match(/^Evidence type:\s*([a-z_]+)$/i)
  if (evidenceTypeMatch) {
    return `${t('knowledgeHub.reformTracker.timeline.evidenceType')}: ${displayEvidenceType(t, evidenceTypeMatch[1])}`
  }

  return value.replace(/\b[a-z]+(?:_[a-z]+)+\b/g, (token) => humanizeMachineToken(token).toLowerCase())
}

const HIDDEN_MEASURE_PATTERNS = [
  /^(Evidence type|Source event date|Source event dates|Verified official source event date|Legal act registered|Official source event published):/i,
  /No future implementation deadline/i,
  /Tracks one verified official source event/i,
  /Tracks \d+ verified official source events?/i,
  /Official detail page did not expose/i,
]

function isVisibleMeasure(value: string): boolean {
  const normalized = value.trim()
  return !HIDDEN_MEASURE_PATTERNS.some((pattern) => pattern.test(normalized))
}

function parameterList(reformPackage: ReformPackage, t: TFunction): string[] {
  const parameters = (reformPackage.parameters_or_amounts ?? []).filter(isVisibleMeasure)
  const derived = [
    reformPackage.financing_or_incentive,
    ...reformPackage.measure_tracks.map((track) => (track.status ? `${track.label}: ${track.status}` : track.label)),
  ]
  return compactUniqueList([...parameters, ...derived].filter((value): value is string => Boolean(value))).map((value) =>
    displayParameter(t, value),
  )
}

function digestChangeText(reformPackage: ReformPackage, t: TFunction): string {
  return reformPackage.digest?.changed ?? parameterList(reformPackage, t)[0] ?? dossierSummary(reformPackage)
}

function isAmountThresholdOrDeadline(value: string): boolean {
  return /\b(\d+(?:[.,]\d+)?|billion|trillion|million|soums?|uzs|loan|credit|subsidy|incentive|financ|deadline|target|from\s+\d{4}|by\s+\d{4}|until\s+\d{4}|payment|fee|rent|threshold|at least|up to)\b/i.test(
    value,
  )
}

function measureTrackText(track: ReformPackage['measure_tracks'][number]): string {
  const label = humanizeMachineToken(track.label)
  if (!track.status || /^source verified$/i.test(track.status)) return label
  return `${label}: ${humanizeMachineToken(track.status)}`
}

function structuredKeyMeasures(reformPackage: ReformPackage, t: TFunction): KeyMeasureRow[] {
  const visibleParameters = (reformPackage.parameters_or_amounts ?? [])
    .filter(isVisibleMeasure)
    .map((value) => displayParameter(t, value))
  const amountDeadlineValues = compactUniqueList([
    ...(reformPackage.financing_or_incentive ? [reformPackage.financing_or_incentive] : []),
    ...visibleParameters.filter(isAmountThresholdOrDeadline),
  ])
  const parameterMeasures = visibleParameters.filter((value) => !isAmountThresholdOrDeadline(value))
  const fallbackMeasureTracks = reformPackage.measure_tracks.map(measureTrackText)
  const measureValues = compactUniqueList(parameterMeasures.length > 0 ? parameterMeasures : fallbackMeasureTracks)
  const rows: KeyMeasureRow[] = [
    { labelKey: 'whatChanged', values: [digestChangeText(reformPackage, t)] },
    { labelKey: 'whoAffected', values: [reformPackage.digest?.applies_to ?? reformPackage.policy_area] },
    { labelKey: 'effectiveStatus', values: [reformPackage.digest?.effective_status ?? reformPackage.current_stage] },
    { labelKey: 'newRule', values: measureValues },
    { labelKey: 'amountsDeadlines', values: amountDeadlineValues },
    { labelKey: 'officialDocument', values: [reformPackage.digest?.document ?? reformPackage.official_basis] },
  ]

  return rows.filter((row) => row.values.some((value) => value.trim().length > 0))
}

function stageTone(stage: string): 'green' | 'amber' | 'blue' {
  const normalized = stage.toLowerCase()
  if (normalized.includes('adopt') || normalized.includes('approved')) return 'amber'
  if (normalized.includes('verified')) return 'blue'
  return 'green'
}

function compactTimelineLabel(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > 150 ? `${normalized.slice(0, 147)}...` : normalized
}

function isGenericMilestoneLabel(value: string): boolean {
  return /^(official measure recorded|official measure approved|implementation measure recorded|tax incentive source event recorded|previous rule superseded)$/i.test(
    value.trim(),
  )
}

function milestoneDisplayLabel(milestone: ReformPackageMilestone, sourceEvent: ReformPackageSourceEvent | undefined): string {
  if (isGenericMilestoneLabel(milestone.label) && sourceEvent?.title) {
    return compactTimelineLabel(sourceEvent.title)
  }

  return compactTimelineLabel(humanizeMachineToken(milestone.label))
}

function sourceHosts(packages: ReformPackage[]): string[] {
  return uniqueSorted(
    packages.flatMap((reformPackage) => reformPackage.official_source_events.map((event) => hostLabel(event.source_url))),
  )
}

function packagePrimarySource(reformPackage: ReformPackage): ReformPackageSourceEvent | undefined {
  return reformPackage.official_source_events[0]
}

function packageSearchText(reformPackage: ReformPackage, displayTitle: string): string {
  return [
    displayTitle,
    reformPackage.policy_area,
    reformPackage.current_stage,
    reformPackage.legal_basis,
    reformPackage.official_basis,
    reformPackage.financing_or_incentive ?? '',
    reformPackage.responsible_institutions.join(' '),
    reformPackage.measure_tracks.map((track) => `${track.label} ${track.status ?? ''}`).join(' '),
    reformPackage.parameters_or_amounts?.join(' ') ?? '',
    reformPackage.official_source_events.map((event) => `${event.title} ${event.source_institution}`).join(' '),
  ]
    .join(' ')
    .toLowerCase()
}

function packageMatchesFilters(reformPackage: ReformPackage, filters: DossierFilters, allPackages: ReformPackage[]): boolean {
  const displayTitle = dossierDisplayTitle(reformPackage, allPackages)
  const query = filters.search.trim().toLowerCase()
  const primaryHost = hostLabel(packagePrimarySource(reformPackage)?.source_url)
  return (
    (!query || packageSearchText(reformPackage, displayTitle).includes(query)) &&
    (!filters.policyArea || reformPackage.policy_area === filters.policyArea) &&
    (!filters.stage || reformPackage.current_stage === filters.stage) &&
    (!filters.sourceHost || primaryHost === filters.sourceHost)
  )
}

function sourceDiagnosticsSummary(content: KnowledgeHubContent) {
  const diagnostics = content.source_diagnostics ?? []
  return {
    sourceCount: content.meta.sources_configured ?? content.sources?.length ?? diagnostics.length,
    checkedCount: diagnostics.filter((diagnostic) => diagnostic.ok).length,
    brokenLinkCount: diagnostics.reduce((sum, diagnostic) => sum + diagnostic.link_invalid_count, 0),
  }
}

function modelLensMap(content: KnowledgeHubContent): Map<string, KnowledgeHubActiveModelLensId[]> {
  return new Map(
    (content.model_impact_map?.package_links ?? []).map((link) => [
      link.package_id,
      uniqueSorted(link.active_lenses.map((lens) => lens.model_id)) as KnowledgeHubActiveModelLensId[],
    ]),
  )
}

function gatedLenses(content: KnowledgeHubContent): KnowledgeHubGatedModelLensId[] {
  return (content.model_impact_map?.gated_lenses ?? []).map((lens) => lens.id as KnowledgeHubGatedModelLensId)
}

function MetricIcon({ type }: { type: 'dossier' | 'sources' | 'calendar' }) {
  const paths = {
    dossier: 'M7 3h7l4 4v14H7V3zm7 0v5h5M10 12h6M10 16h6',
    sources: 'M4 20h16M6 18V9l6-4 6 4v9M9 18v-6M12 18v-6M15 18v-6M5 9h14',
    calendar: 'M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2zM8 13h3M13 13h3M8 17h3M13 17h3',
  }

  return (
    <svg className="tracker-metric__icon" aria-hidden="true" viewBox="0 0 24 24">
      <path d={paths[type]} />
    </svg>
  )
}

function MetricStrip({ content, packages }: { content: KnowledgeHubContent; packages: ReformPackage[] }) {
  const { t } = useTranslation()
  const sourceSummary = sourceDiagnosticsSummary(content)
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
      value: String(sourceSummary.sourceCount),
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

function LatestChangesSection({ packages, allPackages }: { packages: ReformPackage[]; allPackages: ReformPackage[] }) {
  const { t } = useTranslation()
  const latestPackages = packages.slice(0, 3)

  return (
    <section className="latest-changes" aria-label={t('knowledgeHub.reformTracker.latestChanges.aria')}>
      <header className="section-header section-header--compact">
        <div>
          <h2>{t('knowledgeHub.reformTracker.latestChanges.title')}</h2>
          <p>{t('knowledgeHub.reformTracker.latestChanges.description')}</p>
        </div>
      </header>
      <div className="latest-change-list">
        {latestPackages.map((reformPackage) => {
          const sourceEvent = packagePrimarySource(reformPackage)
          const displayTitle = dossierDisplayTitle(reformPackage, allPackages)
          const firstMeasure = digestChangeText(reformPackage, t)

          return (
            <article key={reformPackage.package_id} className="latest-change-card">
              <header>
                <time dateTime={reformPackage.current_stage_date}>{formatDisplayDate(reformPackage.current_stage_date)}</time>
                <h3>{displayTitle}</h3>
              </header>
              <dl className="change-digest">
                <div>
                  <dt>{t('knowledgeHub.reformTracker.latestChanges.changed')}</dt>
                  <dd>{firstMeasure}</dd>
                </div>
                <div>
                  <dt>{t('knowledgeHub.reformTracker.latestChanges.appliesTo')}</dt>
                  <dd>{reformPackage.digest?.applies_to ?? reformPackage.policy_area}</dd>
                </div>
                <div>
                  <dt>{t('knowledgeHub.reformTracker.latestChanges.effectiveStatus')}</dt>
                  <dd>{reformPackage.digest?.effective_status ?? reformPackage.current_stage}</dd>
                </div>
                <div>
                  <dt>{t('knowledgeHub.reformTracker.latestChanges.document')}</dt>
                  <dd>
                    {sourceEvent ? (
                      <a href={sourceEvent.source_url} className="text-source-link" {...EXTERNAL_LINK_PROPS}>
                        {reformPackage.digest?.document ?? hostLabel(sourceEvent.source_url)}
                      </a>
                    ) : (
                      reformPackage.digest?.document ?? reformPackage.official_basis
                    )}
                  </dd>
                </div>
              </dl>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function TrackerControlsPanel({
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
  const hosts = sourceHosts(packages)

  function updateFilter(key: keyof DossierFilters, value: string) {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <section className="tracker-controls" aria-label={t('knowledgeHub.reformTracker.filters.aria')}>
      <label className="tracker-controls__search">
        <span>{t('knowledgeHub.reformTracker.filters.search')}</span>
        <input
          type="search"
          value={filters.search}
          placeholder={t('knowledgeHub.reformTracker.filters.searchPlaceholder')}
          onChange={(event) => updateFilter('search', event.target.value)}
        />
      </label>
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
        <span>{t('knowledgeHub.reformTracker.filters.status')}</span>
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
        <span>{t('knowledgeHub.reformTracker.filters.source')}</span>
        <select value={filters.sourceHost} onChange={(event) => updateFilter('sourceHost', event.target.value)}>
          <option value="">{t('knowledgeHub.reformTracker.filters.allSources')}</option>
          {hosts.map((host) => (
            <option key={host} value={host}>
              {host}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="tracker-controls__clear"
        onClick={() => onFiltersChange({ search: '', policyArea: '', stage: '', sourceHost: '' })}
      >
        {t('knowledgeHub.reformTracker.filters.clearAll')}
      </button>
    </section>
  )
}

function TimelineChips({ reformPackage }: { reformPackage: ReformPackage }) {
  const { t } = useTranslation()
  const milestones = packageTimeline(reformPackage)

  if (milestones.length === 0) {
    return <p className="empty-state empty-state--compact">{t('knowledgeHub.reformTracker.archive.noTimeline')}</p>
  }

  return (
    <div className="timeline-chip-list">
      {milestones.slice(0, 5).map((milestone) => {
        const sourceEvent = sourceById(reformPackage, milestone.source_event_ids[0] ?? '')
        return (
          <span key={milestone.id} className="timeline-chip">
            <time dateTime={milestone.date}>{formatDisplayDate(milestone.date)}</time>
            <span>{milestoneDisplayLabel(milestone, sourceEvent)}</span>
          </span>
        )
      })}
    </div>
  )
}

function ModelLensChips({
  activeLenses,
  plannedLenses,
}: {
  activeLenses: KnowledgeHubActiveModelLensId[]
  plannedLenses: KnowledgeHubGatedModelLensId[]
}) {
  const { t } = useTranslation()

  return (
    <div className="model-lens-strip">
      <div>
        <span className="model-lens-strip__label">{t('knowledgeHub.reformTracker.archive.possibleLenses')}</span>
        <div className="chip-row">
          {activeLenses.length > 0 ? (
            activeLenses.map((lens) => (
              <span key={lens} className="model-chip model-chip--active">
                {lens}
              </span>
            ))
          ) : (
            <span className="model-chip">{t('knowledgeHub.reformTracker.archive.noActiveLens')}</span>
          )}
        </div>
      </div>
      <div>
        <span className="model-lens-strip__label">{t('knowledgeHub.reformTracker.archive.plannedLenses')}</span>
        <div className="chip-row">
          {plannedLenses.map((lens) => (
            <span key={lens} className="model-chip model-chip--planned">
              {lens}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReformArchive({
  packages,
  allPackages,
  content,
  onClearFilters,
}: {
  packages: ReformPackage[]
  allPackages: ReformPackage[]
  content: KnowledgeHubContent
  onClearFilters: () => void
}) {
  const { t } = useTranslation()
  const activeLensMap = modelLensMap(content)
  const plannedLenses = gatedLenses(content)

  if (packages.length === 0) {
    return (
      <section className="reform-archive reform-archive--empty" aria-label={t('knowledgeHub.reformTracker.archive.aria')}>
        <p className="empty-state empty-state--compact">{t('knowledgeHub.reformTracker.archive.empty')}</p>
        <button type="button" className="ui-secondary-action" onClick={onClearFilters}>
          {t('knowledgeHub.reformTracker.filters.clearAll')}
        </button>
      </section>
    )
  }

  return (
    <section className="reform-archive" aria-label={t('knowledgeHub.reformTracker.archive.aria')}>
      <header className="section-header section-header--compact">
        <div>
          <h2>{t('knowledgeHub.reformTracker.archive.title')}</h2>
          <p>{t('knowledgeHub.reformTracker.archive.showing', { count: packages.length, total: allPackages.length })}</p>
        </div>
      </header>
      <div className="archive-list">
        {packages.map((reformPackage, index) => {
          const sourceEvent = packagePrimarySource(reformPackage)
          const displayTitle = dossierDisplayTitle(reformPackage, allPackages)
          const measureRows = structuredKeyMeasures(reformPackage, t)
          return (
            <details key={reformPackage.package_id} className="archive-item" open={index === 0}>
              <summary className="archive-summary">
                <span className="archive-summary__main">
                  <span className="archive-summary__title">{displayTitle}</span>
                  <span className="archive-summary__meta">
                    <span>{hostLabel(sourceEvent?.source_url)}</span>
                    <time dateTime={reformPackage.current_stage_date}>{formatDisplayDate(reformPackage.current_stage_date)}</time>
                  </span>
                </span>
                <span className={`ui-chip ui-chip--${stageTone(reformPackage.current_stage)}`}>
                  {reformPackage.current_stage}
                </span>
                <span className="archive-summary__chevron" aria-hidden="true">
                </span>
              </summary>
              <div className="archive-body">
                <section>
                  <h3>{t('knowledgeHub.reformTracker.archive.summary')}</h3>
                  <p>{dossierSummary(reformPackage)}</p>
                </section>
                <section>
                  <h3>{t('knowledgeHub.reformTracker.archive.keyMeasures')}</h3>
                  <dl className="structured-measure-list">
                    {measureRows.map((row) => (
                      <div key={row.labelKey}>
                        <dt>{t(`knowledgeHub.reformTracker.archive.keyMeasureLabels.${row.labelKey}`)}</dt>
                        <dd>
                          {row.labelKey === 'officialDocument' && sourceEvent ? (
                            <a href={sourceEvent.source_url} className="text-source-link" {...EXTERNAL_LINK_PROPS}>
                              {row.values[0]}
                            </a>
                          ) : row.values.length === 1 ? (
                            row.values[0]
                          ) : (
                            <ul>
                              {row.values.map((value) => (
                                <li key={value}>{value}</li>
                              ))}
                            </ul>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <section>
                  <h3>{t('knowledgeHub.reformTracker.archive.timeline')}</h3>
                  <TimelineChips reformPackage={reformPackage} />
                </section>
                <section>
                  <h3>{t('knowledgeHub.reformTracker.archive.modelLenses')}</h3>
                  <ModelLensChips
                    activeLenses={activeLensMap.get(reformPackage.package_id) ?? []}
                    plannedLenses={plannedLenses}
                  />
                </section>
                <section className="archive-source-row">
                  <div>
                    <h3>{t('knowledgeHub.reformTracker.archive.source')}</h3>
                    <p>{sourceEvent?.source_institution ?? reformPackage.official_basis}</p>
                  </div>
                  {sourceEvent ? (
                    <a
                      href={sourceEvent.source_url}
                      className="external-source-link"
                      aria-label={t('knowledgeHub.reformTracker.dossier.openOfficialSourceAria', {
                        title: sourceEvent.title,
                      })}
                      {...EXTERNAL_LINK_PROPS}
                    >
                      <span>{t('knowledgeHub.reformTracker.archive.openSource')}</span>
                      <span>{t('knowledgeHub.reformTracker.dossier.sourceLinkMeta', { host: hostLabel(sourceEvent.source_url) })}</span>
                    </a>
                  ) : null}
                </section>
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}

function SupportingInfo({ content, packages }: { content: KnowledgeHubContent; packages: ReformPackage[] }) {
  const { t } = useTranslation()
  const sourceSummary = sourceDiagnosticsSummary(content)
  const rulebook = content.rulebook

  return (
    <section className="tracker-support" aria-label={t('knowledgeHub.reformTracker.support.aria')}>
      <details className="support-panel">
        <summary>{t('knowledgeHub.reformTracker.support.sourcesTitle')}</summary>
        <div className="support-stat-grid">
          <div>
            <strong>{formatCount(sourceSummary.sourceCount)}</strong>
            <span>{t('knowledgeHub.reformTracker.support.sourcesChecked')}</span>
          </div>
          <div>
            <strong>{formatCount(packages.length)}</strong>
            <span>{t('knowledgeHub.reformTracker.support.reforms')}</span>
          </div>
          <div>
            <strong>{formatCount(sourceSummary.brokenLinkCount)}</strong>
            <span>{t('knowledgeHub.reformTracker.support.brokenLinks')}</span>
          </div>
        </div>
      </details>
      <details className="support-panel">
        <summary>{t('knowledgeHub.reformTracker.support.selectionTitle')}</summary>
        <p>{rulebook?.actual_reform_definition ?? t('knowledgeHub.reformTracker.support.selectionFallback')}</p>
      </details>
    </section>
  )
}

function ReformTrackerDesk({ content }: { content: KnowledgeHubContent }) {
  const packages = useMemo(() => content.reform_packages ?? [], [content.reform_packages])
  const [filters, setFilters] = useState<DossierFilters>({
    search: '',
    policyArea: '',
    stage: '',
    sourceHost: '',
  })
  const sortedPackages = useMemo(() => sortReformPackagesNewestFirst(packages), [packages])
  const filteredPackages = useMemo(
    () => sortedPackages.filter((reformPackage) => packageMatchesFilters(reformPackage, filters, sortedPackages)),
    [filters, sortedPackages],
  )
  const clearFilters = () => setFilters({ search: '', policyArea: '', stage: '', sourceHost: '' })

  return (
    <>
      <MetricStrip content={content} packages={packages} />
      <LatestChangesSection packages={sortedPackages} allPackages={sortedPackages} />
      <TrackerControlsPanel filters={filters} onFiltersChange={setFilters} packages={sortedPackages} />
      <ReformArchive
        packages={filteredPackages}
        allPackages={sortedPackages}
        content={content}
        onClearFilters={clearFilters}
      />
      <SupportingInfo content={content} packages={packages} />
    </>
  )
}

function ResearchUpdatesSection({ content }: { content: KnowledgeHubContent }) {
  const { t } = useTranslation()
  const updates = useMemo(() => sortResearchUpdatesNewestFirst(content.research_updates ?? []), [content.research_updates])

  return (
    <section className="hub-detail-panel research-updates-panel" aria-label={t('knowledgeHub.researchUpdates.aria')}>
      <header className="hub-detail-panel__head">
        <div>
          <h2>{t('knowledgeHub.researchUpdates.title')}</h2>
          <p>{t('knowledgeHub.researchUpdates.description')}</p>
        </div>
      </header>

      {updates.length > 0 ? (
        <div className="research-update-list">
          {updates.map((update) => (
            <article key={update.id} className="research-update-row">
              <time dateTime={update.published_at ?? update.as_of_date}>
                {formatDisplayDate(update.published_at ?? update.as_of_date)}
              </time>
              <div className="research-update-row__main">
                <h3>{update.title}</h3>
                <p>{update.why_relevant}</p>
                <a href={update.source_url} className="text-source-link" {...EXTERNAL_LINK_PROPS}>
                  {update.source_title}
                </a>
              </div>
              <dl className="research-update-facts">
                <div>
                  <dt>{t('knowledgeHub.researchUpdates.models')}</dt>
                  <dd>{update.model_ids.join(', ')}</dd>
                </div>
                <div>
                  <dt>{t('knowledgeHub.researchUpdates.methods')}</dt>
                  <dd>{update.methods.join(', ')}</dd>
                </div>
                <div>
                  <dt>{t('knowledgeHub.researchUpdates.source')}</dt>
                  <dd>{update.source_institution}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state empty-state--compact">{t('knowledgeHub.researchUpdates.empty')}</p>
      )}
    </section>
  )
}

function LiteratureHubSection({ content }: { content: KnowledgeHubContent }) {
  const { t } = useTranslation()
  const [selectedModel, setSelectedModel] = useState<ModelLensId | 'all'>('all')
  const literatureItems = useMemo(() => content.literature_items ?? [], [content.literature_items])
  const modelOptions = useMemo<Array<ModelLensId | 'all'>>(
    () => ['all', ...uniqueSorted(literatureItems.flatMap((item) => item.model_ids))] as Array<ModelLensId | 'all'>,
    [literatureItems],
  )
  const items = literatureItems.filter((item) => selectedModel === 'all' || item.model_ids.includes(selectedModel))
  const showModelFilter = modelOptions.length > 2

  return (
    <section className="hub-detail-panel literature-hub-panel" aria-label={t('knowledgeHub.literatureHub.aria')}>
      <header className="hub-detail-panel__head">
        <div>
          <h2>{t('knowledgeHub.literatureHub.title')}</h2>
          <p>{t('knowledgeHub.literatureHub.description')}</p>
        </div>
      </header>

      {showModelFilter ? (
        <div className="literature-filter" role="group" aria-label={t('knowledgeHub.literatureHub.filterAria')}>
          {modelOptions.map((modelId) => (
            <button
              key={modelId}
              type="button"
              className={selectedModel === modelId ? 'is-active' : ''}
              onClick={() => setSelectedModel(modelId)}
            >
              {modelId === 'all' ? t('knowledgeHub.literatureHub.allModels') : modelId}
            </button>
          ))}
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="literature-table-wrap">
          <table className="literature-table">
            <thead>
              <tr>
                <th scope="col">{t('knowledgeHub.literatureHub.model')}</th>
                <th scope="col">{t('knowledgeHub.literatureHub.method')}</th>
                <th scope="col">{t('knowledgeHub.literatureHub.year')}</th>
                <th scope="col">{t('knowledgeHub.literatureHub.source')}</th>
                <th scope="col">{t('knowledgeHub.literatureHub.referenceTitle')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <LiteratureTableRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state empty-state--compact">{t('knowledgeHub.literatureHub.empty')}</p>
      )}
    </section>
  )
}

function LiteratureTableRow({ item }: { item: KnowledgeHubLiteratureItem }) {
  return (
    <tr>
      <td>{item.model_ids.join(', ')}</td>
      <td>{item.methods.join(', ')}</td>
      <td>{item.year}</td>
      <td>{item.source}</td>
      <td>
        <a href={item.url} className="text-source-link" {...EXTERNAL_LINK_PROPS}>
          {item.title}
        </a>
        {item.authors ? <span>{item.authors}</span> : null}
        <p>{item.note}</p>
      </td>
    </tr>
  )
}

export function KnowledgeHubContentView({ content }: KnowledgeHubContentViewProps) {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState<KnowledgeHubSectionId>('reformTracker')

  return (
    <>
      <div className="hub-section-tabs" role="group" aria-label={t('knowledgeHub.sections.aria')}>
        {HUB_SECTIONS.map((sectionId) => (
          <button
            key={sectionId}
            type="button"
            aria-pressed={activeSection === sectionId}
            className={activeSection === sectionId ? 'is-active' : ''}
            onClick={() => setActiveSection(sectionId)}
          >
            {t(`knowledgeHub.sections.${sectionId}`)}
          </button>
        ))}
      </div>
      {activeSection === 'reformTracker' ? <ReformTrackerDesk content={content} /> : null}
      {activeSection === 'researchUpdates' ? <ResearchUpdatesSection content={content} /> : null}
      {activeSection === 'literatureHub' ? <LiteratureHubSection content={content} /> : null}
    </>
  )
}
