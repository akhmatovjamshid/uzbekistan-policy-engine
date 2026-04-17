import type { HeadlineMetric } from '../../contracts/data-contract'

type KpiStripProps = {
  metrics: HeadlineMetric[]
}

function formatMetricValue(metric: HeadlineMetric) {
  if (metric.unit === 'UZS/USD') {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(metric.value)
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(metric.value)
}

const DIRECTION_GLYPH: Record<HeadlineMetric['direction'], string> = {
  up: '▲',
  down: '▼',
  flat: '—',
}

const DIRECTION_WORD: Record<HeadlineMetric['direction'], string> = {
  up: 'higher',
  down: 'lower',
  flat: 'unchanged',
}

function formatDelta(metric: HeadlineMetric) {
  if (metric.delta_abs === null) {
    return null
  }
  const sign = metric.delta_abs > 0 ? '+' : metric.delta_abs < 0 ? '−' : ''
  const magnitude = Math.abs(metric.delta_abs)
  const precision = metric.unit === 'UZS/USD' ? 0 : 1
  return `${sign}${magnitude.toFixed(precision)}`
}

export function KpiStrip({ metrics }: KpiStripProps) {
  return (
    <section aria-labelledby="overview-kpi-title">
      <div className="overview-section-head">
        <h2 id="overview-kpi-title">Core indicators</h2>
        <p>Current values and period-over-period change. Interpretation depends on the metric.</p>
      </div>

      <div className="overview-kpi-grid">
        {metrics.map((metric) => {
          const delta = formatDelta(metric)
          const srLabel = delta
            ? `${DIRECTION_WORD[metric.direction]} by ${delta} versus prior period`
            : 'No prior value'
          return (
            <article key={metric.metric_id} className="overview-kpi-card">
              <div className="overview-kpi-card__top">
                <p className="overview-kpi-card__label">{metric.label}</p>
                <span className="overview-kpi-trend" aria-label={srLabel}>
                  <span className="overview-kpi-trend__glyph" aria-hidden="true">
                    {DIRECTION_GLYPH[metric.direction]}
                  </span>
                  <span>{delta ?? 'n/a'}</span>
                </span>
              </div>
              <p className="overview-kpi-card__value">
                {formatMetricValue(metric)} <span>{metric.unit}</span>
              </p>
              <div className="overview-kpi-card__meta">
                <span>{metric.period}</span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
