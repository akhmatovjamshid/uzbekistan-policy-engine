import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  ScenarioLabIoDemandBucket,
  ScenarioLabIoDistributionMode,
  ScenarioLabIoAnalyticsWorkspace,
  ScenarioLabIoShockResult,
  ScenarioLabIoShockCurrency,
  ScenarioLabIoShockRequest,
} from '../../contracts/data-contract.js'
import type { ScenarioLabIoAnalyticsState } from '../../data/scenario-lab/io-analytics-source.js'
import { runScenarioLabIoDemandShock } from '../../data/scenario-lab/io-analytics-source.js'

type IoSectorShockPanelProps = {
  state: ScenarioLabIoAnalyticsState
  onRetry: () => void
  onSaveRun?: (result: ScenarioLabIoShockResult, workspace: ScenarioLabIoAnalyticsWorkspace) => void
  saveStatus?: string | null
}

const DEMAND_BUCKETS: ScenarioLabIoDemandBucket[] = [
  'consumption',
  'government',
  'investment',
  'export',
]

const DISTRIBUTION_MODES: ScenarioLabIoDistributionMode[] = ['output', 'gva', 'equal', 'sector']
const CURRENCY_OPTIONS: ScenarioLabIoShockCurrency[] = ['bln_uzs', 'mln_usd']
const DEFAULT_EXCHANGE_RATE_UZS_PER_USD = 12_652.7

function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

function formatOptionalNumber(value: number | null): string {
  if (value === null) {
    return 'n/a'
  }
  return formatNumber(value, 0)
}

function contributionStyle(value: number | null, maxValue: number): CSSProperties {
  const magnitude = value === null ? 0 : Math.abs(value)
  const width = maxValue > 0 ? Math.max(4, Math.min(100, (magnitude / maxValue) * 100)) : 0
  return { '--io-bar-width': `${width}%` } as CSSProperties
}

