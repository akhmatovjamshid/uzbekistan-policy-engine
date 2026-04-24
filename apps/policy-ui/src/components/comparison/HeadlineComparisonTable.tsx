import type {
  ComparisonMetricDefinition,
  ComparisonScenario,
  ComparisonScenarioTag,
} from '../../contracts/data-contract'
import { useTranslation } from 'react-i18next'

type HeadlineComparisonTableProps = {
  metrics: ComparisonMetricDefinition[]
  selectedScenarios: ComparisonScenario[]
  baselineId: string
  tagsByScenarioId: Record<string, ComparisonScenarioTag>
}

const TIE_TOLERANCE = 1e-9

function formatValue(value: number, unit: string) {
  if (unit === 'UZS/USD') {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)
}

function formatDelta(delta: number, unit: string) {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : ''
  if (unit === 'UZS/USD') {
    return `${sign}${Math.round(Math.abs(delta))}`
  }
  return `${sign}${Math.abs(delta).toFixed(1)}`
}

function directionGlyph(delta: number) {
  if (delta > 0) return '▲'
  if (delta < 0) return '▼'
  return '—'
}

function toTagLabelKey(tag: ComparisonScenarioTag) {
  if (tag === 'preferred') return 'comparison.selector.tag.preferred'
  if (tag === 'balanced') return 'comparison.selector.tag.balanced'
  if (tag === 'aggressive') return 'comparison.selector.tag.aggressive'
  return 'comparison.selector.tag.downside_stress'
}

function isLowerBetterMetric(metricId: string): boolean {
  return metricId === 'inflation' || metricId === 'policy_rate' || metricId === 'exchange_rate'
}

function resolveBestValue(metricId: string, selectedScenarios: ComparisonScenario[]): number | null {
  const values = selectedScenarios
    .map((scenario) => scenario.values[metricId])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))

  if (values.length === 0) {
    return null
  }

  if (isLowerBetterMetric(metricId)) {
    return Math.min(...values)
  }
  return Math.max(...values)
}

function isBestValue(value: number, bestValue: number | null): boolean {
  if (bestValue === null) {
    return false
  }
  return Math.abs(value - bestValue) <= TIE_TOLERANCE
}

export function HeadlineComparisonTable({
  metrics,
  selectedScenarios,
  baselineId,
  tagsByScenarioId,
}: HeadlineComparisonTableProps) {
  const { t } = useTranslation()
  const baseline = selectedScenarios.find((scenario) => scenario.scenario_id === baselineId)
  if (!baseline) {
    return (
      <section className="comparison-panel" aria-labelledby="comparison-headline-title">
        <div className="comparison-panel__head page-section-head">
          <h2 id="comparison-headline-title">{t('comparison.headline.title')}</h2>
          <p>{t('comparison.headline.description')}</p>
        </div>
        <p className="empty-state">{t('comparison.headline.emptyBaseline')}</p>
      </section>
    )
  }

  const alternatives = selectedScenarios.filter((scenario) => scenario.scenario_id !== baselineId)
  const kpiMetrics = metrics.slice(0, 4)

  return (
    <section className="comparison-panel" aria-labelledby="comparison-headline-title">
      <div className="comparison-panel__head page-section-head">
        <h2 id="comparison-headline-title">{t('comparison.headline.title')}</h2>
        <p>{t('comparison.headline.description')}</p>
      </div>

      {alternatives.length === 0 ? (
        <p className="empty-state">{t('comparison.headline.emptyAlternative')}</p>
      ) : null}

      <div className="comparison-kpi-grid" aria-label={t('comparison.headline.kpiGridAria')}>
        {kpiMetrics.map((metric) => {
          const baselineValue = baseline.values[metric.metric_id]
          const alternativeValues = alternatives
            .map((scenario) => scenario.values[metric.metric_id])
            .filter((value): value is number => Number.isFinite(value))
          const averageAlternative =
            alternativeValues.length > 0
              ? alternativeValues.reduce((sum, value) => sum + value, 0) / alternativeValues.length
              : null
          const delta =
            typeof baselineValue === 'number' && averageAlternative !== null
              ? averageAlternative - baselineValue
              : null
          return (
            <article key={metric.metric_id} className="comparison-kpi-card">
              <span>{metric.label}</span>
              <strong>
                {typeof baselineValue === 'number' ? formatValue(baselineValue, metric.unit) : '—'}
              </strong>
              <small>
                {delta === null
                  ? t('comparison.headline.noDelta')
                  : t('comparison.headline.avgDelta', { delta: formatDelta(delta, metric.unit) })}
              </small>
            </article>
          )
        })}
      </div>

      <div className="comparison-headline-table-wrap">
        <table className="comparison-headline-table">
          <caption className="sr-only">
            {t('comparison.headline.caption')}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t('comparison.headline.metricColumn')}</th>
              <th scope="col" className="comparison-headline-table__baseline-col">
                {baseline.scenario_name}
                <span className="comparison-headline-table__subhead">
                  {t('comparison.selector.baselineBadge')}
                </span>
              </th>
              {alternatives.map((scenario) => (
                <th key={scenario.scenario_id} scope="col">
                  {scenario.scenario_name}
                  <span className="comparison-headline-table__subhead">
                    {t(toTagLabelKey(tagsByScenarioId[scenario.scenario_id] ?? scenario.initial_tag))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => {
              const baselineValue = baseline.values[metric.metric_id]
              const baselineHasValue = typeof baselineValue === 'number'
              const bestValue = resolveBestValue(metric.metric_id, selectedScenarios)
              return (
                <tr key={metric.metric_id}>
                  <th scope="row">
                    {metric.label}
                    <span className="comparison-headline-table__unit">{metric.unit}</span>
                  </th>
                  <td className="comparison-headline-table__baseline-col">
                    {baselineHasValue ? (
                      <>
                        {formatValue(baselineValue, metric.unit)}
                        {isBestValue(baselineValue, bestValue) ? (
                          <span className="comparison-headline-table__star" aria-hidden="true">
                            ★
                          </span>
                        ) : null}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  {alternatives.map((scenario) => {
                    const value = scenario.values[metric.metric_id]
                    const scenarioHasValue = typeof value === 'number'
                    if (!scenarioHasValue) {
                      return (
                        <td key={scenario.scenario_id}>
                          <span
                            className="comparison-headline-table__value"
                            aria-label={t('comparison.headline.notAvailable')}
                          >
                            —
                          </span>
                        </td>
                      )
                    }
                    if (!baselineHasValue) {
                      return (
                        <td key={scenario.scenario_id}>
                          <span className="comparison-headline-table__value">
                            {formatValue(value, metric.unit)}
                          </span>
                          <span
                            className="comparison-headline-table__delta"
                            aria-label={t('comparison.headline.baselineUnavailable')}
                          >
                            <span aria-hidden="true">—</span>
                            <span>{t('comparison.headline.notAvailableShort')}</span>
                          </span>
                        </td>
                      )
                    }
                    const delta = value - baselineValue
                    const deltaText = formatDelta(delta, metric.unit)
                    return (
                      <td key={scenario.scenario_id}>
                        <span className="comparison-headline-table__value">
                          {formatValue(value, metric.unit)}
                          {isBestValue(value, bestValue) ? (
                            <span className="comparison-headline-table__star" aria-hidden="true">
                              ★
                            </span>
                          ) : null}
                        </span>
                        <span
                          className="comparison-headline-table__delta"
                          aria-label={t('comparison.headline.deltaAria', { delta: deltaText })}
                        >
                          <span aria-hidden="true">{directionGlyph(delta)}</span>
                          <span>{deltaText}</span>
                        </span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