export function IoSectorShockPanel({ state, onRetry, onSaveRun, saveStatus }: IoSectorShockPanelProps) {
  const { t } = useTranslation()
  const [demandBucket, setDemandBucket] = useState<ScenarioLabIoDemandBucket>('export')
  const [amount, setAmount] = useState(1000)
  const [currency, setCurrency] = useState<ScenarioLabIoShockCurrency>('bln_uzs')
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE_UZS_PER_USD)
  const [distribution, setDistribution] = useState<ScenarioLabIoDistributionMode>('output')
  const [sectorCode, setSectorCode] = useState('')

  const selectedSectorCode = state.workspace?.sectors.some((sector) => sector.code === sectorCode)
    ? sectorCode
    : state.workspace?.sectors[0]?.code
  const selectedSector = state.workspace?.sectors.find((sector) => sector.code === selectedSectorCode)

  const request: ScenarioLabIoShockRequest = useMemo(
    () => ({
      demand_bucket: demandBucket,
      amount: Number.isFinite(amount) ? amount : 0,
      currency,
      exchange_rate_uzs_per_usd:
        currency === 'mln_usd' && Number.isFinite(exchangeRate) ? exchangeRate : undefined,
      distribution,
      sector_code: distribution === 'sector' ? selectedSectorCode : undefined,
    }),
    [amount, currency, demandBucket, distribution, exchangeRate, selectedSectorCode],
  )

  const result = useMemo(() => {
    if (state.status !== 'ready') {
      return null
    }
    return runScenarioLabIoDemandShock(state.payload, request)
  }, [request, state])
  const sectorContributionMaxima = useMemo(() => {
    if (!result) {
      return {
        output: 0,
        valueAdded: 0,
        employment: 0,
      }
    }
    return {
      output: Math.max(...result.top_sectors.map((sector) => Math.abs(sector.output_effect_bln_uzs)), 0),
      valueAdded: Math.max(
        ...result.top_sectors.map((sector) => Math.abs(sector.value_added_effect_bln_uzs)),
        0,
      ),
      employment: Math.max(
        ...result.top_sectors.map((sector) => Math.abs(sector.employment_effect_persons ?? 0)),
        0,
      ),
    }
  }, [result])

  if (state.status === 'loading') {
    return (
      <section
        className="scenario-panel scenario-panel--io-shock"
        id="scenario-model-tabpanel-io_sector_shock"
        role="tabpanel"
        aria-labelledby="scenario-model-tab-io_sector_shock"
      >
        <p className="empty-state" role="status" aria-live="polite">
          {t('scenarioLab.ioShock.loading')}
        </p>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section
        className="scenario-panel scenario-panel--io-shock"
        id="scenario-model-tabpanel-io_sector_shock"
        role="tabpanel"
        aria-labelledby="scenario-model-tab-io_sector_shock"
      >
        <div className="scenario-panel__head page-section-head">
          <h2>{t('scenarioLab.ioShock.title')}</h2>
          <p>{t('scenarioLab.ioShock.unavailable')}</p>
        </div>
        <button type="button" className="ui-secondary-action" onClick={onRetry}>
          {t('buttons.retry')}
        </button>
      </section>
    )
  }

  return (
    <section
      className="scenario-panel scenario-panel--io-shock io-shock"
      id="scenario-model-tabpanel-io_sector_shock"
      role="tabpanel"
      aria-labelledby="scenario-model-tab-io_sector_shock"
    >
      <div className="scenario-panel__head page-section-head">
        <h2>{t('scenarioLab.ioShock.title')}</h2>
        <p>{t('scenarioLab.ioShock.description')}</p>
      </div>

      <div className="io-shock__layout">
        <div className="io-shock__controls" aria-label={t('scenarioLab.ioShock.controlsAria')}>
          <fieldset>
            <legend>{t('scenarioLab.ioShock.demandBucket')}</legend>
            <div className="io-shock__segments">
              {DEMAND_BUCKETS.map((bucket) => (
                <button
                  key={bucket}
                  type="button"
                  className={demandBucket === bucket ? 'active' : ''}
                  aria-pressed={demandBucket === bucket}
                  onClick={() => setDemandBucket(bucket)}
                >
                  {t(`scenarioLab.ioShock.buckets.${bucket}`)}
                </button>
              ))}
            </div>
          </fieldset>

          <label>
            <span>{t('scenarioLab.ioShock.amount')}</span>
            <input
              type="number"
              value={amount}
              step={100}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
          </label>

          <label>
            <span>{t('scenarioLab.ioShock.currency')}</span>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as ScenarioLabIoShockCurrency)}
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`scenarioLab.ioShock.currencies.${option}`)}
                </option>
              ))}
            </select>
          </label>

          {currency === 'mln_usd' ? (
            <label>
              <span>{t('scenarioLab.ioShock.exchangeRate')}</span>
              <input
                type="number"
                value={exchangeRate}
                step={10}
                onChange={(event) => setExchangeRate(Number(event.target.value))}
              />
            </label>
          ) : null}

          <label>
            <span>{t('scenarioLab.ioShock.distribution')}</span>
            <select
              value={distribution}
              onChange={(event) => setDistribution(event.target.value as ScenarioLabIoDistributionMode)}
            >
              {DISTRIBUTION_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {t(`scenarioLab.ioShock.distributions.${mode}`)}
                </option>
              ))}
            </select>
          </label>

          {distribution === 'sector' ? (
            <label className="io-shock__sector-select">
              <span>{t('scenarioLab.ioShock.sector')}</span>
              <select value={selectedSectorCode} onChange={(event) => setSectorCode(event.target.value)}>
                {state.workspace.sectors.map((sector) => (
                  <option key={sector.code} value={sector.code}>
                    {sector.code} · {sector.name}
                  </option>
                ))}
              </select>
              <small>{t('scenarioLab.ioShock.sectorHint', { count: state.workspace.sector_count })}</small>
            </label>
          ) : null}

          <div className="io-shock__summary" aria-label={t('scenarioLab.ioShock.summary.title')}>
            <h3>{t('scenarioLab.ioShock.summary.title')}</h3>
            <dl>
              <div>
                <dt>{t('scenarioLab.ioShock.summary.bucket')}</dt>
                <dd>{t(`scenarioLab.ioShock.buckets.${request.demand_bucket}`)}</dd>
              </div>
              <div>
                <dt>{t('scenarioLab.ioShock.summary.amount')}</dt>
                <dd>
                  {formatNumber(request.amount)} {t(`scenarioLab.ioShock.currencies.${request.currency}`)}
                </dd>
              </div>
              {request.currency === 'mln_usd' ? (
                <div>
                  <dt>{t('scenarioLab.ioShock.summary.fx')}</dt>
                  <dd>{formatNumber(request.exchange_rate_uzs_per_usd ?? 0, 1)} UZS/USD</dd>
                </div>
              ) : null}
              <div>
                <dt>{t('scenarioLab.ioShock.summary.distribution')}</dt>
                <dd>{t(`scenarioLab.ioShock.distributions.${request.distribution}`)}</dd>
              </div>
              {request.distribution === 'sector' && selectedSector ? (
                <div>
                  <dt>{t('scenarioLab.ioShock.summary.selectedSector')}</dt>
                  <dd>
                    {selectedSector.code} · {selectedSector.name}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>{t('scenarioLab.ioShock.summary.dataVintage')}</dt>
                <dd>{state.workspace.data_vintage}</dd>
              </div>
            </dl>
          </div>

          <div className="io-shock__boundary">
            <p>{t('scenarioLab.ioShock.boundary')}</p>
            <p>{t('scenarioLab.ioShock.employmentBoundary')}</p>
          </div>
        </div>

        {result ? (
          <div className="io-shock__results">
            <dl className="io-shock__kpis">
              <div>
                <span className="claim-label">{t('scenarioLab.ioShock.claimLabels.output')}</span>
                <dt>{t('scenarioLab.ioShock.kpis.output')}</dt>
                <dd>{formatNumber(result.totals.output_effect_bln_uzs)} bln UZS</dd>
              </div>
              <div>
                <span className="claim-label">{t('scenarioLab.ioShock.claimLabels.output')}</span>
                <dt>{t('scenarioLab.ioShock.kpis.valueAdded')}</dt>
                <dd>{formatNumber(result.totals.value_added_effect_bln_uzs)} bln UZS</dd>
              </div>
              <div>
                <span className="claim-label">{t('scenarioLab.ioShock.claimLabels.gdpContribution')}</span>
                <dt>{t('scenarioLab.ioShock.kpis.gdpContribution')}</dt>
                <dd>{formatNumber(result.totals.gdp_accounting_contribution_bln_uzs)} bln UZS</dd>
              </div>
              <div>
                <span className="claim-label">{t('scenarioLab.ioShock.claimLabels.employment')}</span>
                <dt>{t('scenarioLab.ioShock.kpis.employment')}</dt>
                <dd>{formatOptionalNumber(result.totals.employment_effect_persons)} {t('scenarioLab.ioShock.units.employmentEstimate')}</dd>
              </div>
              <div>
                <span className="claim-label">{t('scenarioLab.ioShock.claimLabels.output')}</span>
                <dt>{t('scenarioLab.ioShock.kpis.multiplier')}</dt>
                <dd>{result.totals.aggregate_output_multiplier?.toFixed(2) ?? 'n/a'}</dd>
              </div>
            </dl>

            <div className="io-shock__meta">
              <span>{state.workspace.framework}</span>
              <span>{state.workspace.data_vintage}</span>
              <span>{state.workspace.sector_count} sectors</span>
              <span>
                {t('scenarioLab.ioShock.convertedShock', {
                  amount: formatNumber(result.totals.demand_shock_bln_uzs),
                })}
              </span>
            </div>

            {onSaveRun ? (
              <div className="io-shock__actions">
                <button type="button" className="ui-secondary-action" onClick={() => onSaveRun(result, state.workspace)}>
                  {t('scenarioLab.ioShock.saveRun')}
                </button>
                {saveStatus ? (
                  <p className="io-shock__save-status" role="status" aria-live="polite">
                    {saveStatus}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="io-shock__table-wrap">
              <h3>{t('scenarioLab.ioShock.topSectors')}</h3>
              <div className="io-shock__meaning">
                <h4>{t('scenarioLab.ioShock.whatThisMeans.title')}</h4>
                <p>
                  {t('scenarioLab.ioShock.whatThisMeans.body', {
                    output: formatNumber(result.totals.output_effect_bln_uzs),
                    valueAdded: formatNumber(result.totals.value_added_effect_bln_uzs),
                    employment: formatOptionalNumber(result.totals.employment_effect_persons),
                  })}
                </p>
              </div>
              <p className="io-shock__source-note">
                {t('scenarioLab.ioShock.sourceLabelNote', {
                  artifact: state.workspace.source_artifact,
                })}
              </p>
              <table className="io-shock__table">
                <thead>
                  <tr>
                    <th>{t('scenarioLab.ioShock.table.rank')}</th>
                    <th>{t('scenarioLab.ioShock.table.sector')}</th>
                    <th>{t('scenarioLab.ioShock.table.output')}</th>
                    <th>{t('scenarioLab.ioShock.table.valueAdded')}</th>
                    <th>{t('scenarioLab.ioShock.table.employment')}</th>
                    <th>{t('scenarioLab.ioShock.table.linkage')}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.top_sectors.map((sector, index) => (
                    <tr key={sector.sector_code}>
                      <td className="io-shock__rank">{index + 1}</td>
                      <th scope="row">
                        <span>{t('scenarioLab.ioShock.table.sectorCode')}: {sector.sector_code}</span>
                        <strong>{t('scenarioLab.ioShock.table.sourceLabel')}: {sector.sector_name}</strong>
                      </th>
                      <td>
                        <span
                          className="io-shock__bar-cell"
                          style={contributionStyle(
                            sector.output_effect_bln_uzs,
                            sectorContributionMaxima.output,
                          )}
                        >
                          <span className="io-shock__bar-cell-track" aria-hidden="true">
                            <span className="io-shock__bar-cell-fill" />
                          </span>
                          <span>{formatNumber(sector.output_effect_bln_uzs)}</span>
                        </span>
                      </td>
                      <td>
                        <span
                          className="io-shock__bar-cell"
                          style={contributionStyle(
                            sector.value_added_effect_bln_uzs,
                            sectorContributionMaxima.valueAdded,
                          )}
                        >
                          <span className="io-shock__bar-cell-track" aria-hidden="true">
                            <span className="io-shock__bar-cell-fill" />
                          </span>
                          <span>{formatNumber(sector.value_added_effect_bln_uzs)}</span>
                        </span>
                      </td>
                      <td>
                        <span
                          className="io-shock__bar-cell"
                          style={contributionStyle(
                            sector.employment_effect_persons,
                            sectorContributionMaxima.employment,
                          )}
                        >
                          <span className="io-shock__bar-cell-track" aria-hidden="true">
                            <span className="io-shock__bar-cell-fill" />
                          </span>
                          <span>{formatOptionalNumber(sector.employment_effect_persons)}</span>
                        </span>
                      </td>
                      <td>{t(`comparison.ioEvidence.linkageClass.${sector.linkage_classification}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <details className="io-shock__caveats">
              <summary>{t('scenarioLab.ioShock.caveats')}</summary>
              <ul>
                {result.caveats.map((caveat) => (
                  <li key={caveat}>{caveat}</li>
                ))}
              </ul>
            </details>
          </div>
        ) : null}
      </div>
    </section>
  )
}
